import express from "express";
import { createTransaction, getAllTransactionOfUser, updateTransaction } from "./controller/index.js";
const transactionRouter = express.Router();

transactionRouter.post("/", createTransaction);
transactionRouter.post("/update",updateTransaction);
transactionRouter.get("/:id",getAllTransactionOfUser);

export default transactionRouter;