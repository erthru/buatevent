<template>
  <pre>{{ state.events }}</pre>
</template>

<script lang="ts" setup>
import { Prisma } from "@prisma/client";

const { $client } = useNuxtApp();
const { public: prc } = useRuntimeConfig();

const state = reactive({
  events: [] as Prisma.EventGetPayload<{
    include: {
      organizer: true;
    };
  }>[],
});

onMounted(async () => {
  const currenthost = window.location.host;
  let username = currenthost.split(".")[0];
  const currentHostWithoutUsername = currenthost.split(".").slice(1).join(".");
  const host = prc.baseUrl.replaceAll("http://", "").replaceAll("https://", "");

  if (host !== currentHostWithoutUsername) {
    try {
      username = await $client.external.resolveCname.query({
        domain: currentHostWithoutUsername,
      });
    } catch (err: any) {
      throw showError({
        statusCode: 500,
        statusMessage: err.message,
      });
    }
  }

  try {
    const events = await $client.event.getAllByUsername.query({
      username,
    });

    state.events = events as any;
  } catch (err: any) {
    throw showError({
      statusCode: err.message === "not found" ? 404 : 500,
      statusMessage: err.message,
    });
  }
});
</script>
