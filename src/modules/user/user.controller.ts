import { Request, Response } from "express";
import { UserService } from "./user.service";

const service = new UserService();

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const result = await service.login(username, password);
    res.json({ status: "success", message: "Login successful", data: result });
  } catch (error) {
    res.status(401).json({ status: "error", message: (error as Error).message });
  }
};
