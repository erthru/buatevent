<template>
  <ElCard>
    <p>dashboard bantuan</p>
  </ElCard>
</template>

<script setup lang="ts">
const { public: prc } = useRuntimeConfig();
const menu = useMenu();

useHead({
  title: `Bantuan | ${prc.appTitle}`,
});

definePageMeta({
  middleware: "auth-middleware",
  layout: "dashboard",
});

useAsyncData("help", async () => {
  menu.setTitle("Bantuan");

  menu.setBreadcrumbs([
    {
      title: "Dashboard",
      to: "/dashboard",
    },
    {
      title: "Bantuan",
      to: "/dashboard/help",
    },
  ]);
});
</script>
