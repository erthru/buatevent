<template>
  <ElCard>
    <div
      class="action"
      style="display: flex; width: 100%; row-gap: 16px; align-items: center"
    >
      <ElInput
        v-model="state.search"
        placeholder="Cari ..."
        class="search"
        style="width: max-content"
      />
    </div>
    <ElTable
      :data="organizers.data"
      stripe
      v-loading="isLoading"
      style="margin-top: 16px"
    >
      <ElTableColumn label="No" width="50">
        <template #default="{ $index }">
          <span>{{ $index + 1 + (state.page - 1) * state.pageSize }}</span>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="username" label="Username" width="200" />
      <ElTableColumn prop="name" label="Nama Organizer" />
      <ElTableColumn prop="phone" label="No. HP" width="150" />
      <ElTableColumn label="Aksi" width="150">
        <template #default="{ row }">
          <a :href="`${protocol}//${row?.username}.${host}`" target="_blank">
            <ElButton type="success">Lihat Halaman</ElButton>
          </a>
        </template>
      </ElTableColumn>
    </ElTable>
    <ElPagination
      class="pagination"
      layout="prev, pager, next, total"
      style="margin-top: 16px; width: max-content"
      :pager-count="3"
      :total="organizers.total"
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
const { user } = useUser();
const { setError } = useCustomError();

useHead({
  title: `Organizer | ${prc.appTitle}`,
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

const { data, pending: isLoading } = useLazyAsyncData(
  "dashboardOrganizers",
  async () => {
    try {
      if (user.value?.role !== "ADMIN") {
        router.push("/dashboard");
        return;
      }

      menu.setTitle("Organizer");

      menu.setBreadcrumbs([
        {
          title: "Dashboard",
          to: "/dashboard",
        },
        {
          title: "Organizer",
          to: "/dashboard/organizers",
        },
      ]);

      return await $client.organizer.getAll.query();
    } catch (err: any) {
      setError(err?.data?.httpStatus || 500, err.message);
    }
  }
);

const organizers = computed(() => {
  const filteredOrganizers =
    data.value?.filter((organizer) =>
      organizer.name.toLowerCase().includes(state.search.toLowerCase())
    ) || [];

  const startIndex = (state.page - 1) * state.pageSize;
  const endIndex = startIndex + state.pageSize;

  return {
    data: filteredOrganizers.slice(startIndex, endIndex),
    total: filteredOrganizers.length,
  };
});

const host = computed(() => {
  return prc.baseUrl.replaceAll("http://", "").replace("https://", "");
});

const protocol = computed(() => {
  return new URL(prc.baseUrl).protocol;
});
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
