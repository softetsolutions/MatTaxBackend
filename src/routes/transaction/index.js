import express from "express";
import { createTransaction, getAllTransactionOfUser, updateTransaction, deleteTransaction, getDeletedTransaction, getAllTransactions } from "./controller/index.js";
const transactionRouter = express.Router();

transactionRouter.post("/", createTransaction);
transactionRouter.post("/update",updateTransaction);
transactionRouter.get("/:id",getAllTransactionOfUser);
transactionRouter.delete("/",deleteTransaction);
transactionRouter.get("/deleted", getDeletedTransaction);
transactionRouter.get("/", getAllTransactions);

export default transactionRouter;