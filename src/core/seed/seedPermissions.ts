import prisma from "@/core/lib/prisma";
import { ALL_PERMISSIONS } from "@/core/lib/permissions/permissions.constant";

export async function seedPermissions() {
  console.log("🌱 Seeding permissions...");

  try {
    // Crear todos los permisos predefinidos
    const permissionsData = ALL_PERMISSIONS.map((perm) => ({
      name: perm.name,
      resource: perm.resource,
      action: perm.action,
      description: perm.description,
    }));

    const result = await prisma.permission.createMany({
      data: permissionsData,
      skipDuplicates: true,
    });

    console.log(`✅ Created ${result.count} permissions`);
    return result;
  } catch (error) {
    console.error("❌ Error seeding permissions:", error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  seedPermissions()
    .then(() => {
      console.log("✅ Permissions seeded successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Error seeding permissions:", error);
      process.exit(1);
    });
}

