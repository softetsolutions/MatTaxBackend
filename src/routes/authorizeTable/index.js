import express from "express";
import authorizeTableController from "./controller/index.js";
const { insertAuthorizeRecord} = authorizeTableController;
const authorizeAccountRouter = express.Router();

authorizeAccountRouter.post("/accountant", insertAuthorizeRecord);

export default authorizeAccountRouter;