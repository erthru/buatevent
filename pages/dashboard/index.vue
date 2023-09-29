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

const { error } = useLazyAsyncData("dashboard", async () => {
  try {
    menu.setTitle("Dashboard");

    menu.setBreadcrumbs([
      {
        title: "Dashboard",
        to: "/dashboard",
      },
    ]);
  } catch (err: any) {
    throw new Error(err.message);
  }
});

watch(
  () => error.value,
  (val) => {
    if (val) {
      ElNotification({
        title: "Error",
        message: val.message,
        type: "error",
      });
    }
  },
  {
    immediate: true,
  }
);
</script>
