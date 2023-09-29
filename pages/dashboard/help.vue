<template>
  <ElCard>
    <p>dashboard bantuan</p>
  </ElCard>
</template>

<script setup lang="ts">
const { public: prc } = useRuntimeConfig();
const menu = useMenu();
const { setError } = useCustomError();

useHead({
  title: `Bantuan | ${prc.appTitle}`,
});

definePageMeta({
  middleware: "auth-middleware",
  layout: "dashboard",
});

useLazyAsyncData("dashboardHelp", async () => {
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
    setError(err?.data?.httpStatus || 500, err.message);
  }
});
</script>
