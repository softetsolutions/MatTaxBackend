import express from "express";
import {
  createAccountNo,
  getAccountNo,
  getAccountNoById,
  updateAccountNo,
  deleteAccountNo,
} from "./controller/index.js";
import verifyToken from "../../middleware/verifyAuth.js";

const accountNoRouter = express.Router();

accountNoRouter.post("/create", createAccountNo); 
accountNoRouter.get("/gets", getAccountNo);
accountNoRouter.get("/getbyId/:id", getAccountNoById);
accountNoRouter.put("/update/:id", updateAccountNo);
accountNoRouter.delete("/delete/:id", deleteAccountNo);

export default accountNoRouter;
