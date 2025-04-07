import express from "express";
import transaction from "./controller/index.js";
const { createTransaction, getAllTransactionOfUser, updateTransaction, deleteTransaction, getDeletedTransaction, getAllTransactions } = transaction;
const transactionRouter = express.Router();

transactionRouter.post("/", createTransaction);
transactionRouter.post("/update",updateTransaction);
transactionRouter.get("/:id",getAllTransactionOfUser);
transactionRouter.delete("/:id",deleteTransaction);
transactionRouter.get("/deleted", getDeletedTransaction);
transactionRouter.get("/", getAllTransactions);

export default transactionRouter;