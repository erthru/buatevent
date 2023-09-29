<template>
  <ElCard>
    <div
      class="action"
      style="display: flex; width: 100%; row-gap: 16px; align-items: center"
    >
      <ElButton
        type="primary"
        style="width: max-content"
        @click="router.push('/dashboard/events/add')"
        >Tambah</ElButton
      >
      <ElInput
        v-model="state.search"
        placeholder="Cari ..."
        class="search"
        style="width: max-content"
      />
    </div>
    <ElTable
      :data="events.data"
      stripe
      v-loading="isLoading"
      style="margin-top: 16px"
    >
      <ElTableColumn label="No" width="50">
        <template #default="{ $index }">
          <span>{{ $index + 1 + (state.page - 1) * state.pageSize }}</span>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="title" label="Judul" />
      <ElTableColumn prop="startAt" label="Mulai Pada">
        <template #default="{ row }">
          <p>
            {{
              `${new Date(row.startAt).toLocaleDateString("id")} ${new Date(
                row.startAt
              ).toLocaleTimeString("id")}`
            }}
          </p>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="endAt" label="Berakhir Pada">
        <template #default="{ row }">
          <p>
            {{
              `${new Date(row.endAt).toLocaleDateString("id")} ${new Date(
                row.endAt
              ).toLocaleTimeString("id")}`
            }}
          </p>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="type" label="Tipe" width="150">
        <template #default="{ row }">
          <p>
            {{
              row.type === "ONLINE"
                ? "Online"
                : row.type === "OFFLINE"
                ? "Offline"
                : "Online & Offline"
            }}
          </p>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="isPublished" label="status" width="150">
        <template #default="{ row }">
          <p>{{ row.isPublished ? "Dipublikasi" : "Draft" }}</p>
        </template>
      </ElTableColumn>
      <ElTableColumn label="Aksi" width="215">
        <template #default="{ row }">
          <div style="display: flex; gap: 12px">
            <a
              :href="`${protocol}//${user?.organizer?.username}.${host}/${row.slug}`"
              target="_blank"
            >
              <ElButton type="success">Lihat Halaman</ElButton>
            </a>
            <ElButton
              type="warning"
              @click="router.push(`/dashboard/events/${row.id}`)"
              >Edit</ElButton
            >
          </div>
        </template>
      </ElTableColumn>
    </ElTable>
    <ElPagination
      class="pagination"
      layout="prev, pager, next, total"
      style="margin-top: 16px; width: max-content"
      :pager-count="3"
      :total="events.total"
      :page-size="state.pageSize"
      :default-current-page="state.page"
      @current-change="(val) => (state.page = val)"
    />
  </ElCard>
</template>

<script setup lang="ts">
const { public: prc } = useRuntimeConfig();
const menu = useMenu();
const { $client } = useNuxtApp();
const router = useRouter();
const { user, fetchUser } = useUser();

useHead({
  title: `Event | ${prc.appTitle}`,
});

definePageMeta({
  middleware: "auth-middleware",
  layout: "dashboard",
});

const state = reactive({
  search: "",
  page: 1,
  pageSize: 15,
});

const { data, pending: isLoading, error } = useLazyAsyncData(
  "dashboardEvents",
  async () => {
    try {
      if (!user.value) {
        await fetchUser();
      }

      if (user.value?.role !== "ORGANIZER") {
        router.push("/dashboard");
        return;
      }

      menu.setTitle("Event");

      menu.setBreadcrumbs([
        {
          title: "Dashboard",
          to: "/dashboard",
        },
        {
          title: "Event",
          to: "/dashboard/events",
        },
      ]);

      return await $client.event.getAllByOrganizer.query();
    } catch (err: any) {
      throw new Error(err.message);
    }
  }
);

const events = computed(() => {
  const filteredEvents =
    data.value?.filter((event) =>
      event.title.toLowerCase().includes(state.search.toLowerCase())
    ) || [];

  const startIndex = (state.page - 1) * state.pageSize;
  const endIndex = startIndex + state.pageSize;

  return {
    data: filteredEvents.slice(startIndex, endIndex),
    total: filteredEvents.length,
  };
});

const host = computed(() => {
  return prc.baseUrl.replaceAll("http://", "").replace("https://", "");
});

const protocol = computed(() => {
  return new URL(prc.baseUrl).protocol;
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

<style scoped>
.action {
  flex-direction: column;
}

.action .search {
  margin-left: auto;
  margin-right: auto;
}

.pagination {
  margin-left: auto;
  margin-right: auto;
}

@media (min-width: 768px) {
  .action {
    flex-direction: row;
  }

  .action .search {
    margin-right: 0;
  }

  .pagination {
    margin-left: 0;
    margin-right: 0;
  }
}
</style>
