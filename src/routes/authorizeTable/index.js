import express from "express";
import { insertAuthorizeRecord} from "./controller/index.js";
const authorizeAccountRouter = express.Router();

authorizeAccountRouter.post("/accountant", insertAuthorizeRecord);

export default authorizeAccountRouter;