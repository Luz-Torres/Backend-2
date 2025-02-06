import { Router } from "express";
import passport from "passport";

export const authRouter = Router();

authRouter.post("/register", passport.authenticate("register", { session: false }), 
(req, res) => {
    res.cookie("token", req.token, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7 
    });
    res.json(req.user);
});

authRouter.post("/login", passport.authenticate("login", { session: false }), 
(req, res) => {
    res.cookie("token", req.token, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7
    });
    res.json({ token: req.token });
});