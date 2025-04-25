import express from "express";
import {accountIsLock} from "./controller/index.js";
const adminRouter = express.Router();

adminRouter.post("/account-lock-unlock", accountIsLock);

export default adminRouter;