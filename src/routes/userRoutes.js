import express from "express";
import user from "../controllers/userController.js";
import verifyToken from "../Auth/verifyAuth.js";

const {createUser,deleteUser,getAllUser,getByIdUser,updateUser} = user;
const userRouter = express.Router();

userRouter.post("/", createUser);
userRouter.get("/",verifyToken, getAllUser);
userRouter.get("/:id", getByIdUser);
userRouter.put("/:id", updateUser);
userRouter.delete("/:id", deleteUser);

export default userRouter;
