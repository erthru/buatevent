<template>
    <ElCard>
      <p>dashboard event add</p>
    </ElCard>
  </template>
  
  <script setup lang="ts">
  const { public: prc } = useRuntimeConfig();
  const menu = useMenu();
  
  useHead({
    title: `Tambah Event | ${prc.appTitle}`,
  });
  
  definePageMeta({
    middleware: "auth-middleware",
    layout: "dashboard",
  });
  
  useAsyncData("dashboardEventsAdd", async () => {
    menu.setTitle("Tambah Event");
  
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
  