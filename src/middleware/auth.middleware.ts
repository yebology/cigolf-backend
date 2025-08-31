import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AuthRepository } from "./auth.repository";
import { handleTokenError } from "./auth.error";

const repo = new AuthRepository();

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return handleTokenError(res);
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return handleTokenError(res);
    }

    const secretKey = process.env.SECRET_KEY;
    if (!secretKey) {
      return res.status(500).json({ message: "Server config error" });
    }

    const decoded = jwt.verify(token, secretKey) as any;
    (req as any).user = decoded;

    next();
  } catch (error) {
    console.error(error);
    return handleTokenError(res);
  }
};

export const verifyRole = (roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    const { foreman_id } = req.params;

    if (!user || !roles.includes(user.role)) {
      return handleTokenError(res);
    }

    if (user.role === "Mandor" && foreman_id) {
      const result = await repo.findForemanId(user.id);

      if (result != Number(foreman_id)) {
        return handleTokenError(res);
      }
    }

    next();
  };
};
