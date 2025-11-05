import { PasswordHasher } from "@/core/shared/security/hasher";
import { UserRepository } from "../repositories/UserRepository.repository";
import { CreateUserDto } from "../dtos/CreateUserDto.dto";
import { Err, Ok } from "@/core/shared/result/result";
import { ConflictError } from "@/core/shared/errors/domain";
import { toUserDto, toUserDtoArray } from "../mappers/userMapper";

export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher
  ) {}

  async create(createUserDto: CreateUserDto) {
    const exists = await this.userRepository.findByEmail({
      email: createUserDto.email,
    });

    if (exists) {
      return Err(
        new ConflictError(
          "EMAIL Existente",
          "El email ya esta siendo usado por un usuario"
        )
      );
    }

    const passworHash = await this.passwordHasher.hash(createUserDto.password);

    const user = await this.userRepository.create({
      email: createUserDto.email,
      name: createUserDto.name,
      passwordHash: passworHash,
      roles: createUserDto.roles,
    });

    return Ok(toUserDto(user));
  }

  async getAll() {
    const users = await this.userRepository.getAllUsers();

    if (!users) {
      return Err(
        new ConflictError(
          "EMAIL Existente",
          "El email ya esta siendo usado por un usuario"
        )
      );
    }

    return Ok(toUserDtoArray(users));
  }
}
