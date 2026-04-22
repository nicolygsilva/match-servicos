import express from "express";
import {
  createUser,
  findUserByEmail,
  sanitizeUser,
  users
} from "../data/mockUsers.js";

const router = express.Router();

// LOGIN
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: "Preencha email e senha" });
  }

  const user = findUserByEmail(email);

  if (!user) {
    return res.status(404).json({ msg: "Usuario nao encontrado" });
  }

  if (user.password !== password) {
    return res.status(401).json({ msg: "Senha invalida" });
  }

  return res.json({
    user: sanitizeUser(user),
    token: "fake-token"
  });
});

// REGISTER
router.post("/register", (req, res) => {
  const { name, email, password, type, service } = req.body;

  if (!name || !email || !password || !type) {
    return res.status(400).json({ msg: "Preencha os campos obrigatorios" });
  }

  if (type === "prestador" && !service) {
    return res.status(400).json({ msg: "Informe o servico principal" });
  }

  const emailExists = users.some(user => user.email === email);

  if (emailExists) {
    return res.status(400).json({ msg: "Email ja cadastrado" });
  }

  const newUser = {
    _id: String(users.length + 1),
    name,
    email,
    password,
    type,
    service: type === "prestador" ? service : "",
    rating: type === "prestador" ? 5 : undefined,
    distance: type === "prestador" ? 3.5 : undefined
  };

  createUser(newUser);

  return res.status(201).json({
    msg: "Usuario criado com sucesso",
    user: sanitizeUser(newUser)
  });
});

export default router;
