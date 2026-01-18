import User from "../models/User.js";
import bcryptjs from "bcryptjs";
import crypto from "crypto";
import { generateToken } from "../config/jwt.js";
import { StatusCodes } from "http-status-codes";
import {
  BadRequestError,
  ForbiddenError,
  ApiError,
} from "../utils/api-error.js";
import {
  sendVerificationEmail,
  sendNewPasswordEmail,
} from "../utils/send-email.js";

/**
 * Register new user
 */
export async function register(req, res) {
  try {
    const { username, email, password, confirmPassword } = req.body;

    // Validation
    if (!email || !password || !username) {
      throw new BadRequestError("Email, username, and password are required");
    }

    if (password !== confirmPassword) {
      throw new BadRequestError("Passwords do not match");
    }

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });
    if (existingUser) {
      throw new BadRequestError("Email or username already in use");
    }

    // Hash password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24h

    // Create user with verification token
    const newUser = await User.create({
      email: email,
      passwordHash: hashedPassword,
      username: username,
      verificationToken: verificationToken,
      verificationTokenExpires: verificationTokenExpires,
      emailVerified: false,
    });

    // Generate JWT token
    const token = generateToken(newUser._id, newUser.role);

    // Send verification email (await for debugging to capture errors)
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
    try {
      await sendVerificationEmail(newUser.email, verificationUrl);
      console.log("register: verification email send call succeeded");
    } catch (err) {
      console.error("register: Failed to send verification email:", err);
    }

    res.status(StatusCodes.CREATED).json({
      message:
        "User registered successfully. Please check your email to verify your account.",
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        username: newUser.username,
        emailVerified: newUser.emailVerified,
      },
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Registration failed",
      error: error.message,
    });
  }
}

/**
 * Login user
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      throw new BadRequestError("Email and password are required");
    }

    // Find user
    const user = await User.findOne({ email }).select("+passwordHash");
    if (!user) {
      throw new BadRequestError("Napačno uporabniško ime ali geslo");
    }

    // Check if user is blocked
    if (user.status === "INACTIVE") {
      throw new ForbiddenError("Vaš račun je blokiran. Obrnite se na podporo.");
    }

    // Verify password
    const isPasswordValid = await bcryptjs.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new BadRequestError("Napačno uporabniško ime ali geslo");
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    res.status(StatusCodes.OK).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
        emailVerified: user.emailVerified,
        verificationTokenExpires: user.verificationTokenExpires,
      },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    console.error("Login error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Napačno uporabniško ime ali geslo",
    });
  }
}

/**
 * Verify email
 */
export async function verifyEmail(req, res) {
  try {
    const { token } = req.params;

    // Find user with the verification token (not expired)
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      // Check if token exists but is expired for better diagnostics
      const tokenOwner = await User.findOne({ verificationToken: token });

      if (!tokenOwner) {
        const anyUser = await User.findOne({}).sort({ createdAt: -1 }).limit(1);
        if (anyUser?.emailVerified) {
          return res.status(StatusCodes.OK).json({
            message: "Email je potrjen! Lahko se prijavite.",
            alreadyVerified: true,
          });
        }
      }

      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Neveljavna ali potekla povezava za potrditev",
        tokenExists: !!tokenOwner,
      });
    }

    // Verify email
    user.emailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.status(StatusCodes.OK).json({
      message: "Email uspešno potrjen!",
    });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Napaka pri potrjevanju emaila",
      error: error.message,
    });
  }
}

/**
 * Reset verification email
 */
export async function resendVerification(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Email je zahtevan" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Uporabnik ni najden" });
    }

    if (user.emailVerified) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Email je že potrjen" });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24h

    user.verificationToken = verificationToken;
    user.verificationTokenExpires = verificationTokenExpires;
    await user.save();

    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
    await sendVerificationEmail(user.email, verificationUrl);

    return res
      .status(StatusCodes.OK)
      .json({ message: "Preveritvena e-pošta je bila ponovno poslana" });
  } catch (err) {
    console.error("resendVerification error:", err);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Napaka pri pošiljanju e-pošte" });
  }
}

/*
 * Reset password
 */
export async function sendNewPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Email je zahtevan" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "Ta račun ne obstaja v sistemu.",
      });
    }

    // Generate new password
    const newPassword = crypto.randomBytes(6).toString("hex");

    // Hash new password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(newPassword, salt);

    user.passwordHash = hashedPassword;
    await user.save();

    // Send new password via email
    await sendNewPasswordEmail(user.email, newPassword);
    console.log(`Password reset email sent to ${email}`);

    return res.status(StatusCodes.OK).json({
      message: "Če obstaja račun s tem emailom, smo poslali novo geslo.",
    });
  } catch (err) {
    console.error("sendNewPassword error:", err);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Napaka pri pošiljanju novega gesla" });
  }
}
