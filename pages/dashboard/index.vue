<template>
  <ElCard>
    <p>dashboard</p>
  </ElCard>
</template>

<script setup lang="ts">
const { public: prc } = useRuntimeConfig();
const menu = useMenu();
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
    menu.setTitle("Dashboard");

    menu.setBreadcrumbs([
      {
        title: "Dashboard",
        to: "/dashboard",
      },
    ]);
  } catch (err: any) {
    setError(500, err.message);
  }
});
</script>
