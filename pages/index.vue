<template>
  <NuxtLayout
    :name="data?.component === 'PageIndexUsername' ? 'independent' : 'default'"
  >
    <PageIndexDefault v-if="data?.component === 'PageIndexDefault'" />
    <PageIndexUsername
      v-if="data?.component === 'PageIndexUsername'"
      :events="data.events"
    />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { Prisma } from "@prisma/client";
const { ssrContext, $client } = useNuxtApp();
const { public: prc } = useRuntimeConfig();
const { setError } = useCustomError();

useHead({
  title: `${prc.appTitle} | ${prc.appTagline}`,
});

const { data } = useLazyAsyncData("index", async () => {
  try {
    const host = prc.baseUrl
      .replaceAll("http://", "")
      .replaceAll("https://", "");

    const currentHost = process.server
      ? ssrContext?.event.node.req.headers.host
      : window.location.host;

    let component = "PageIndexDefault";

    let events = [] as Prisma.EventGetPayload<{
      include: {
        organizer: true;
      };
    }>[];

    if (host !== currentHost) {
      component = "PageIndexUsername";
      let username = currentHost?.split(".")[0];

      const currentHostWithoutUsername = currentHost
        ?.split(".")
        .slice(1)
        .join(".");

      if (host !== currentHostWithoutUsername) {
        username = await $client.external.resolveCname.query({
          domain: currentHostWithoutUsername!!,
        });
      }

      const _events = await $client.event.getAllByUsername.query({
        username: username!!,
      });

      events = _events as any;
    }

    return {
      component,
      events,
    };
  } catch (err: any) {
    setError(err?.data?.httpStatus || 500, err.message);
  }
});
</script>
