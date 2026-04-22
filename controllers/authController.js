import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  const { name, email, password, type, service } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) return res.status(400).json({ msg: "Usuário já existe" });

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    type,
    service
  });

  res.json(user);
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ msg: "Usuário não encontrado" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ msg: "Senha inválida" });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

  res.json({ user, token });
};