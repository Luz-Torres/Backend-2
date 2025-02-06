import passport from 'passport';
import {Strategy as JwtStrategy, ExtractJwt} from 'passport-jwt';
import {Strategy as LocalStrategy }from 'passport-local';
import {SECRET} from "../utils/jwt.utils.js";

import {userModel} from '../models/user.model.js';
import {comparePassword} from '../utils/password.utils.js';
import { createToken } from "../utils/jwt.utils.js"; 

export function initializePassport() {
    passport.use("register", new LocalStrategy({
        passReqToCallback: true,
        usernameField: "email",
    }, async (req, email, password, done) => {
        try {
            const { firstName, lastName, age, role } = req.body;
            if (!firstName || !lastName || !age) {
                return done(null, false, { message: "Missing fields" });
            }

            const user = await userModel.create({
                first_name: firstName,
                last_name: lastName,
                email,
                age,
                password,
                role,
            });

            const token = createToken({ id: user.id, email: user.email, role: user.role });

            req.token = token;

            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }));

    passport.use("login", new LocalStrategy({
        usernameField: "email",
        passReqToCallback: true,
    }, async (req, email, password, done) => {
        try {
            const user = await userModel.findOne({ email });
            if (!user) return done(null, false, { message: "User not found" });

            const isValidPassword = await comparePassword(password, user.password);
            if (!isValidPassword) return done(null, false, { message: "Invalid password" });

            const token = createToken({ id: user.id, email: user.email, role: user.role });
            req.token = token;

            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }));

    passport.use("jwt", new JWTStrategy({
        secretOrKey: SECRET,
        jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
    }, async (payload, done) => {
        try {
            const user = await userModel.findById(payload.id);
            if (!user) return done(null, false);

            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await userModel.findById(id);
            if (!user) return done(null, false);

            return done(null, user);
        } catch (error) {
            return done(error);
        }
    });
}

function cookieExtractor(req) {
    return req && req.cookies ? req.cookies.token : null;
}
