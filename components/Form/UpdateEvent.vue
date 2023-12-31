<template>
  <ElForm
    v-if="props.event"
    v-loading="state.isLoading"
    ref="formRef"
    :model="form"
    label-position="top"
    style="display: flex; flex-direction: column; width: 100%"
  >
    <ElFormItem
      label="Judul"
      prop="title"
      :rules="{
        required: true,
        trigger: 'blur',
      }"
    >
      <ElInput v-model="form.title" placeholder="Masukkan judul" />
      <p style="font-size: 12px; margin-bottom: -10px; margin-top: -4px">
        *Mengganti judul akan mengubah alamat URL pada event ini, alamat URL
        saat ini adalah:
        <a
          :href="`${protocol}//${user?.organizer?.username}.${host}/${props.event.slug}`"
          target="_blank"
          style="font-weight: 500"
          >{{
            `${protocol}//${user?.organizer?.username}.${host}/${props.event.slug}`
          }}</a
        >
      </p>
    </ElFormItem>
    <ElFormItem
      label="Isi Postingan"
      prop="body"
      :rules="{
        required: true,
        trigger: 'blur',
      }"
    >
      <CustomEditor v-model="form.body" />
    </ElFormItem>
    <div
      class="c2c"
      style="display: flex; align-items: center; column-gap: 16px; width: 100%"
    >
      <ElFormItem
        label="Mulai Pada"
        prop="startAt"
        :rules="{
          required: true,
          trigger: 'blur',
        }"
        style="width: 100%"
      >
        <ClientOnly>
          <ElDatePicker
            v-model="form.startAt"
            type="datetime"
            placeholder="Pilih tgl & waktu"
            style="width: 100%"
          />
        </ClientOnly>
      </ElFormItem>
      <ElFormItem
        label="Berakhir Pada"
        prop="endAt"
        :rules="{
          required: true,
          trigger: 'blur',
        }"
        style="width: 100%"
      >
        <ClientOnly>
          <ElDatePicker
            v-model="form.endAt"
            type="datetime"
            placeholder="Pilih tgl & waktu"
            style="width: 100%"
          />
        </ClientOnly>
      </ElFormItem>
    </div>
    <div
      class="c2c"
      style="display: flex; align-items: center; column-gap: 16px; width: 100%"
    >
      <ElFormItem
        label="Jenis"
        prop="type"
        :rules="{
          required: true,
          trigger: 'blur',
        }"
        style="width: 100%"
      >
        <ElSelect
          v-model="form.type"
          class="m-2"
          placeholder="Pilih Tipe"
          style="width: 100%"
        >
          <ElOption
            v-for="item in typeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </ElSelect>
      </ElFormItem>
      <ElFormItem
        label="Status"
        prop="isPublished"
        :rules="{
          required: true,
          trigger: 'blur',
        }"
        style="width: 100%"
      >
        <ElSelect
          v-model="form.isPublished"
          class="m-2"
          placeholder="Pilih Status"
          style="width: 100%"
        >
          <ElOption
            v-for="(item, i) in isPublishedOptions"
            :key="`select-status-${i}`"
            :label="item.label"
            :value="item.value"
          />
        </ElSelect>
      </ElFormItem>
      <ElFormItem
        label="Kategori"
        prop="categoryId"
        :rules="{
          required: true,
          trigger: 'blur',
        }"
        style="width: 100%"
      >
        <ElSelect
          v-model="form.categoryId"
          class="m-2"
          placeholder="Pilih Kategori"
          style="width: 100%"
        >
          <ElOption
            v-for="(item, i) in state.categories"
            :key="`select-category-${i}`"
            :label="item.name"
            :value="item.id.toString()"
          />
        </ElSelect>
      </ElFormItem>
    </div>
    <ElFormItem label="Thumbnail" prop="thumbnail">
      <ElUpload
        :key="state.uploadThumbnailKey"
        :auto-upload="false"
        :limit="1"
        accept=".jpg, .png, .webp, .gif, .jpeg"
        :on-change="onSelectThumbnail"
      >
        <img
          v-if="props.event.thumbnail || state.selectedThumbnail"
          :src="
            !state.selectedThumbnail
              ? `/uploads/${props.event.thumbnail}`
              : getPreviewSelectedAvatar(state.selectedThumbnail!!)
          "
          style="width: 220px; height: 150px; object-fit: cover"
        />
        <div
          v-else
          style="
            width: 220px;
            height: 150px;
            display: flex;
            align-items: center;
            background-color: #e6e6e6;
          "
        >
          <ElIcon style="font-size: 32px; margin: 0 auto">
            <Plus />
          </ElIcon>
        </div>
      </ElUpload>
    </ElFormItem>
    <div class="c2c">
      <ElButton
        type="primary"
        style="width: max-content"
        @click="submit(formRef)"
        >Simpan</ElButton
      >
      <ElButton
        type="danger"
        style="width: max-content"
        @click="state.isDeleteModalShown = true"
        >Hapus</ElButton
      >
    </div>
    <ClientOnly>
      <ElDialog
        v-model="state.isDeleteModalShown"
        title="Hapus Event"
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
  </ElForm>
</template>

<script lang="ts" setup>
import { Plus } from "@element-plus/icons-vue";
import { Prisma } from "@prisma/client";
import { FormInstance, ElNotification } from "element-plus";
import { PropType } from "nuxt/dist/app/compat/capi";

const formRef = ref<FormInstance>();
const { $client } = useNuxtApp();
const router = useRouter();
const { public: prc } = useRuntimeConfig();
const { user } = useUser();
const route = useRoute();
const emit = defineEmits(["updated"]);
const breakpoint = useBreakpoint();

const props = defineProps({
  event: {
    type: Object as PropType<Prisma.EventGetPayload<{
      include: {
        _count: {
          select: {
            eventTickets: true;
          };
        };
      };
    }> | null>,
    default: () => {
      return null;
    },
  },
});

type Form = {
  title: string;
  body: string;
  type: "ONLINE" | "OFFLINE" | "BOTH";
  isPublished: boolean;
  startAt: string;
  endAt: string;
  categoryId: string;
};

const typeOptions = [
  {
    value: "ONLINE",
    label: "Online",
  },
  {
    value: "OFFLINE",
    label: "Offline",
  },
  {
    value: "BOTH",
    label: "Online & Offline",
  },
];

const isPublishedOptions = [
  {
    value: true,
    label: "Diterbitkan",
  },
  {
    value: false,
    label: "Draft",
  },
];

const state = reactive({
  isLoading: false,
  selectedThumbnail: null as File | null,
  uploadThumbnailKey: `${new Date().getTime()}-utk`,
  isDeleteModalShown: false,
  isDeleting: false,
  categories: [] as Prisma.CategoryGetPayload<{}>[],
});

const form = reactive<Form>({
  title: props.event?.title || "",
  body: props.event?.body || "",
  type: props.event?.type || "OFFLINE",
  isPublished: props.event?.isPublished || false,
  startAt: props.event?.startAt ? props.event?.startAt.toString() : "",
  endAt: props.event?.endAt ? props.event?.endAt.toString() : "",
  categoryId: props.event?.categoryId.toString()!!!,
});

const onSelectThumbnail = async (selectedFile: any) => {
  state.selectedThumbnail = selectedFile.raw;
  await nextTick();
  state.uploadThumbnailKey = `${new Date().getTime()}-utk`;
};

const getPreviewSelectedAvatar = (selectedThumbnail: File) => {
  return URL.createObjectURL(selectedThumbnail);
};

const host = computed(() => {
  return prc.baseUrl.replaceAll("http://", "").replace("https://", "");
});

const protocol = computed(() => {
  return new URL(prc.baseUrl).protocol;
});

const fetchCategories = async () => {
  try {
    const categories = await $client.category.getAll.query();
    state.categories = categories as any[];
  } catch (err: any) {
    ElNotification({
      title: "Error",
      message: err.message,
      type: "error",
    });
  }
};

const submit = async (formInstance: FormInstance | undefined) => {
  if (!formInstance) {
    return;
  }

  const isValid = await formInstance.validate();

  if (isValid) {
    try {
      state.isLoading = true;
      let thumbnailBase64 = "";

      if (state.selectedThumbnail) {
        thumbnailBase64 = await convertFileToBase64(state.selectedThumbnail);
      }

      await $client.event.update.mutate({
        id: Number(route.params.id),
        title: form.title,
        body: form.body,
        startAt: form.startAt,
        endAt: form.endAt,
        type: form.type,
        isPublished: form.isPublished,
        thumbnail: thumbnailBase64,
        categoryId: Number(form.categoryId),
      });

      ElNotification({
        title: "Sukses",
        message: "Berhasil memperbarui event",
        type: "success",
      });

      router.push(`/dashboard/events`);
    } catch (err: any) {
      ElNotification({
        title: "Error",
        message: err.message,
        type: "error",
      });
    } finally {
      state.isLoading = false;
    }
  }
};

const _delete = async () => {
  try {
    state.isDeleting = true;

    await $client.event.delete.mutate({
      id: Number(route.params.id),
    });

    ElNotification({
      title: "Sukses",
      message: "Berhasil menghapus event",
      type: "success",
    });

    router.push("/dashboard/events");
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

onMounted(() => {
  fetchCategories();
});
</script>

<style scoped>
.c2c {
  flex-direction: column;
}

@media (min-width: 768px) {
  .c2c {
    flex-direction: row;
  }
}
</style>
