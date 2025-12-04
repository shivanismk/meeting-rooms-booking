import express from "express";
import { authenticateUser, adminOnly } from "../middleware/auth.js";
import {
  createBooking,
  getMyBookings,
  deleteBooking,
  adminGetAllBookings
} from "../controllers/bookingController.js";

const router = express.Router();

router.post("/", authenticateUser, createBooking);
router.get("/me", authenticateUser, getMyBookings);
router.delete("/:id", authenticateUser, deleteBooking);
router.get("/", authenticateUser, adminOnly, adminGetAllBookings);

export default router;
