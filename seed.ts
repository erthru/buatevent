import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const db = new PrismaClient();

const categories = [
  {
    name: "Olahraga",
    image: "category-sport.jpg",
  },
  {
    name: "Konferensi",
    image: "category-conference.jpeg",
  },
  {
    name: "Pameran",
    image: "category-expo.jpeg",
  },
  {
    name: "Musik",
    image: "category-music.jpeg",
  },
  {
    name: "Festival",
    image: "category-festival.jpeg",
  },
  {
    name: "Seni Pertunjukan",
    image: "category-performing-art.jpeg",
  },
  {
    name: "Komunitas",
    image: "category-community.jpeg",
  },
  {
    name: "Akademi",
    image: "category-academy.jpeg",
  },
  {
    name: "Politik",
    image: "category-politic.jpeg",
  },
  {
    name: "Bisnis",
    image: "category-business.jpeg",
  },
  {
    name: "Makanan & Minuman",
    image: "category-food-and-drink.jpeg",
  },
  {
    name: "Lainnya",
    image: "category-other.jpeg",
  },
];

const main = async () => {
  try {
    await db.eventMember.deleteMany();
    await db.eventTicket.deleteMany();
    await db.event.deleteMany();
    await db.category.deleteMany();
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
          phone: "82293389523",
          userId: userOrganizer.id,
        },
      }),
    ]);

    for (const category of categories) {
      await db.category.create({
        data: {
          name: category.name,
          thumbnail: category.image,
          slug: `${category.name
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "")}-${new Date().getTime()}`,
        },
      });
    }
  } catch (err: any) {
    console.error(err);
  }
};

main();
