<template>
  <p style="font-size: 26px; font-weight: 600">
    {{
      route.query.q
        ? `Menampilkan pencarian untuk: "${route.query.q}"`
        : "Event"
    }}
  </p>
  <p v-if="!isLoading && data?.length === 0" style="margin-top: 10px">
    tidak ada event
  </p>
  <ListPublicEvents
    :events="(data as any)"
    style="margin-top: 18px"
    v-loading="isLoading"
  />
</template>

<script lang="ts" setup>
const { public: prc } = useRuntimeConfig();
const route = useRoute();
const { setError } = useCustomError();
const { $client } = useNuxtApp();

useHead({
  title: `Event | ${prc.appTitle}`,
});

const {
  data,
  pending: isLoading,
  refresh,
} = useLazyAsyncData("events", async () => {
  try {
    return await $client.event.getAllPublished.query({
      q: (route.query.q || "") as string,
    });
  } catch (err: any) {
    setError(err?.data?.httpStatus || 500, err.message);
  }
});

watch(
  () => route.query.q,
  () => {
    refresh();
  }
);
</script>
