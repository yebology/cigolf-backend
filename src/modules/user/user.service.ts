import { UserRepository } from "./user.repository";
import { generateJwt } from "./user.helper";

const repo = new UserRepository();

export class UserService {
  async login(username: string, password: string) {
    const user = await repo.findByUsername(username);

    if (!user || user.password_hash != password) {
      throw new Error("Invalid username or password.");
    }

    const role = await repo.findRoleById(user!.id_role);
    const token = generateJwt(user!, role!);

    return {
      accessToken: token,
      tokenType: "Bearer",
      expiresIn: 3600,
      user: {
        id: user.id,
        username: user.username,
        name: user.nama,
        role: role?.role,
      },
    };
  }
}
