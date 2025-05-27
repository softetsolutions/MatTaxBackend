import express from "express";
import {createUser, login, loginWithGoogle, logout, twitterAuth, twitterCallBackAuth, verifyUser,googleAuth, forgotPassword, resetPassword, deleteAccount, deviceRegister} from "./controller/index.js";
const authRouter = express.Router();

authRouter.post("/device/register", deviceRegister);
authRouter.post("/register", createUser);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.get("/verify/:token", verifyUser);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password", resetPassword);
authRouter.post("/delete-account", deleteAccount);
authRouter.get('/google', googleAuth);
authRouter.get('/google-login', loginWithGoogle);
authRouter.get('/twitter', twitterAuth);
authRouter.get('/twitter/callback', twitterCallBackAuth);

export default authRouter;
