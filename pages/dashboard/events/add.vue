<template>
  <ElCard>
    <FormAddEvent />
  </ElCard>
</template>

<script setup lang="ts">
const { public: prc } = useRuntimeConfig();
const menu = useMenu();
const { user, fetchUser } = useUser();
const router = useRouter();

useHead({
  title: `Tambah Event | ${prc.appTitle}`,
});

definePageMeta({
  middleware: "auth-middleware",
  layout: "dashboard",
});

useLazyAsyncData("dashboardEventsAdd", async () => {
  try {
    if (!user.value) {
      await fetchUser();
    }

    if (user.value?.role !== "ORGANIZER") {
      router.push("/dashboard");
      return;
    }

    menu.setTitle("Tambah Event");

    menu.setBreadcrumbs([
      {
        title: "Dashboard",
        to: "/dashboard",
      },
      {
        title: "Event",
        to: "/dashboard/events",
      },
      {
        title: "Tambah Event",
        to: "/dashbaord/events/add",
      },
    ]);
  } catch (err: any) {
    throw new Error(err.message);
  }
});
</script>
