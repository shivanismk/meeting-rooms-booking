import express from "express";
import { adminOnly, authenticateUser } from "../middleware/auth.js";
import { createRoom, getRooms } from "../controllers/roomController.js";

const router = express.Router();

router.post("/", authenticateUser, adminOnly, createRoom);
router.get("/", authenticateUser, getRooms);

export default router;
