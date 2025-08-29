import jwt from "jsonwebtoken";
import type { User, role } from "@prisma/client";

export const generateJwt = (user: User, role: role) => {
  const secretKey = process.env.SECRET_KEY!;
  const token = jwt.sign(
    {
      id: user?.id,
      username: user?.username,
      role: role?.role,
    },
    secretKey,
    {
      expiresIn: "1h",
    }
  );
  return token;
};
