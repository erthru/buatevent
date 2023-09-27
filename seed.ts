import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const main = async () => {
  try {
    await prisma.admin.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.user.deleteMany();

    const encryptedPassword = await bcrypt.hash("123456", 10);

    const userAdmin = await prisma.user.create({
      data: {
        email: "admin@buatevent.com",
        password: encryptedPassword,
        role: "ADMIN",
      },
    });

    const userCustomer = await prisma.user.create({
      data: {
        email: "customer@buatevent.com",
        password: encryptedPassword,
        role: "CUSTOMER",
      },
    });

    await Promise.all([
      prisma.admin.create({
        data: {
          name: "Admin",
          userId: userAdmin.id,
        },
      }),
      prisma.customer.create({
        data: {
          name: "Customer",
          userId: userCustomer.id,
        },
      }),
    ]);
  } catch (err: any) {
    console.error(err);
  }
};

main();
