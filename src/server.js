import express from "express";
import passport from "passport";
import { authRouter } from "./routes/auth.routes.js";
import { userRouter } from "./routes/user.routes.js";
import { initializePassport } from "./config/passport.config.js";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const { MONGODB_URI } = process.env;
const {PORT} = process.env;
const {LINK} = process.env;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
initializePassport();
app.use(passport.initialize());

mongoose
    .connect(MONGODB_URI)
    .then(() => {
        console.log("Conexión exitosa");
    })
    .catch((error) => {
        console.log("Error conectando al conectarse a la base de datos", error);
    });

app.use("/api/auth", authRouter);
app.use("/api/users", passport.authenticate("jwt", { session: false }), userRouter);

app.listen(PORT, () => {
    console.log("El servidor corre en el puerto ",PORT,"acceda al link -->",LINK);
});