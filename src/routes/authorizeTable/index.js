import express from "express";
import { insertAuthorizeRecord} from "./controller/index.js";
const authorizeAccountRouter = express.Router();

authorizeAccountRouter.post("/auth", insertAuthorizeRecord);

export default authorizeAccountRouter;