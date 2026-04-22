import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  type: { type: String, enum: ["cliente", "prestador"] },
  service: String,
  rating: { type: Number, default: 5 }
});

export default mongoose.model("User", userSchema);