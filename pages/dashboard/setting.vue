<template>
  <div class="wrapper" style="display: flex; width: 100%; gap: 16px">
    <ElCard style="width: 100%; height: max-content">
      <p style="font-size: 18px; font-weight: 600">Perbarui Profil</p>
      <FormUpdateOrganizer
        v-if="user?.role === 'ORGANIZER'"
        style="margin-top: 16px"
      />
    </ElCard>
    <ElCard style="width: 100%; height: max-content">
      <p style="font-size: 18px; font-weight: 600">Ganti Password</p>
      <FormUpdatePassword style="margin-top: 16px" />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
const { public: prc } = useRuntimeConfig();
const menu = useMenu();
const { user } = useUser();

useHead({
  title: `Pengaturan | ${prc.appTitle}`,
});

definePageMeta({
  middleware: "auth-middleware",
  layout: "dashboard",
});

useAsyncData("setting", async () => {
  menu.setTitle("Pengaturan");

  menu.setBreadcrumbs([
    {
      title: "Dashboard",
      to: "/dashboard",
    },
    {
      title: "Pengaturan",
      to: "/dashboard/setting",
    },
  ]);
});
</script>

<style scoped>
.wrapper {
  flex-direction: column;
}

@media (min-width: 768px) {
  .wrapper {
    flex-direction: row;
  }
}
</style>
