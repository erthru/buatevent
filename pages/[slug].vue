<template>
  <pre>{{ data }}</pre>
</template>

<script lang="ts" setup>
definePageMeta({
  layout: "independent",
});

const { $client, ssrContext } = useNuxtApp();
const { public: prc } = useRuntimeConfig();
const route = useRoute();
const { setError } = useCustomError();

const { data } = useLazyAsyncData("slug", async () => {
  try {
    const currentHost = process.server
      ? ssrContext?.event.node.req.headers.host
      : window.location.host;

    let username = currentHost?.split(".")[0];

    const currentHostWithoutUsername = currentHost
      ?.split(".")
      .slice(1)
      .join(".");

    const host = prc.baseUrl
      .replaceAll("http://", "")
      .replaceAll("https://", "");

    if (host === currentHost) {
      throw {
        data: {
          httpStatus: 404,
        },
        message: "not found",
      };
    }

    if (host !== currentHostWithoutUsername) {
      username = await $client.external.resolveCname.query({
        domain: currentHostWithoutUsername!!,
      });
    }

    const event = await $client.event.getByUsernameAndSlug.query({
      username: username!!,
      slug: route.params.slug as string,
    });

    if (!event) {
      throw {
        data: {
          httpStatus: 404,
        },
        message: "not found",
      };
    }

    return event;
  } catch (err: any) {
    setError(err?.data?.httpStatus || 500, err.message);
  }
});
</script>
