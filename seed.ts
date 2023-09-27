import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const main = async () => {
  try {
    await prisma.eventMember.deleteMany();
    await prisma.eventTicket.deleteMany();
    await prisma.event.deleteMany();
    await prisma.admin.deleteMany();
    await prisma.organizer.deleteMany();
    await prisma.user.deleteMany();

    const encryptedPassword = await bcrypt.hash("123456", 10);

    const userAdmin = await prisma.user.create({
      data: {
        email: "admin@buatevent.com",
        password: encryptedPassword,
        role: "ADMIN",
      },
    });

    const userOrganizer = await prisma.user.create({
      data: {
        email: "organizer@buatevent.com",
        password: encryptedPassword,
        role: "ORGANIZER",
      },
    });

    await Promise.all([
      prisma.admin.create({
        data: {
          name: "Buat Event Admin",
          userId: userAdmin.id,
        },
      }),
      prisma.organizer.create({
        data: {
          username: "organizer",
          name: "Buat Event Organizer",
          avatar: "default.png",
          phone: "082293389523",
          userId: userOrganizer.id,
        },
      }),
    ]);
  } catch (err: any) {
    console.error(err);
  }
};

main();
