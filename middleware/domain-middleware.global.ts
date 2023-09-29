export default defineNuxtRouteMiddleware((to, from) => {
  const { public: prc } = useRuntimeConfig();
  const { ssrContext } = useNuxtApp();
  const host = prc.baseUrl.replaceAll("http://", "").replaceAll("https://", "");
  let currentHost = null;

  const allowedPathNames = ["index", "slug"] as any[];

  if (process.server) {
    currentHost = ssrContext?.event.node.req.headers.host;
  } else {
    currentHost = window.location.host;
  }

  if (host !== currentHost && !allowedPathNames.includes(to.name)) {
    return navigateTo(prc.baseUrl, { external: true });
  }
});
