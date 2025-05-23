import express from "express";
import {deleteUser,getAllUser,getByIdUser,updateUser, getAllAccountant, usersAuthAccountants, AccountantsAuthUsers,getAccountantByEmail} from "./controller/index.js";
import verifyToken from "../../middleware/verifyAuth.js";

const userRouter = express.Router();

userRouter.get("/", getAllUser);
userRouter.get("/user-details", usersAuthAccountants);
userRouter.get("/accountant-details", AccountantsAuthUsers);
userRouter.get("/accountants", getAllAccountant);
userRouter.get("/:id", getByIdUser);
userRouter.put("/:id", updateUser);
userRouter.delete("/:id", deleteUser);
userRouter.get("/accountants/:id", getAllAccountant);
authRouter.get("/accountant/email/:email/:id", getAccountantByEmail);



export default userRouter;
