import express from "express";
import { createTransaction, getAllTransactionOfUser, updateTransaction, deleteTransaction, getDeletedTransaction, restoreTransaction, deleteTransactionPermanently, getTransactionLogByTransactionId } from "./controller/index.js";
const transactionRouter = express.Router();

transactionRouter.post("/", createTransaction);
transactionRouter.post("/update",updateTransaction);
transactionRouter.delete("/",deleteTransaction);
transactionRouter.get("/deleted", getDeletedTransaction);
transactionRouter.get("/transactionLog", getTransactionLogByTransactionId)
transactionRouter.get("/", getAllTransactionOfUser);
transactionRouter.patch("/restore", restoreTransaction);
transactionRouter.delete("/deletePermanently", deleteTransactionPermanently);

export default transactionRouter;