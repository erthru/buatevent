<template>
  <PageIndexDefault v-if="data?.component === 'PageIndexDefault'" />
  <PageIndexUsername
    v-if="data?.component === 'PageIndexUsername'"
    :events="data.events"
    :organizer="data.organizer"
  />
</template>

<script setup lang="ts">
import { Prisma } from "@prisma/client";
import dns from "dns";

const { ssrContext, $client } = useNuxtApp();
const { public: prc } = useRuntimeConfig();
const { setError } = useCustomError();

const { data } = useLazyAsyncData("index", async () => {
  try {
    const host = prc.baseUrl
      .replaceAll("http://", "")
      .replaceAll("https://", "");

    const currentHost = process.server
      ? ssrContext?.event.node.req.headers.host
      : window.location.host;

    let component = "PageIndexDefault";
    let layout = "default";

    let events = [] as Prisma.EventGetPayload<{
      include: {
        organizer: true;
      };
    }>[];

    let organizer = null as Prisma.OrganizerGetPayload<{}> | null;

    if (host !== currentHost) {
      component = "PageIndexUsername";
      layout = "independent";
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
      layout,
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

onMounted(() => {
  if (data.value?.layout !== "default") {
    setPageLayout(data.value?.layout as any);
  }
});
</script>
