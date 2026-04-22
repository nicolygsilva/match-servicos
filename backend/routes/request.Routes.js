import express from "express";
import {
  createRequest,
  getRequests,
  sendMessage,
  sendBudget,
  sendReview
} from "../controllers/requestController.js";

const router = express.Router();

router.post("/", createRequest);
router.get("/", getRequests);
router.post("/message", sendMessage);
router.post("/budget", sendBudget);
router.post("/review", sendReview);

export default router;
