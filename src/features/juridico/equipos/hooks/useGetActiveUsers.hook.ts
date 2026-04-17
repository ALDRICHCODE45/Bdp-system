import { useQuery } from "@tanstack/react-query";
import { getActiveUsersAction } from "../server/actions/getActiveUsersAction";

export const useGetActiveUsers = () => {
  return useQuery({
    queryKey: ["active-users"],
    queryFn: async () => {
      const result = await getActiveUsersAction();
      if (!result.ok) throw new Error(result.error);
      return result.data;
    },
  });
};
