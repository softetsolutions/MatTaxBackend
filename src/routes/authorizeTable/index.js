import express from "express";
import { insertAuthorizeRecord, DeAuthorizeRecord} from "./controller/index.js";
const authorizeAccountRouter = express.Router();

authorizeAccountRouter.post("/auth", insertAuthorizeRecord);
authorizeAccountRouter.delete("/remove-auth", DeAuthorizeRecord);

export default authorizeAccountRouter;