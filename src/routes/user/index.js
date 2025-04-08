import express from "express";
import {createUser,deleteUser,getAllUser,getByIdUser,updateUser, getAllAccountant} from "./controller/index.js";
import verifyToken from "../../middleware/verifyAuth.js";

const userRouter = express.Router();

userRouter.post("/", createUser);
userRouter.get("/", getAllUser);
userRouter.get("/accountants", getAllAccountant);
userRouter.get("/:id", getByIdUser);
userRouter.put("/:id", updateUser);
userRouter.delete("/:id", deleteUser);
userRouter.get("/accountants", getAllAccountant);

export default userRouter;
