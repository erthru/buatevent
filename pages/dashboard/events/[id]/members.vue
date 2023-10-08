<template>
  <ElCard v-loading="isLoading" style="margin-top: 16px">
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
      :data="eventMembers.data"
      stripe
      v-loading="isLoading"
      style="margin-top: 16px"
    >
      <ElTableColumn label="No" width="50">
        <template #default="{ $index }">
          <span>{{ $index + 1 + (state.page - 1) * state.pageSize }}</span>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="name" label="Nama" width="150" />
      <ElTableColumn prop="phone" label="No. HP" width="100" />
      <ElTableColumn prop="email" label="email" width="200" />
      <ElTableColumn prop="status" label="status" width="150">
        <template #default="{ row }">
          <p>
            {{
              row.status === "PAID"
                ? "Telah dibayar"
                : row.status === "PENDING"
                ? "Menunggu Pembayaran"
                : "Expired"
            }}
          </p>
        </template>
      </ElTableColumn>
      <ElTableColumn label="Tiket">
        <template #default="{ row }">
          <p>{{ row.eventTicket.name }}</p>
        </template>
      </ElTableColumn>
      <ElTableColumn label="Aksi" width="280">
        <template #default="{ row }">
          <div style="display: flex">
            <ElButton
              v-if="row.status === 'PENDING'"
              type="warning"
              @click="showSendInvoiceModal(row)"
              >Kirim Invoice</ElButton
            >
            <ElButton
              v-if="row.status === 'PAID'"
              type="warning"
              @click="showSendTicketModal(row)"
              >Kirim Tiket</ElButton
            >
            <ElButton type="warning" @click="null">Perbarui Status</ElButton>
          </div>
        </template>
      </ElTableColumn>
    </ElTable>
    <ElPagination
      class="pagination"
      layout="prev, pager, next, total"
      style="margin-top: 16px; width: max-content"
      :pager-count="3"
      :total="eventMembers.total"
      :page-size="state.pageSize"
      :default-current-page="state.page"
      @current-change="(val) => (state.page = val)"
    />
  </ElCard>
  <ClientOnly>
    <ElDialog
      v-model="state.isSendTicketModalShown"
      title="Kirim Tiket"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :width="breakpoint === 'sm' ? '90%' : '460px'"
    >
      <p>
        Tiket otomatis telah dikirim saat anggota menyelesaikan pembayaran
        (Tiket berbayar), apakah anda ingin mengirimkan tiket kembali?
      </p>
      <template #footer>
        <div>
          <ElButton
            v-if="!state.isSendingTicket"
            @click="state.isSendTicketModalShown = false"
            >Tutup</ElButton
          >
          <ElButton
            type="primary"
            @click="null"
            :disabled="state.isSendingTicket"
            v-loading="state.isSendingTicket"
            >Kirim</ElButton
          >
        </div>
      </template>
    </ElDialog>
    <ElDialog
      v-model="state.isSendInvoiceModalShown"
      title="Kirim Invoice"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :width="breakpoint === 'sm' ? '90%' : '460px'"
    >
      <p>
        Invoice otomatis telah dikirim saat anggota membeli tiket (Tiket
        berbayar), apakah anda ingin mengirimkan invoice kembali?
      </p>
      <template #footer>
        <div>
          <ElButton
            v-if="!state.isSendingInvoice"
            @click="state.isSendInvoiceModalShown = false"
            >Tutup</ElButton
          >
          <ElButton
            type="primary"
            @click="null"
            :disabled="state.isSendingInvoice"
            v-loading="state.isSendingInvoice"
            >Kirim</ElButton
          >
        </div>
      </template>
    </ElDialog>
  </ClientOnly>
</template>

<script lang="ts" setup>
import { Prisma } from "@prisma/client";

const { public: prc } = useRuntimeConfig();
const menu = useMenu();
const route = useRoute();
const { user } = useUser();
const { setError } = useCustomError();
const { $client } = useNuxtApp();
const router = useRouter();
const breakpoint = useBreakpoint();

useHead({
  title: `Kelola Anggota Event | ${prc.appTitle}`,
});

definePageMeta({
  middleware: "auth-middleware",
  layout: "dashboard",
});

const state = reactive({
  search: "",
  page: 1,
  pageSize: 15,
  selectedEventMember: null as Prisma.EventMemberGetPayload<{}> | null,
  isSendTicketModalShown: false,
  isSendingTicket: false,
  isSendInvoiceModalShown: false,
  isSendingInvoice: false,
});

const {
  data,
  pending: isLoading,
  refresh,
} = useLazyAsyncData("dasboardEventsIdMembers", async () => {
  try {
    if (user.value?.role !== "ORGANIZER") {
      router.push("/dashboard");
      return;
    }

    menu.setTitle("Kelola Anggota Event");

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
        title: "Kelola Anggota Event",
        to: `/dashbaord/events/${route.params.id}/members`,
      },
    ]);

    return await $client.eventMember.getAllByEventId.query({
      eventId: Number(route.params.id),
    });
  } catch (err: any) {
    setError(err?.data?.httpStatus || 500, err.message);
  }
});

const showSendTicketModal = (eventMember: Prisma.EventMemberGetPayload<{}>) => {
  state.selectedEventMember = eventMember;
  state.isSendTicketModalShown = true;
};

const showSendInvoiceModal = (
  eventMember: Prisma.EventMemberGetPayload<{}>
) => {
  state.selectedEventMember = eventMember;
  state.isSendInvoiceModalShown = true;
};

const eventMembers = computed(() => {
  const filteredEventMembers =
    data.value?.filter((eventMember) =>
      eventMember.name.toLowerCase().includes(state.search.toLowerCase())
    ) || [];

  const startIndex = (state.page - 1) * state.pageSize;
  const endIndex = startIndex + state.pageSize;

  return {
    data: filteredEventMembers.slice(startIndex, endIndex),
    total: filteredEventMembers.length,
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
