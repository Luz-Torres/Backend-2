import passport from "passport";
import local from "passport-local";
import GitHubStrategy from "passport-github2";
import jwt from "passport-jwt";
import userModel from "../dao/models/user.model.js";
import CartManager from "../dao/db/cartManagerDb.js";
import { createHash, isValidPassword } from "../utils/hashbcrypt.js";

const LocalStrategy = local.Strategy;
const JWTStrategy = jwt.Strategy;
const ExtractJwt = jwt.ExtractJwt;
const cartManager = new CartManager();

const initializePassport = () => {
    passport.use("register", new LocalStrategy({
        passReqToCallback: true,
        usernameField: "email"
    }, async (req, username, password, done) => {
        const { first_name, last_name, email, cart_id, age } = req.body;

        try {
            let user = await userModel.findOne({ email: email });
            if (user) return done(null, false);
            const cart = await cartManager.createCart();
            let newUser = {
                first_name,
                last_name,
                email,
                cartId: cart._id,
                age,
                password: createHash(password)
            }

            let result = await userModel.create(newUser);

            return done(null, result);

        } catch (error) {
            return done(error);
        }
    }))

    passport.use("login", new LocalStrategy({
        usernameField: "email"
    }, async (email, password, done) => {
        try {
            const user = await userModel.findOne({ email: email });
            if (!user) {
                return done(null, false);
            }

            if (!isValidPassword(password, user)) return done(null, false);
            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }))

    passport.serializeUser((user, done) => {
        done(null, user._id);
    })

    passport.deserializeUser(async (id, done) => {
        let user = await userModel.findById({ _id: id });
        done(null, user);
    })

    passport.use("github", new GitHubStrategy({
        clientID: "Ov23li6u8KcjbpHBpcMm",
        clientSecret: "b3089041018a4dbe0db2956977dfbeeb0fe7618e",
        callbackURL: "http://localhost:8080/api/sessions/githubcallback"
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await userModel.findOne({ email: profile._json.email });
            if (!user) {
                const cart = await cartManager.createCart();
                let newUser = {
                    first_name: profile._json.name,
                    last_name: " ",
                    age: 18,
                    email: profile._json.email,
                    cartId: cart._id,
                    password: " "
                }
                let result = await userModel.create(newUser);
                done(null, result);
            } else {
                done(null, user);
            }
        } catch (error) {
            return done(error);
        }
    }))

    const cookieExtractor = req => {
        let token = null; 
        
        if(req && req.cookies) {
            token = req.cookies["tokenCookie"];
            
        }
        return token;
    }
    
    passport.use("jwt", new JWTStrategy({
        jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
        secretOrKey: "backendDos"
        
    }, async (jwt_payload, done) => {
        try {
            return done(null, jwt_payload);
        } catch (error) {
            return done(error)
        }
    }))
}

export default initializePassport;