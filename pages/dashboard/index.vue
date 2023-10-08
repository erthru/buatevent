<template>
  <div class="counter" style="display: flex; width: 100%; gap: 16px">
    <ElCard v-if="user?.role === 'ORGANIZER'" style="width: 100%">
      <div style="display: flex; align-items: center; column-gap: 16px">
        <div style="width: 100%; flex: 1 1 0%">
          <p
            class="title"
            style="font-weight: 600; margin-bottom: 4px; color: #303133"
          >
            {{ data?.eventsTotal.toLocaleString() }}
          </p>
          <NuxtLink
            to="/dashboard/events"
            style="font-size: 14px; font-weight: 500"
            >Lihat Event</NuxtLink
          >
        </div>
        <ElIcon style="color: #303133; font-size: 40px; color: #303133">
          <Calendar />
        </ElIcon>
      </div>
    </ElCard>
    <ElCard v-if="user?.role === 'ADMIN'" style="width: 100%">
      <div style="display: flex; align-items: center; column-gap: 16px">
        <div style="width: 100%; flex: 1 1 0%">
          <p
            class="title"
            style="font-weight: 600; margin-bottom: 4px; color: #303133"
          >
            {{ data?.organizersTotal.toLocaleString() }}
          </p>
          <NuxtLink
            to="/dashboard/organizers"
            style="font-size: 14px; font-weight: 500"
            >Lihat Organizer</NuxtLink
          >
        </div>
        <ElIcon style="color: #303133; font-size: 40px; color: #303133">
          <Calendar />
        </ElIcon>
      </div>
    </ElCard>
    <ElCard v-if="user?.role === 'ORGANIZER'" style="width: 100%">
      <div style="display: flex; align-items: center; column-gap: 16px">
        <div style="width: 100%; flex: 1 1 0%">
          <p
            class="title"
            style="font-weight: 600; margin-bottom: 6px; color: #303133"
          >
            Rp {{ user.organizer?.balance.toLocaleString() }}
          </p>
          <p
            style="
              font-size: 14px;
              font-weight: 500;
              cursor: pointer;
              color: var(--el-color-primary);
            "
            @click="null"
          >
            Tarik Saldo
          </p>
        </div>
        <ElIcon style="color: #303133; font-size: 40px; color: #303133">
          <Money />
        </ElIcon>
      </div>
    </ElCard>
    <ElCard v-if="user?.role === 'ADMIN'" style="width: 100%">
      <div style="display: flex; align-items: center; column-gap: 16px">
        <div style="width: 100%; flex: 1 1 0%">
          <p
            class="title"
            style="font-weight: 600; margin-bottom: 6px; color: #303133"
          >
            Rp {{ data?.accumulativeBalance.toLocaleString() }}
          </p>
          <a
            :href="prc.paymentDashboardUrl"
            target="_blank"
            style="font-size: 14px; font-weight: 500"
            @click="null"
          >
            Cek Payment Dashboard
          </a>
        </div>
        <ElIcon style="color: #303133; font-size: 40px; color: #303133">
          <Money />
        </ElIcon>
      </div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
import { Calendar, Money } from "@element-plus/icons-vue";

const { public: prc } = useRuntimeConfig();
const { setError } = useCustomError();
const { user } = useUser();
const { $client } = useNuxtApp();

useHead({
  title: `Dashboard | ${prc.appTitle}`,
});

definePageMeta({
  middleware: "auth-middleware",
  layout: "dashboard",
});

const { data } = useLazyAsyncData("dashboard", async () => {
  try {
    let eventsTotal = 0;
    let organizersTotal = 0;
    let accumulativeBalance = 0;

    if (user.value?.role === "ORGANIZER") {
      const events = await $client.event.getAllByOrganizer.query();
      eventsTotal = events.length;
    }

    if (user.value?.role === "ADMIN") {
      const organizers = await $client.organizer.getAll.query();
      organizersTotal = organizers.length;

      const _accumulativeBalance =
        await $client.admin.getAccumulativeBalance.query();

      accumulativeBalance = _accumulativeBalance;
    }

    return {
      eventsTotal,
      organizersTotal,
      accumulativeBalance,
    };
  } catch (err: any) {
    setError(err?.data?.httpStatus || 500, err.message);
  }
});
</script>

<style scoped>
.counter {
  flex-direction: column;
}

.counter .title {
  font-size: 26px;
}

@media (min-width: 768px) {
  .counter {
    flex-direction: row;
  }

  .counter .title {
    font-size: 36px;
  }
}
</style>
