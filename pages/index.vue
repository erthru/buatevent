<template>
  <NuxtLayout v-if="data?.component === 'PageIndexDefault'" name="default">
    <PageIndexDefault />
  </NuxtLayout>
  <NuxtLayout
    v-if="data?.component === 'PageIndexUsername'"
    name="public-organizer"
  >
    <PageIndexUsername :events="data.events" :organizer="data.organizer" />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { Prisma } from "@prisma/client";
import dns from "dns";

const { ssrContext, $client } = useNuxtApp();
const { public: prc } = useRuntimeConfig();
const { setError } = useCustomError();

definePageMeta({
  layout: "empty",
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

    let organizer = null as Prisma.OrganizerGetPayload<{}> | null;

    if (host !== currentHost) {
      component = "PageIndexUsername";
      let username = currentHost?.split(".")[0];

      const currentHostWithoutUsername = currentHost
        ?.split(".")
        .slice(1)
        .join(".");

      if (host !== currentHostWithoutUsername) {
        username = await new Promise((resolve, reject) => {
          dns.resolveCname(currentHostWithoutUsername!!, (error, addresses) => {
            if (error) {
              reject(error);
              return;
            }

            resolve(addresses[0]);
          });
        });
      }

      const _events = await $client.event.getAllByUsername.query({
        username: username!!,
      });

      const _organizer = await $client.organizer.getByUsername.query({
        username: username!!,
      });

      events = _events as any;
      organizer = _organizer as any;
    }

    return {
      component,
      events,
      organizer,
    };
  } catch (err: any) {
    setError(err?.data?.httpStatus || 500, err.message);
  }
});

useHead({
  title:
    data.value?.component === "PageIndexDefault"
      ? `${prc.appTitle} | ${prc.appTagline}`
      : `${data.value?.organizer?.name} | ${prc.appTitle}`,
});
</script>
