import { Response } from "express";

export const handleTokenError = (res: Response) => {
  return res
    .status(401)
    .json({ message: "Authentication token is missing or invalid." });
};
