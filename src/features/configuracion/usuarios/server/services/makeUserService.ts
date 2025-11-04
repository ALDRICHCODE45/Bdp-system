import { PrismaClient } from "@prisma/client";
import { PrismaUserRepository } from "../repositories/PrismaUserRepository.repository";
import { BcryptPasswordHasher } from "@/core/shared/security/hasher";
import { UserService } from "./UserService.service";

export const makeUserService = (deps: { prisma: PrismaClient }) => {
  const userRepository = new PrismaUserRepository(deps.prisma);
  const passwordHasher = new BcryptPasswordHasher();
  return new UserService(userRepository, passwordHasher);
};
