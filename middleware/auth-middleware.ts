export default defineNuxtRouteMiddleware(async (to, from) => {
  const tokenCookie = useCookie("token");
  const { user, fetchUser } = useUser();

  if (!tokenCookie.value) {
    return navigateTo("/login");
  }

  if (!user.value) {
    await fetchUser();
  }
});
