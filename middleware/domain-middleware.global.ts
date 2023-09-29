export default defineNuxtRouteMiddleware((to, from) => {
  const { public: prc } = useRuntimeConfig();
  const { ssrContext } = useNuxtApp();
  const host = prc.baseUrl.replaceAll("http://", "").replaceAll("https://", "");

  let currentHost = process.server
    ? ssrContext?.event.node.req.headers.host
    : window.location.host;

  const allowedPathNames = ["index", "slug"] as any[];

  if (host !== currentHost && !allowedPathNames.includes(to.name)) {
    return navigateTo(prc.baseUrl, { external: true });
  }
});
