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

const { data, error } = useLazyAsyncData("slug", async () => {
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
      throw new Error("not found");
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
      throw new Error("not found");
    }

    return event;
  } catch (err: any) {
    throw new Error(err.message);
  }
});

watch(
  () => error.value,
  (val) => {
    if (val) {
      ElNotification({
        title: "Error",
        message: val.message,
        type: "error",
      });
    }
  },
  {
    immediate: true,
  }
);
</script>
