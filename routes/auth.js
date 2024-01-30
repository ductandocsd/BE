import express from "express";
import { login, loginGet, register } from "../controllers/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/loginget", loginGet);

export default router;
