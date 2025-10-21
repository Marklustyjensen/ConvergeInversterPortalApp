// prisma/seed.js
// Run this script with `node prisma/seed.js`
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data (in correct order due to foreign key constraints)
  await prisma.userProperty.deleteMany();
  await prisma.user.deleteMany();
  await prisma.property.deleteMany();

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

  // Create sample properties
  const properties = await prisma.property.createMany({
    data: [
      {
        name: "Fairfield Inn & Suites by Marriott - Aurora, CO",
        address: "13900 E. Harvard Ave.",
        city: "Aurora",
        state: "CO",
        zip: "80014",
        code: "DENAU",
      },
      {
        name: "Fairfield Inn & Suites by Marriott - Des Moines, IA",
        address: "207 Crocker St",
        city: "Des Moines",
        state: "IA",
        zip: "50309",
        code: "DSMFD",
      },
      {
        name: "Courtyard Sherman - Sherman, TX",
        address: "4344 N Loy Lake Rd",
        city: "Sherman",
        state: "TX",
        zip: "75092",
        code: "PNxCY",
      },
      {
        name: "La Posada Lodge & Casitas - Tucson, AZ",
        address: "5900 N Oracle Rd",
        city: "Tucson",
        state: "AZ",
        zip: "85704",
        code: "az.389",
      },
    ],
  });

  // Get created users and properties to reference in relationships
  const allUsers = await prisma.user.findMany();
  const allProperties = await prisma.property.findMany();

  // Helper functions to find users and properties
  const findUser = (name) => allUsers.find((u) => u.name === name);
  const findProperty = (code) => allProperties.find((p) => p.code === code);

  // Create sample user-property relationships
  await prisma.userProperty.createMany({
    data: [
      // Adam is an owner/manager in Aurora and Des Moines
      {
        userId: findUser("Adam Dobmeier").id,
        propertyId: findProperty("DENAU").id,
        role: "owner",
        investment: 500000,
        percentage: 40.0,
      },
      {
        userId: findUser("Adam Dobmeier").id,
        propertyId: findProperty("DSMFD").id,
        role: "owner",
        investment: 450000,
        percentage: 35.0,
      },
      // Ambur is an owner/manager in Sherman and Tucson
      {
        userId: findUser("Ambur Jensen").id,
        propertyId: findProperty("PNxCY").id,
        role: "owner",
        investment: 600000,
        percentage: 45.0,
      },
      {
        userId: findUser("Ambur Jensen").id,
        propertyId: findProperty("az.389").id,
        role: "owner",
        investment: 400000,
        percentage: 30.0,
      },
      // Mark is an investor in multiple properties
      {
        userId: findUser("Mark Jensen").id,
        propertyId: findProperty("DENAU").id,
        role: "investor",
        investment: 100000,
        percentage: 15.0,
      },
      {
        userId: findUser("Mark Jensen").id,
        propertyId: findProperty("DSMFD").id,
        role: "investor",
        investment: 75000,
        percentage: 12.0,
      },
      {
        userId: findUser("Mark Jensen").id,
        propertyId: findProperty("PNxCY").id,
        role: "investor",
        investment: 125000,
        percentage: 18.0,
      },
    ],
  });

  console.log("Seeding completed successfully!");
  console.log(`Created ${allUsers.length} users`);
  console.log(`Created ${allProperties.length} properties`);

  // Display the relationships created
  const relationships = await prisma.userProperty.count();
  console.log(`Created ${relationships} user-property relationships`);
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
