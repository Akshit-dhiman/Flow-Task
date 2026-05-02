const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("password123", 10);

  // Upsert admin demo user
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "Demo Admin",
      email: "admin@example.com",
      passwordHash: password,
    },
  });

  // Upsert member demo user
  const member = await prisma.user.upsert({
    where: { email: "member@example.com" },
    update: {},
    create: {
      name: "Demo Member",
      email: "member@example.com",
      passwordHash: password,
    },
  });

  // Create a demo project owned by admin (if it doesn't exist yet)
  const existingProject = await prisma.project.findFirst({
    where: { createdById: admin.id, name: "Demo Project" },
  });

  if (!existingProject) {
    await prisma.project.create({
      data: {
        name: "Demo Project",
        description: "A starter project to explore the app.",
        createdById: admin.id,
        members: {
          create: [
            { userId: admin.id, role: "ADMIN" },
            { userId: member.id, role: "MEMBER" },
          ],
        },
      },
    });
    console.log("✅ Demo project created");
  }

  console.log(`✅ Seeded: ${admin.email} (ADMIN), ${member.email} (MEMBER)`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
