import mongoose from "mongoose";

// utils/transaction-helper.js
export async function executeTransaction(transactionCallback) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const result = await transactionCallback(session); // pass session to callback
    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
