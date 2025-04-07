import express from "express";
import user from "./controller/index.js";
import verifyToken from "../../middleware/verifyAuth.js";

const {createUser,deleteUser,getAllUser,getByIdUser,updateUser,getAllAccountant} = user;
const userRouter = express.Router();

userRouter.post("/", createUser);
userRouter.get("/", getAllUser);
userRouter.get("/:id", getByIdUser);
userRouter.put("/:id", updateUser);
userRouter.delete("/:id", deleteUser);
userRouter.get("/accountants", getAllAccountant);

export default userRouter;
