<template>
  <p style="font-size: 26px; font-weight: 600">
    Kategori {{ data?.category?.name }}
  </p>
  <p v-if="!isLoading && data?.events.length === 0" style="margin-top: 10px">
    tidak ada event
  </p>
  <ListPublicEvents
    :events="(data?.events as any)"
    style="margin-top: 18px"
    v-loading="isLoading"
  />
</template>

<script lang="ts" setup>
const { public: prc } = useRuntimeConfig();
const { setError } = useCustomError();
const route = useRoute();
const { $client } = useNuxtApp();

const { data, pending: isLoading } = useLazyAsyncData(
  "categories",
  async () => {
    try {
      const category = await $client.category.getBySlug.query({
        slug: route.params.slug as string,
      });

      const events = await $client.event.getAllPublished.query({
        q: "",
        categoryId: category?.id,
      });

      return {
        category,
        events,
      };
    } catch (err: any) {
      setError(err?.data?.httpStatus || 500, err.message);
    }
  }
);

useHead({
  title: `Kategori ${data.value?.category?.name} | ${prc.appTitle}`,
});
</script>
