import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class UserRepository {
  async findByUsername(username: string) {
    return await prisma.user.findUnique({ where: { username } });
  }

  async findRoleById(roleId: number) {
    return await prisma.role.findUnique({ where: { id: roleId } });
  }
}
