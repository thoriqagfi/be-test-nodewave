import { Router } from "express";
import * as AuthController from "$controllers/rest/AuthController";


const AuthRoutes = Router({ mergeParams: true})

AuthRoutes.post("/register", AuthController.register);
AuthRoutes.post("/login", AuthController.login);
AuthRoutes.post("/refresh-token", AuthController.refreshToken);

export default AuthRoutes;