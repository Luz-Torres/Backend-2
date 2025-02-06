import { Router } from "express";
import { userModel } from "../models/user.model.js";

export const userRouter = Router();

userRouter.get("/", async (req, res) => {
const users = await userModel.find();
res.json(users)
});