import UserService from "../services/user.services.js";
import jwt from "jsonwebtoken";
import UserDTO from "../dto/user.dto.js";

class UserController {
    async register(req, res) {
        const { first_name, last_name, email, cart_id, age } = req.body; 

        try {
            const nuevoUsuario = await UserService.registerUser({ first_name, last_name, email, cart_id, age }); 

            const token = jwt.sign({
                usuario: `${nuevoUsuario.first_name} ${nuevoUsuario.last_name}`,
                email: nuevoUsuario.email,
                role: nuevoUsuario.role
            }, "backendDos", {expiresIn: "1h"});

            res.cookie("tokenCookie", token, {maxAge: 3600000, httpOnly: true});
            res.redirect("/api/sessions/profile");
        } catch (error) {
            res.status(500).send("Error en el servidor");
        }
    }

    async login(req, res) {
        const {email, password, cartId} = req.body; 

        try {
            const user = await UserService.loginUser(email, password, cartId);

            const token = jwt.sign({
                usuario: `${user.first_name} ${user.last_name}`,
                email: user.email,
                role: user.role,
                cart: user.cartId
            }, "backendDos", {expiresIn: "1h"});

            res.cookie("tokenCookie", token, {maxAge: 3600000, httpOnly: true});
            req.session.user = req.user;
            req.session.login = true;
            res.redirect("/api/sessions/profile");
        } catch (error) {
            res.status(500).send("Error del servidor");
        }
    }

    async current(req, res) {
        if(req.user) {
            const user = req.user; 
            const userDTO = new UserDTO(user); 
            res.render("profile", {user: userDTO})
        } else {
            res.send("No autorizado");
        }
    }

    async failed(req, res) {
        res.render("failed");
    }

    async githubCallback(req, res) {
        req.session.user = req.user;
        req.session.login = true;
        res.redirect("/api/sessions/profile");
    }

    logout(req, res) {
        res.clearCookie("tokenCookie");
        res.clearCookie("connect.sid")
        res.redirect("/");
    }
}

export default new UserController(); 