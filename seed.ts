import bcrypt from "bcrypt";
import db from "./utils/db.js";

const main = async () => {
  try {
    await db.eventMember.deleteMany();
    await db.eventTicket.deleteMany();
    await db.event.deleteMany();
    await db.admin.deleteMany();
    await db.organizer.deleteMany();
    await db.user.deleteMany();

    const encryptedPassword = await bcrypt.hash("123456", 10);

    const userAdmin = await db.user.create({
      data: {
        email: "admin@buatevent.com",
        password: encryptedPassword,
        role: "ADMIN",
        isActive: true,
      },
    });

    const userOrganizer = await db.user.create({
      data: {
        email: "organizer@buatevent.com",
        password: encryptedPassword,
        role: "ORGANIZER",
        isActive: true,
      },
    });

    await Promise.all([
      db.admin.create({
        data: {
          name: "Buat Event Admin",
          userId: userAdmin.id,
        },
      }),
      db.organizer.create({
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
