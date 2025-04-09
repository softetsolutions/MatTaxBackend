import express from "express";
import { createTransaction, getAllTransactionOfUser, updateTransaction, deleteTransaction, getDeletedTransaction } from "./controller/index.js";
const transactionRouter = express.Router();

transactionRouter.post("/", createTransaction);
transactionRouter.post("/update",updateTransaction);
transactionRouter.delete("/",deleteTransaction);
transactionRouter.get("/deleted", getDeletedTransaction);
transactionRouter.get("/", getAllTransactionOfUser);

export default transactionRouter;