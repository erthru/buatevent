<template>
  <ElCard>
    <p>dashboard event</p>
  </ElCard>
</template>

<script setup lang="ts">
const { public: prc } = useRuntimeConfig();
const menu = useMenu();

useHead({
  title: `Event | ${prc.appTitle}`,
});

definePageMeta({
  middleware: "auth-middleware",
  layout: "dashboard",
});

useAsyncData("dashboardEvents", async () => {
  menu.setTitle("Event");

  menu.setBreadcrumbs([
    {
      title: "Dashboard",
      to: "/dashboard",
    },
    {
      title: "Event",
      to: "/dashbaord/events",
    },
  ]);
});
</script>
