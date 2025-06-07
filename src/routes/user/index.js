import express from "express";
import {deleteUser,getAllUser,getByIdUser,updateUser, getAllAccountant, usersAuthAccountants, AccountantsAuthUsers,getAccountantByEmail,sendEmailForDeleteUser, confirmDeleteAccount} from "./controller/index.js";
import verifyToken from "../../middleware/verifyAuth.js";


const userRouter = express.Router();

userRouter.get("/", getAllUser);
userRouter.get("/user-details", usersAuthAccountants);
userRouter.get("/accountant-details", AccountantsAuthUsers);
userRouter.get("/accountants", getAllAccountant);
userRouter.get("/:id", getByIdUser);
userRouter.put("/:id", updateUser);
// userRouter.delete("/:id", deleteUser);
userRouter.get("/accountants/:id", getAllAccountant);
userRouter.get("/accountant-by-email/:email", getAccountantByEmail);
userRouter.post("/sendmail-for-delete-user", verifyToken, sendEmailForDeleteUser);
userRouter.delete("/confirm-delete", confirmDeleteAccount);


export default userRouter;
