import { Prisma } from "@prisma/client";

export const useUser = () => {
  const { $client } = useNuxtApp();

  const user = useState<Prisma.UserGetPayload<{
    include: { admin: true; organizer: true };
  }> | null>("user", () => null);

  const fetchUser = async () => {
    const _user = await $client.user.profile.query();
    user.value = _user as any;
  };

  return {
    user,
    fetchUser,
  };
};
