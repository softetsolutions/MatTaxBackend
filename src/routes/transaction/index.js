import express from "express";
import { createTransaction, getAllTransactionOfUser, updateTransaction, deleteTransaction, getDeletedTransaction, restoreTransaction, deleteTransactionPermanently } from "./controller/index.js";
const transactionRouter = express.Router();

transactionRouter.post("/", createTransaction);
transactionRouter.post("/update",updateTransaction);
transactionRouter.delete("/",deleteTransaction);
transactionRouter.get("/deleted", getDeletedTransaction);
transactionRouter.get("/", getAllTransactionOfUser);
transactionRouter.patch("/restore", restoreTransaction);
transactionRouter.delete("/deletePermanently", deleteTransactionPermanently);

export default transactionRouter;