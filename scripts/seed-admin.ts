import bcrypt from "bcrypt";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

async function seedAdmin() {
  const existing = await db.select().from(usersTable).where(eq(usersTable.email, "admin@pawnbroker.com")).limit(1);
  if (existing[0]) {
    console.log("Admin user already exists");
    return;
  }

  const passwordHash = await bcrypt.hash("admin123", 10);
  await db.insert(usersTable).values({
    email: "admin@pawnbroker.com",
    passwordHash,
    name: "Admin User",
    role: "admin",
    active: true,
  });
  console.log("Admin user seeded: admin@pawnbroker.com / admin123");

  // Also seed a manager
  const managerHash = await bcrypt.hash("manager123", 10);
  await db.insert(usersTable).values({
    email: "manager@pawnbroker.com",
    passwordHash: managerHash,
    name: "Store Manager",
    role: "manager",
    active: true,
  });
  console.log("Manager user seeded: manager@pawnbroker.com / manager123");
}

seedAdmin().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
