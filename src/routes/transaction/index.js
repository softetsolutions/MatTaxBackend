import express from "express";
import { createTransaction, getAllTransactionOfUser, updateTransaction, deleteTransaction, getDeletedTransaction, restoreTransaction, deleteTransactionPermanently, getTransactionLogByTransactionId, importTransactionCSV } from "./controller/index.js";
import upload from "../../middleware/upload.js";
const transactionRouter = express.Router();

transactionRouter.post("/", upload.single("file"), createTransaction);
transactionRouter.post("/update",updateTransaction);
transactionRouter.post("/import", upload.single("file"), importTransactionCSV);
transactionRouter.delete("/",deleteTransaction);
transactionRouter.get("/deleted", getDeletedTransaction);
transactionRouter.get("/transactionLog", getTransactionLogByTransactionId);
transactionRouter.get("/", getAllTransactionOfUser);
transactionRouter.patch("/restore", restoreTransaction);
transactionRouter.delete("/deletePermanently", deleteTransactionPermanently);

export default transactionRouter;