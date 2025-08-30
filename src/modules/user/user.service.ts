import { UserRepository } from "./user.repository";
import { generateJwt } from "./user.helper";
import bcrypt from "bcrypt";

const repo = new UserRepository();

export class UserService {
  async login(username: string, password: string) {
    const user = await repo.findByUsername(username);

    if (!user) {
      throw new Error("Invalid username or password.");
    }

    const isValid = await bcrypt.compare(password, user!.password_hash);

    if (!isValid) {
      throw new Error("Invalid username or password.");
    }

    const role = await repo.findRoleById(user!.role_id);
    const token = generateJwt(user!, role!);

    return {
      accessToken: token,
      tokenType: "Bearer",
      expiresIn: 3600,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: role?.role,
      },
    };
  }
}
