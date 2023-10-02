<template>
  <ElAlert
    v-if="!isLoading && data?.length === 0"
    type="warning"
    :closable="false"
    effect="dark"
    >Halaman event tidak akan tampil jika tiket belum ditambahkan</ElAlert
  >
  <ElCard v-loading="isLoading" style="margin-top: 16px">
    <pre>{{ data }}</pre>
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

      return await $client.eventTicket.getAllByEventId.query({
        eventId: Number(route.params.id),
      });
    } catch (err: any) {
      setError(err?.data?.httpStatus || 500, err.message);
    }
  }
);
</script>
