<template>
  <div style="width: 100%; display: flex; flex-direction: column">
    <header
      style="
        width: 100%;
        position: relative;
        display: flex;
        align-items: center;
      "
    >
      <img
        :src="`/uploads/${data?.thumbnail || 'default.png'}`"
        alt="avatar"
        style="width: 100%; height: 100%; object-fit: cover"
      />
    </header>
    <div
      class="content"
      style="
        display: flex;
        width: 100%;
        gap: 16px;
        margin: 0 auto;
        max-width: 1200px;
      "
    >
      <ElCard style="width: 100%; flex: 1 1 0%">
        <div style="display: flex; align-items: center">
          <p style="font-size: 28px; font-weight: 600; color: #303133">
            {{ data?.title }}
          </p>
          <ElTag size="small" type="success" style="margin-left: 8px">{{
            data?.category.name
          }}</ElTag>
        </div>
        <div v-html="data?.body" style="margin-top: 16px" />
        <div style="display: flex; align-items: center; margin-top: 18px">
          <ElIcon style="color: #303133">
            <DataBoard />
          </ElIcon>
          <p style="margin-left: 8px; text-transform: capitalize">
            {{
              data?.type === "BOTH"
                ? "Offline & Online"
                : data?.type.toLowerCase()
            }}
          </p>
          <ElTag
            v-if="getExpired(new Date(data?.endAt!!))"
            size="small"
            type="danger"
            style="margin-left: 10px"
            >Expired</ElTag
          >
        </div>
        <div style="display: flex; align-items: center; margin-top: 12px">
          <ElIcon style="color: #303133">
            <Clock />
          </ElIcon>
          <p style="margin-left: 8px; color: #">
            {{ new Date(data?.startAt!!).toLocaleDateString("id") }}
            {{ new Date(data?.startAt!!).toLocaleTimeString("id") }} -
            {{ new Date(data?.endAt!!).toLocaleDateString("id") }}
            {{ new Date(data?.endAt!!).toLocaleTimeString("id") }}
          </p>
          <ElTag
            v-if="getExpired(new Date(data?.endAt!!))"
            size="small"
            type="danger"
            style="margin-left: 10px"
            >Expired</ElTag
          >
        </div>
        <div
          style="
            display: flex;
            width: 100%;
            align-items: center;
            margin-top: 28px;
          "
        >
          <img
            :src="`/uploads/${data?.organizer.avatar || 'default.png'}`"
            alt="thumbnail"
            style="width: 46px; height: 46px; border-radius: 100%"
          />
          <div style="margin-left: 16px; display: flex; flex-direction: column">
            <p style="font-size: 14px; font-weight: 500; color: #303133">
              Oleh
            </p>
            <a style="font-size: 18px; font-weight: 600; color: #303133">
              {{ data?.organizer.name }}
            </a>
            <a
              href="/"
              style="font-size: 12px; margin-top: 2px; font-weight: 600"
            >
              Lihat Event Lainnya
            </a>
          </div>
        </div>
      </ElCard>
      <ElCard class="sidebar" style="height: max-content">
        <p style="font-size: 18px; font-weight: 600">Pilih Tiket</p>
        <ElSelect
          v-model="state.ticket"
          placeholder="Pilih Tiket"
          style="width: 100%; margin-top: 14px"
        >
          <ElOption
            v-for="item in data?.eventTickets"
            :key="item.id"
            :label="item.name"
            :value="item.id.toString()"
          />
        </ElSelect>
        <div v-loading="state.isCheckingQuota" style="margin-top: 10px">
          <p style="font-weight: 500; font-size: 14px">
            Rp
            <span
              :style="{
                color: data?.eventTickets.find(
                  (et) => et.id === Number(state.ticket)
                )?.price
                  ? '#303133'
                  : '#529b2e',
              }"
              >{{
                data?.eventTickets.find((et) => et.id === Number(state.ticket))
                  ?.price
                  ? data?.eventTickets
                      .find((et) => et.id === Number(state.ticket))
                      ?.price.toLocaleString()
                  : "Gratis"
              }}</span
            >
          </p>
          <p style="font-weight: 500; font-size: 14px; margin-top: 10px">
            Sisa Kuota:
            <span
              :style="{
                color: state.quota > 0 ? '#529b2e' : '#c45656',
              }"
              >{{ state.quota }}</span
            >
          </p>
          <ElButton
            :disabled="state.quota === 0"
            type="primary"
            style="margin-top: 12px; width: 100%"
            >Beli Tiket</ElButton
          >
        </div>
      </ElCard>
    </div>
  </div>
</template>

<script lang="ts" setup>
import dns from "dns";
import { Clock, DataBoard } from "@element-plus/icons-vue";

definePageMeta({
  layout: "public-organizer",
});

const { $client, ssrContext } = useNuxtApp();
const { public: prc } = useRuntimeConfig();
const route = useRoute();
const { setError } = useCustomError();

const state = reactive({
  ticket: "",
  isCheckingQuota: false,
  quota: 0,
});

const { data } = useLazyAsyncData("slug", async () => {
  try {
    const currentHost = process.server
      ? ssrContext?.event.node.req.headers.host
      : window.location.host;

    let username = currentHost?.split(".")[0];

    const currentHostWithoutUsername = currentHost
      ?.split(".")
      .slice(1)
      .join(".");

    const host = prc.baseUrl
      .replaceAll("http://", "")
      .replaceAll("https://", "");

    if (host === currentHost) {
      throw {
        data: {
          httpStatus: 404,
        },
        message: "not found",
      };
    }

    if (host !== currentHostWithoutUsername) {
      username = await new Promise((resolve, reject) => {
        dns.resolveCname(currentHostWithoutUsername!!, (error, addresses) => {
          if (error) {
            reject(error);
            return;
          }

          resolve(addresses[0]);
        });
      });
    }

    const event = await $client.event.getByUsernameAndSlug.query({
      username: username!!,
      slug: route.params.slug as string,
    });

    if (!event) {
      throw {
        data: {
          httpStatus: 404,
        },
        message: "not found",
      };
    }

    return event;
  } catch (err: any) {
    setError(err?.data?.httpStatus || 500, err.message);
  }
});

useHead({
  title: `${data.value?.title} | ${prc.appTitle}`,
});

const getExpired = (endAt: Date): boolean => {
  const todayTime = new Date().getTime();
  const endDayTime = new Date(endAt).getTime();
  return endDayTime < todayTime;
};

const checkTicketQuota = async () => {
  try {
    state.isCheckingQuota = true;

    const quotaLeft = await $client.eventTicket.getQuotaLeft.query({
      id: Number(state.ticket),
    });

    state.quota = quotaLeft;
  } catch (err: any) {
    state.quota = 0;

    ElNotification({
      title: "Error",
      message: err.message,
      type: "error",
    });
  } finally {
    state.isCheckingQuota = false;
  }
};

watch(
  () => data.value,
  (val) => {
    state.ticket = val?.eventTickets[0]?.id.toString() || "";
  },
  { immediate: true }
);

watch(
  () => state.ticket,
  () => {
    checkTicketQuota();
  },
  {
    immediate: true,
  }
);
</script>

<style scoped>
header {
  height: 250px;
}

header .event-title {
  font-size: 26px;
}

.content {
  flex-direction: column;
  padding: 16px;
}

.content .sidebar {
  width: 100%;
}

@media (min-width: 768px) {
  header {
    height: 340px;
  }

  header .event-title {
    font-size: 46px;
  }

  .content {
    flex-direction: row;
    padding: 24px;
  }

  .content .sidebar {
    width: 350px;
  }
}
</style>
