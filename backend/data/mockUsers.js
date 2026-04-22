import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const usersFilePath = path.join(__dirname, "users.json");

const defaultUsers = [];

const ensureUsersFile = () => {
  if (!fs.existsSync(usersFilePath)) {
    fs.writeFileSync(usersFilePath, JSON.stringify(defaultUsers, null, 2));
  }
};

const readUsers = () => {
  ensureUsersFile();
  const content = fs.readFileSync(usersFilePath, "utf-8");
  return JSON.parse(content);
};

export let users = readUsers();

export const saveUsers = () => {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
};

export const sanitizeUser = ({ password, ...user }) => user;

export const findUserById = (id) => users.find(user => user._id === id);

export const findUserByEmail = (email) =>
  users.find(user => user.email?.toLowerCase() === email?.toLowerCase());

export const createUser = (user) => {
  users.push(user);
  saveUsers();
  return user;
};

const toNumberOrNull = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const toRadians = (value) => (value * Math.PI) / 180;

const haversineDistanceKm = (originLat, originLng, targetLat, targetLng) => {
  const earthRadiusKm = 6371;
  const dLat = toRadians(targetLat - originLat);
  const dLng = toRadians(targetLng - originLng);
  const lat1 = toRadians(originLat);
  const lat2 = toRadians(targetLat);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((earthRadiusKm * c).toFixed(1));
};

export const calculateDistanceKm = (originUser, targetUser) => {
  if (!originUser || !targetUser) {
    return null;
  }

  const originLat = toNumberOrNull(originUser.latitude);
  const originLng = toNumberOrNull(originUser.longitude);
  const targetLat = toNumberOrNull(targetUser.latitude);
  const targetLng = toNumberOrNull(targetUser.longitude);

  const sameAddress =
    originUser.address &&
    targetUser.address &&
    originUser.address.trim().toLowerCase() === targetUser.address.trim().toLowerCase() &&
    originUser.neighborhood?.trim().toLowerCase() ===
      targetUser.neighborhood?.trim().toLowerCase() &&
    originUser.city?.trim().toLowerCase() === targetUser.city?.trim().toLowerCase();

  if (sameAddress) {
    return 0;
  }

  if (
    originLat !== null &&
    originLng !== null &&
    targetLat !== null &&
    targetLng !== null
  ) {
    return haversineDistanceKm(originLat, originLng, targetLat, targetLng);
  }

  if (
    originUser.city &&
    targetUser.city &&
    originUser.city.toLowerCase() !== targetUser.city.toLowerCase()
  ) {
    return 14.5;
  }

  if (
    originUser.neighborhood &&
    targetUser.neighborhood &&
    originUser.neighborhood.toLowerCase() === targetUser.neighborhood.toLowerCase()
  ) {
    return 1.4;
  }

  if (originUser.city && targetUser.city) {
    return 5.8;
  }

  return typeof targetUser.distance === "number" ? targetUser.distance : 3.5;
};

export const refreshProviderRating = (user) => {
  const reviews = Array.isArray(user.reviews) ? user.reviews : [];

  if (!reviews.length) {
    user.rating = 5;
    return user.rating;
  }

  const average =
    reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) /
    reviews.length;

  user.rating = Number(average.toFixed(1));
  return user.rating;
};
