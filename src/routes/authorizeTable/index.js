import express from "express";
import { insertAuthorizeRecord, DeAuthorizeRecord, getAllInvitation, updateStatus, getAllAuthorizeUser} from "./controller/index.js";
const authorizeAccountRouter = express.Router();

authorizeAccountRouter.post("/auth", insertAuthorizeRecord);
authorizeAccountRouter.get("/get-authorize-user/:id",getAllAuthorizeUser);
authorizeAccountRouter.delete("/remove-auth", DeAuthorizeRecord);
authorizeAccountRouter.get("/getall-invitation/:id",getAllInvitation);
authorizeAccountRouter.put("/update-status",updateStatus);
export default authorizeAccountRouter;