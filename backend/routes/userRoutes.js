import express from "express";
import {
  findUserByEmail,
  findUserById,
  refreshProviderRating,
  saveUsers,
  sanitizeUser,
  users
} from "../data/mockUsers.js";

const router = express.Router();

// GET USERS
router.get("/", (req, res) => {
  res.json(users.map(sanitizeUser));
});

router.get("/:id", (req, res) => {
  const user = findUserById(req.params.id);

  if (!user) {
    return res.status(404).json({ msg: "Usuario nao encontrado" });
  }

  return res.json(sanitizeUser(user));
});

router.put("/:id", (req, res) => {
  const user = findUserById(req.params.id) || findUserByEmail(req.body.email);

  if (!user) {
    return res.status(404).json({ msg: "Usuario nao encontrado" });
  }

  const allowedFields = [
    "name",
    "service",
    "bio",
    "zipCode",
    "address",
    "neighborhood",
    "city"
  ];

  allowedFields.forEach(field => {
    if (typeof req.body[field] === "string") {
      user[field] = req.body[field].trim();
    }
  });

  if (req.body.latitude !== undefined) {
    const latitude = Number(req.body.latitude);
    user.latitude = Number.isFinite(latitude) ? latitude : null;
  }

  if (req.body.longitude !== undefined) {
    const longitude = Number(req.body.longitude);
    user.longitude = Number.isFinite(longitude) ? longitude : null;
  }

  if (user.type === "prestador") {
    user.budgetAverage = Number(req.body.budgetAverage || user.budgetAverage || 0);
    user.distance = Number(req.body.distance || user.distance || 3.5);
    refreshProviderRating(user);
  }

  saveUsers();

  return res.json(sanitizeUser(user));
});

router.post("/:id/reviews", (req, res) => {
  const provider = findUserById(req.params.id);
  const { authorId, authorName, rating, comment } = req.body;

  if (!provider || provider.type !== "prestador") {
    return res.status(404).json({ msg: "Prestador nao encontrado" });
  }

  if (!authorId || !authorName || !comment) {
    return res.status(400).json({ msg: "Dados da avaliacao incompletos" });
  }

  const review = {
    id: `r${Date.now()}`,
    authorId,
    authorName,
    rating: Number(rating || 5),
    comment,
    createdAt: new Date().toISOString()
  };

  provider.reviews = Array.isArray(provider.reviews) ? provider.reviews : [];
  provider.reviews.unshift(review);
  refreshProviderRating(provider);
  saveUsers();

  return res.status(201).json({
    msg: "Avaliacao enviada com sucesso",
    user: sanitizeUser(provider),
    review
  });
});

export default router;
