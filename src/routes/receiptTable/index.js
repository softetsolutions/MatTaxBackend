import express from "express";
import upload from "../../middleware/upload.js";
import { deleteReceipt, updateReceipt } from "./controller/index.js";

const receiptRouter = express.Router();

receiptRouter.delete("/:id", deleteReceipt);
receiptRouter.put("/:id", upload.single("file"), updateReceipt); 

export default receiptRouter;
