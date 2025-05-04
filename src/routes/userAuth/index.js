import express from "express";
import {createUser, login, loginWithGoogle, logout, twitterAuth, twitterCallBackAuth, verifyUser,googleAuth} from "./controller/index.js";
const authRouter = express.Router();

authRouter.post("/register", createUser);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.get("/verify/:token", verifyUser);
authRouter.get('/google', googleAuth);
authRouter.get('/google-login', loginWithGoogle);
authRouter.get('/twitter', twitterAuth);
authRouter.get('/twitter/callback', twitterCallBackAuth);

export default authRouter;
