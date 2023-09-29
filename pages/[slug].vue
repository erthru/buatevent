<template>
  <pre>{{ state.event }}</pre>
</template>

<script lang="ts" setup>
definePageMeta({
  layout: "independent",
});

import { Prisma } from "@prisma/client";

const { $client } = useNuxtApp();
const { public: prc } = useRuntimeConfig();
const route = useRoute();

const state = reactive({
  event: null as Prisma.EventGetPayload<{
    include: {
      organizer: true;
      eventTickets: true;
    };
  }> | null,
});

onMounted(async () => {
  const currenthost = window.location.host;
  let username = currenthost.split(".")[0];
  const currentHostWithoutUsername = currenthost.split(".").slice(1).join(".");
  const host = prc.baseUrl.replaceAll("http://", "").replaceAll("https://", "");

  if (host === currenthost) {
    throw showError({
      statusCode: 404,
      statusMessage: "not found",
    });
  }

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
    const event = await $client.event.getByUsernameAndSlug.query({
      username,
      slug: route.params.slug as string,
    });

    if (!event) {
      throw showError({
        statusCode: 404,
        statusMessage: "not found",
      });
    }

    state.event = event as any;
  } catch (err: any) {
    throw showError({
      statusCode: err.message === "not found" ? 404 : 500,
      statusMessage: err.message,
    });
  }
});
</script>
