import { Router } from "express";
import { authenticate, authorize } from "$middlewares/auth.middleware";
import * as UserController from "$controllers/rest/UserController";
import { Roles } from "@prisma/client";

const UserRoutes = Router({ mergeParams: true });

UserRoutes.get("/", authenticate, UserController.getProfile);
UserRoutes.get("/all", authenticate, authorize([Roles.ADMIN]), UserController.getAllUsers);

export default UserRoutes;