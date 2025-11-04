import prisma from "@/core/lib/prisma";
import bcrypt from "bcrypt";

async function main() {
  console.log("🌱 Iniciando seed de la base de datos...");

  // Crear el rol "administrador" si no existe
  const adminRole = await prisma.role.upsert({
    where: { name: "administrador" },
    update: {},
    create: {
      name: "administrador",
    },
  });

  console.log("✅ Rol 'administrador' creado/verificado:", adminRole.id);

  // Hash de la contraseña (puedes cambiar "password" por la contraseña que desees)
  const passwordHash = await bcrypt.hash("admin123", 10);

  // Crear el usuario "aldrich" si no existe
  const user = await prisma.user.upsert({
    where: { email: "admin@empresa.com" },
    update: {},
    create: {
      email: "admin@empresa.com",
      name: "aldrich",
      password: passwordHash,
      isActive: true,
    },
  });

  console.log("✅ Usuario 'aldrich' creado/verificado:", user.id);

  // Crear la relación UserRole si no existe
  const userRole = await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: user.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      roleId: adminRole.id,
    },
  });

  console.log("✅ Relación usuario-rol creada/verificada:", userRole.id);
  console.log("🎉 Seed completado exitosamente!");
}

main()
  .catch((e) => {
    console.error("❌ Error durante el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
