<template>
  <ElCard>
    <p>dashboard</p>
  </ElCard>
</template>

<script setup lang="ts">
const { public: prc } = useRuntimeConfig();
const { setError } = useCustomError();

useHead({
  title: `Dashboard | ${prc.appTitle}`,
});

definePageMeta({
  middleware: "auth-middleware",
  layout: "dashboard",
});

useLazyAsyncData("dashboard", async () => {
  try {
  } catch (err: any) {
    setError(err?.data?.httpStatus || 500, err.message);
  }
});
</script>
