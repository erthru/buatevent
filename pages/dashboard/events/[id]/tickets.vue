<template>
  <ElAlert
    v-if="!isLoading && data?.length === 0"
    type="warning"
    :closable="false"
    effect="dark"
    >Halaman event tidak akan tampil jika tiket belum ditambahkan</ElAlert
  >
  <ElCard v-loading="isLoading" style="margin-top: 16px">
    <div
      class="action"
      style="display: flex; width: 100%; row-gap: 16px; align-items: center"
    >
      <ElButton type="primary" style="width: max-content" @click="showAddModal"
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
      :data="eventTickets.data"
      stripe
      v-loading="isLoading"
      style="margin-top: 16px"
    >
      <ElTableColumn label="No" width="50">
        <template #default="{ $index }">
          <span>{{ $index + 1 + (state.page - 1) * state.pageSize }}</span>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="name" label="Nama" width="200" />
      <ElTableColumn prop="description" label="Deskripsi" />
      <ElTableColumn prop="price" label="Harga" width="150">
        <template #default="{ row }">
          <p>Rp {{ row.price.toLocaleString("id") }}</p>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="quota" label="Kuota" width="100" />
      <ElTableColumn label="Aksi" width="210">
        <template #default="{ row }">
          <div style="display: flex;">
            <ElButton type="warning" @click="showUpdateModal(row)"
              >Perbarui</ElButton
            >
            <ElButton type="danger" @click="showDeleteModal(row)"
              >Hapus</ElButton
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
      :total="eventTickets.total"
      :page-size="state.pageSize"
      :default-current-page="state.page"
      @current-change="(val) => (state.page = val)"
    />
  </ElCard>
  <ClientOnly>
    <ElDialog
      v-model="state.isAddModalShown"
      title="Tambah Tiket"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :width="breakpoint === 'sm' ? '90%' : '460px'"
    >
      <FormAddEventTicket
        :key="state.addFormKey"
        ref="formAddEventTicket"
        style="margin-top: -16px; margin-bottom: -16px"
        @update:loading="(loading) => (state.isAdding = loading)"
        @added="onAdded"
      />
      <template #footer>
        <div>
          <ElButton
            v-if="!state.isAdding"
            @click="state.isAddModalShown = false"
            >Tutup</ElButton
          >
          <ElButton
            v-if="!state.isAdding"
            type="primary"
            @click="formAddEventTicket?.submit"
            >Simpan</ElButton
          >
        </div>
      </template>
    </ElDialog>
    <ElDialog
      v-model="state.isDeleteModalShown"
      title="Hapus Tiket"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :width="breakpoint === 'sm' ? '90%' : '460px'"
    >
      <p>Apakah anda yakin dengan keputusan ini?</p>
      <template #footer>
        <div>
          <ElButton
            v-if="!state.isDeleting"
            @click="state.isDeleteModalShown = false"
            >Tutup</ElButton
          >
          <ElButton
            type="primary"
            @click="_delete"
            :disabled="state.isDeleting"
            v-loading="state.isDeleting"
            >Hapus</ElButton
          >
        </div>
      </template>
    </ElDialog>
  </ClientOnly>
</template>

<script lang="ts" setup>
import { Prisma } from "@prisma/client";
import AddEventTicket from "~/components/Form/AddEventTicket.vue";

const { public: prc } = useRuntimeConfig();
const menu = useMenu();
const route = useRoute();
const { user } = useUser();
const { setError } = useCustomError();
const { $client } = useNuxtApp();
const router = useRouter();
const formAddEventTicket = ref<typeof AddEventTicket>();
const breakpoint = useBreakpoint();

useHead({
  title: `Kelola Tiket Event | ${prc.appTitle}`,
});

definePageMeta({
  middleware: "auth-middleware",
  layout: "dashboard",
});

const state = reactive({
  search: "",
  page: 1,
  pageSize: 15,
  isAddModalShown: false,
  isUpdateModalShown: false,
  isDeleteModalShown: false,
  selectedEventTicket: null as Prisma.EventTicketGetPayload<{}> | null,
  isDeleting: false,
  isAdding: false,
  isUpdating: false,
  addFormKey: `${new Date().getTime()}-afk`,
  updateFormKey: `${new Date().getTime()}-ufk`,
});

const {
  data,
  pending: isLoading,
  refresh,
} = useLazyAsyncData("dashboardEventsIdTickets", async () => {
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
});

const showAddModal = () => {
  state.addFormKey = `${new Date().getTime()}-afk`;
  state.selectedEventTicket = null;
  state.isAddModalShown = true;
};

const showUpdateModal = (eventTicket: Prisma.EventTicketGetPayload<{}>) => {
  state.updateFormKey = `${new Date().getTime()}-ufk`;
  state.selectedEventTicket = eventTicket;
  state.isUpdateModalShown = true;
};

const showDeleteModal = (eventTicket: Prisma.EventTicketGetPayload<{}>) => {
  state.selectedEventTicket = eventTicket;
  state.isDeleteModalShown = true;
};

const onAdded = () => {
  state.isAddModalShown = false;
  refresh();
};

const _delete = async () => {
  try {
    state.isDeleting = true;

    await $client.eventTicket.delete.mutate({
      id: state.selectedEventTicket?.id!!,
    });

    ElNotification({
      title: "Sukses",
      message: "Tiket berhasil dihapus",
      type: "success",
    });

    state.isDeleteModalShown = false;
    refresh();
  } catch (err: any) {
    ElNotification({
      title: "Error",
      message: err.message,
      type: "error",
    });
  } finally {
    state.isDeleting = false;
  }
};

const eventTickets = computed(() => {
  const filteredEventTickets =
    data.value?.filter((eventTicket) =>
      eventTicket.name.toLowerCase().includes(state.search.toLowerCase())
    ) || [];

  const startIndex = (state.page - 1) * state.pageSize;
  const endIndex = startIndex + state.pageSize;

  return {
    data: filteredEventTickets.slice(startIndex, endIndex),
    total: filteredEventTickets.length,
  };
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
