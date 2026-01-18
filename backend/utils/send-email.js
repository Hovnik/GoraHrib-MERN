import nodemailer from "nodemailer";

let transporter = null;
let transporterInitialized = false;

// Initialize transporter lazily (on first use) to ensure env vars are loaded
function getTransporter() {
  if (transporterInitialized) {
    return transporter;
  }

  transporterInitialized = true;

  const isEmailConfigured =
    process.env.EMAIL_USER &&
    process.env.EMAIL_PASS &&
    process.env.EMAIL_USER !== "your-email@gmail.com";

  if (isEmailConfigured) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    console.log(
      `send-email: transporter initialized for ${process.env.EMAIL_USER}`
    );
  } else {
    console.log("send-email: no valid email config, will use console fallback");
  }

  return transporter;
}

const sendVerificationEmail = async (email, url) => {
  const trans = getTransporter();

  if (!trans) {
    // In development without email config, just log the URL
    console.log("\n🔗 EMAIL VERIFICATION LINK (email not configured):");
    console.log(`   User: ${email}`);
    console.log(`   URL: ${url}\n`);
    return;
  }

  await trans.sendMail({
    to: email,
    subject: "GoraHrib - Potrdi svoj email",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Potrdi email - GoraHrib</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                
                <!-- Header with logo -->
                <tr>
                  <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);">
                    <img src="${process.env.CLIENT_URL}/favicon-32x32.png" alt="GoraHrib" style="width: 48px; height: 48px; margin-bottom: 16px;">
                    <h1 style="margin: 0; color: #15803d; font-size: 32px; font-weight: bold;">GoraHrib</h1>
                  </td>
                </tr>
                
                <!-- Main content -->
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">Potrdi svoj email</h2>
                    <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                      Živjo! 👋
                    </p>
                    <p style="margin: 0 0 30px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                      Hvala za registracijo! Klikni na spodnji gumb, da potrdiš svoj email in začneš uporabljati GoraHrib.
                    </p>
                    
                    <!-- CTA Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="${url}" style="display: inline-block; padding: 16px 40px; background-color: #22c55e; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 2px 4px rgba(34, 197, 94, 0.3);">
                            Potrdi Email
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="margin: 30px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                      <strong>Pomembno:</strong> Ta povezava bo potekla čez 24 ur.
                    </p>
                    
                    <!-- Alternative link -->
                    <p style="margin: 20px 0 0; color: #9ca3af; font-size: 13px; line-height: 1.6;">
                      Če gumb ne deluje, kopiraj in prilepi to povezavo v brskalnik:<br>
                      <a href="${url}" style="color: #22c55e; word-break: break-all;">${url}</a>
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 30px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center;">
                    <p style="margin: 0; color: #6b7280; font-size: 14px;">
                      &copy; GoraHrib
                    </p>
                    <p style="margin: 8px 0 0; color: #6b7280; font-size: 14px;">
                      Narejeno z <span style="color: #ef4444;">♥</span> v Sloveniji
                    </p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  });
  console.log(`✅ Email sent to ${email} via ${process.env.EMAIL_USER}`);
};

const sendNewPasswordEmail = async (email, newPassword) => {
  const trans = getTransporter();

  if (!trans) {
    // In development without email config, just log the new password
    console.log("\n🔑 NEW PASSWORD (email not configured):", newPassword);
    console.log(`   User: ${email}\n`);
    return;
  }

  await trans.sendMail({
    to: email,
    subject: "GoraHrib - Novo geslo",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Novo geslo - GoraHrib</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                
                <!-- Header with logo -->
                <tr>
                  <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);">
                    <img src="${process.env.CLIENT_URL}/favicon-32x32.png" alt="GoraHrib" style="width: 48px; height: 48px; margin-bottom: 16px;">
                    <h1 style="margin: 0; color: #15803d; font-size: 32px; font-weight: bold;">GoraHrib</h1>
                  </td>
                </tr>
                
                <!-- Main content -->
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">Ponastavitev gesla</h2>
                    <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                      Živjo! 👋
                    </p>
                    <p style="margin: 0 0 30px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                      Prejeli smo zahtevo za ponastavitev gesla. Vaše novo začasno geslo je:
                    </p>
                    
                    <!-- Password Box -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <div style="display: inline-block; padding: 20px 40px; background-color: #f9fafb; border: 2px solid #22c55e; border-radius: 8px; font-family: 'Courier New', monospace; font-size: 24px; font-weight: bold; color: #15803d; letter-spacing: 2px;">
                            ${newPassword}
                          </div>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="margin: 30px 0 0; color: #dc2626; font-size: 14px; line-height: 1.6; background-color: #fef2f2; padding: 12px; border-radius: 6px; border-left: 4px solid #dc2626;">
                      <strong>⚠️ Pomembno:</strong> Iz varnostnih razlogov to geslo čim prej spremenite po prijavi v nastavitvah profila.
                    </p>
                    
                    <p style="margin: 20px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                      Če niste zahtevali ponastavitve gesla, kontaktirajte nas takoj.
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 30px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center;">
                    <p style="margin: 0; color: #6b7280; font-size: 14px;">
                      &copy; GoraHrib
                    </p>
                    <p style="margin: 8px 0 0; color: #6b7280; font-size: 14px;">
                      Narejeno z <span style="color: #ef4444;">♥</span> v Sloveniji
                    </p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  });
  console.log(
    `✅ New password email sent to ${email} via ${process.env.EMAIL_USER}`
  );
};

export { sendVerificationEmail, sendNewPasswordEmail };
