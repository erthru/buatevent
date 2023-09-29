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

const { error } = useLazyAsyncData("dashboardHelp", async () => {
  try {
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
