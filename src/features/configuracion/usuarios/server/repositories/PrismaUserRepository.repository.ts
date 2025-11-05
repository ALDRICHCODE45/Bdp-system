import { PrismaClient } from "@prisma/client";
import { UserRepository } from "./UserRepository.repository";
import { UserWithRoles } from "../mappers/userMapper";

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByEmail(data: { email: string }): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
      select: { id: true },
    });

    return user !== null;
  }

  async findByEmailWithPassword(data: {
    email: string;
  }): Promise<UserWithRoles | null> {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    return user as UserWithRoles | null;
  }

  async findById(data: { id: string }): Promise<UserWithRoles | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: data.id },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });
    return user as UserWithRoles | null;
  }

  async create(data: {
    email: string;
    name: string;
    passwordHash: string;
    roles: string[];
  }): Promise<UserWithRoles> {
    // Obtener o crear los roles
    const roleConnections = await Promise.all(
      data.roles.map(async (roleName) => {
        const role = await this.prisma.role.upsert({
          where: { name: roleName },
          update: {},
          create: { name: roleName },
        });

        return { id: role.id };
      })
    );

    // Crear el usuario con los roles asociados
    return (await this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: data.passwordHash,
        roles: {
          create: roleConnections.map((role) => ({
            roleId: role.id,
          })),
        },
      },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    })) as UserWithRoles;
  }

  async getAllUsers(): Promise<UserWithRoles[]> {
    return await this.prisma.user.findMany({
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  async update(data: {
    id: string;
    email: string;
    name: string;
    passwordHash?: string;
    roles: string[];
    isActive: boolean;
  }): Promise<UserWithRoles> {
    // Obtener o crear los roles
    const roleConnections = await Promise.all(
      data.roles.map(async (roleName) => {
        const role = await this.prisma.role.upsert({
          where: { name: roleName },
          update: {},
          create: { name: roleName },
        });

        return { id: role.id };
      })
    );

    // Preparar los datos de actualización
    const updateData: {
      email: string;
      name: string;
      password?: string;
      isActive: boolean;
      roles?: {
        // eslint-disable-next-line @typescript-eslint/no-empty-object-type
        deleteMany: {};
        create: Array<{ roleId: string }>;
      };
    } = {
      email: data.email,
      name: data.name,
      isActive: data.isActive,
      roles: {
        deleteMany: {}, // Eliminar todos los roles actuales
        create: roleConnections.map((role) => ({
          roleId: role.id,
        })),
      },
    };

    // Solo actualizar password si se proporciona
    if (data.passwordHash) {
      updateData.password = data.passwordHash;
    }

    // Actualizar el usuario con los nuevos datos y roles
    return (await this.prisma.user.update({
      where: { id: data.id },
      data: updateData,
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    })) as UserWithRoles;
  }
}
