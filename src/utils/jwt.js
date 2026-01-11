import jwt from "jsonwebtoken";
import { config } from "../config/index.js";

/**
 * Generate Access Token
 */
export const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

/**
 * Generate Refresh Token
 */
export const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });
};
