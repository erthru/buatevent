<template>
  <div class="counter" style="display: flex; width: 100%; gap: 16px">
    <ElCard
      v-if="user?.role === 'ORGANIZER'"
      style="width: 100%"
      v-loading="isLoading"
    >
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
    <ElCard
      v-if="user?.role === 'ADMIN'"
      style="width: 100%"
      v-loading="isLoading"
    >
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
    <ElCard
      v-if="user?.role === 'ORGANIZER'"
      style="width: 100%"
      v-loading="isLoading"
    >
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
            @click="showWithdrawModal"
          >
            Tarik Saldo
          </p>
        </div>
        <ElIcon style="color: #303133; font-size: 40px; color: #303133">
          <Money />
        </ElIcon>
      </div>
    </ElCard>
    <ElCard
      v-if="user?.role === 'ADMIN'"
      style="width: 100%"
      v-loading="isLoading"
    >
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
  <ClientOnly>
    <ElDialog
      v-model="state.isWithdrawModalShown"
      title="Tarik Saldo"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :width="breakpoint === 'sm' ? '90%' : '460px'"
    >
      <FormWithdraw
        :key="state.withdrawFormKey"
        ref="formWithdraw"
        :balance="user?.organizer?.balance || 0"
        @update:loading="(loading) => (state.isWithdawing = loading)"
        @withdrew="onWithdrew"
      />
      <template #footer>
        <div>
          <ElButton
            v-if="!state.isWithdawing"
            @click="state.isWithdrawModalShown = false"
            >Tutup</ElButton
          >
          <ElButton
            v-if="!state.isWithdawing"
            type="primary"
            @click="formWithdraw?.submit"
            >Simpan</ElButton
          >
        </div>
      </template>
    </ElDialog>
  </ClientOnly>
</template>

<script setup lang="ts">
import { Calendar, Money } from "@element-plus/icons-vue";
import FormWithdraw from "~/components/Form/Withdraw.vue";

const { public: prc } = useRuntimeConfig();
const { setError } = useCustomError();
const { user } = useUser();
const { $client } = useNuxtApp();
const formWithdraw = ref<typeof FormWithdraw>();
const breakpoint = useBreakpoint();

useHead({
  title: `Dashboard | ${prc.appTitle}`,
});

definePageMeta({
  middleware: "auth-middleware",
  layout: "dashboard",
});

const state = reactive({
  isWithdrawModalShown: false,
  isWithdawing: false,
  withdrawFormKey: `${new Date().getTime()}-wfk`,
});

const {
  data,
  pending: isLoading,
  refresh,
} = useLazyAsyncData("dashboard", async () => {
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

const showWithdrawModal = () => {
  state.withdrawFormKey = `${new Date().getTime()}-wfk`;
  state.isWithdrawModalShown = true;
};

const onWithdrew = () => {
  state.isWithdrawModalShown = false;
  refresh();
};
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
