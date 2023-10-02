<template>
  <ElCard>
    <p>tiket</p>
  </ElCard>
</template>

<script lang="ts" setup>
const { public: prc } = useRuntimeConfig();
const menu = useMenu();
const route = useRoute();
const { user } = useUser();
const { setError } = useCustomError();
const { $client } = useNuxtApp();
const router = useRouter();

useHead({
  title: `Kelola Tiket Event | ${prc.appTitle}`,
});

definePageMeta({
  middleware: "auth-middleware",
  layout: "dashboard",
});

const { data, pending: isLoading } = useLazyAsyncData(
  "dashboardEventsIdTickets",
  async () => {
    try {
      if (user.value?.role !== "ORGANIZER") {
        router.push("/dashboard");
        return;
      }

      menu.setTitle("Kelola Tiket Event");

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
          title: "Kelola Tiket Event",
          to: `/dashbaord/events/${route.params.id}/tickets`,
        },
      ]);

      return await $client.event.getById.query({
        id: Number(route.params.id),
      });
    } catch (err: any) {
      setError(err?.data?.httpStatus || 500, err.message);
    }
  }
);
</script>
