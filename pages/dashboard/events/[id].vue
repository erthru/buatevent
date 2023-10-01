<template>
  <NuxtLink
    :to="`/dashboard/events/${route.params.id}/tickets`"
    style="color: white; font-weight: 500"
  >
    <ElAlert :closable="false" type="warning" effect="dark">
      <p>Anda dapat mengatur tiket di sini</p>
    </ElAlert></NuxtLink
  >
  <ElCard style="margin-top: 16px">
    <FormUpdateEvent
      :key="state.formKey"
      v-loading="isLoading"
      :event="(data as any)"
      @updated="refresh"
    />
  </ElCard>
</template>

<script setup lang="ts">
const { public: prc } = useRuntimeConfig();
const menu = useMenu();
const { user, fetchUser } = useUser();
const router = useRouter();
const route = useRoute();
const { setError } = useCustomError();
const { $client } = useNuxtApp();

useHead({
  title: `Perbarui Event | ${prc.appTitle}`,
});

definePageMeta({
  middleware: "auth-middleware",
  layout: "dashboard",
});

const state = reactive({
  formKey: `${new Date().getTime()}-fk`,
});

const {
  data,
  pending: isLoading,
  refresh,
} = useLazyAsyncData("dashboardEventsId", async () => {
  try {
    if (!user.value) {
      await fetchUser();
    }

    if (user.value?.role !== "ORGANIZER") {
      router.push("/dashboard");
      return;
    }

    menu.setTitle("Perbarui Event");

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
        title: "Perbarui Event",
        to: `/dashbaord/events/${route.params.id}`,
      },
    ]);

    return await $client.event.getById.query({
      id: Number(route.params.id),
    });
  } catch (err: any) {
    if (process.server) {
      setError(err?.data?.httpStatus || 500, err.message);
    } else {
      ElNotification({
        title: "Error",
        message: err.message,
        type: "error",
      });
    }
  }
});

watch(
  () => data.value,
  () => {
    state.formKey = `${new Date().getTime()}-fk`;
  }
);
</script>
