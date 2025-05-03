import express from "express";
import {createUser, login, loginWithGoogle, logout, twitterAuth, twitterCallBackAuth, verifyUser} from "./controller/index.js";
import passport from "passport";
const authRouter = express.Router();

authRouter.post("/register", createUser);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.get("/verify/:token", verifyUser);
authRouter.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
authRouter.get('/google/callback', passport.authenticate('google', { failureRedirect: (req, res) => { return res.json({ Error: 'error' }) } }),(req,res)=>res.json({message:"logined"}));
// authRouter.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));
// authRouter.get('/facebook/callback', passport.authenticate('facebook', { failureRedirect: (req, res) => { return res.json({ Error: 'error' }) } }),(req,res)=>res.json({message:"logined"}));
authRouter.get('/twitter', twitterAuth);
authRouter.get('/twitter/callback', twitterCallBackAuth);
authRouter.post('/google-login', loginWithGoogle);

export default authRouter;
