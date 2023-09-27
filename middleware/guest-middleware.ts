export default defineNuxtRouteMiddleware((to, from) => {
  const tokenCookie = useCookie("token");

  if (tokenCookie.value) {
    return navigateTo("/dashboard");
  }
});
