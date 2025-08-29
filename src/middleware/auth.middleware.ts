import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];

  if (!token || !authHeader) {
    res
      .status(401)
      .json({ message: "Authentication token is missing or invalid." });
  }

  const secretKey = process.env.SECRET_KEY;

  jwt.verify(token!, secretKey!, (error, decoded) => {
    if (error) {
      res
        .status(401)
        .json({ message: "Authentication token is missing or invalid." });
    }

    (req as any).user = decoded;

    next();
  });
};

export const verifyRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user || !roles.includes(user.role)) {
      res
        .status(401)
        .json({ message: "Authentication token is missing or invalid." });
    }

    next();
  };
};
