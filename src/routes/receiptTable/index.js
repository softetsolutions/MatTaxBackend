import express from "express";
import upload from "../../middleware/upload.js";
import { deleteReceipt, updateReceipt, getReceipt, getTransactionDetailsFromReciept } from "./controller/index.js";

const receiptRouter = express.Router();

receiptRouter.delete("/:id", deleteReceipt);
receiptRouter.get("/get/:id", getReceipt);
receiptRouter.put("/:id", upload.single("file"), updateReceipt); 
receiptRouter.get("/extraction", upload.single("file"), getTransactionDetailsFromReciept); 

export default receiptRouter;
