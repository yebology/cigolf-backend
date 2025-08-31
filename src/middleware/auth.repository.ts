import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class AuthRepository {
  async findForemanId(id: number) {
    const result = await prisma.foreman.findFirst({
      where: {
        user_id: id,
      },
    });

    return result?.id;
  }
}
