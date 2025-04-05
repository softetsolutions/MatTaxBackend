import express from "express";
import userAuth from "./controller/index.js";
import passport from "passport";
const authRouter = express.Router();
const {login, logout} = userAuth;

authRouter.post("/jwt/createSession", login);
authRouter.post("/logout", logout);
authRouter.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
authRouter.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: (req, res) => { return res.json({ Error: 'error' }) } }),(req,res)=>res.json({message:"logined"}));
// authRouter.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));
// authRouter.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: (req, res) => { return res.json({ Error: 'error' }) } }),(req,res)=>res.json({message:"logined"}));
authRouter.get('/auth/twitter', passport.authenticate('twitter'));
authRouter.get('/auth/twitter/callback', passport.authenticate('twitter', { failureRedirect: (req, res) => { return res.json({ Error: 'error' }) } }),(req,res)=>res.json({message:"logined"}));


export default authRouter;
