// prisma/seed.js
// Run this script with `node prisma/seed.js`
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.user.deleteMany();

  // Create sample users
  const users = await prisma.user.createMany({
    data: [
      {
        name: "Adam Dobmeier",
        username: "Adam",
        email: "adam@convergehospitality.com",
        password: "1234",
        admin: true,
      },
      {
        name: "Ambur Jensen",
        username: "Ambur",
        email: "ambur@convergehospitality.com",
        password: "1234",
        admin: true,
      },
      {
        name: "Mark Jensen",
        username: "Mark",
        email: "ambmar.llc@gmail.com",
        password: "1234",
        admin: false,
      },
    ],
  });

  // Get created users to reference in incident reports
  const allUsers = await prisma.user.findMany();

  // Helper to find user by name
  const findUser = (name) => allUsers.find((u) => u.name === name);

  console.log("Seeding completed successfully!");
}

main()
  .then(async () => {
    console.log("Seeding completed.");
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
