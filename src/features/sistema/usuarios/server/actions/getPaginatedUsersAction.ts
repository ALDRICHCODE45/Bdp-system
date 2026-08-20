"use server";
import { makeUserService } from "../services/makeUserService";
import { toUserDtoArray } from "../mappers/userMapper";
import prisma from "@/core/lib/prisma";
import { PaginatedResult } from "@/core/shared/types/pagination.types";
import { UserDto } from "../dtos/UserDto.dto";
import { UserFilterParams } from "../../types/filters/UserFilterParams";

export const getPaginatedUsersAction = async (
  params: UserFilterParams,
): Promise<
  { ok: true; data: PaginatedResult<UserDto> } | { ok: false; error: string }
> => {
  const page = Math.max(1, params.page);
  const pageSize = Math.min(Math.max(1, params.pageSize), 100);

  const service = makeUserService({ prisma });
  const result = await service.getPaginated({
    page,
    pageSize,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
    search: params.search,
    isActive: params.isActive,
  });

  if (!result.ok) {
    return { ok: false, error: result.error.message };
  }

  const dtos = toUserDtoArray(result.value.data);
  return {
    ok: true,
    data: {
      data: dtos,
      totalCount: result.value.totalCount,
      page,
      pageSize,
      pageCount: Math.ceil(result.value.totalCount / pageSize),
    },
  };
};
