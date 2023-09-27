<template>
  <ElCard>
    <p>dashboard</p>
  </ElCard>
</template>

<script setup lang="ts">
const { public: prc } = useRuntimeConfig();
const menu = useMenu();

useHead({
  title: `Dashboard | ${prc.appTitle}`,
});

definePageMeta({
  middleware: "auth-middleware",
  layout: "dashboard",
});

useAsyncData("dashboard", async () => {
  menu.setTitle("Dashboard");

  menu.setBreadcrumbs([
    {
      title: "Dashboard",
      to: "/dashboard",
    },
  ]);
});
</script>
