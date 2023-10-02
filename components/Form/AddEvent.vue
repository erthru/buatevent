<template>
  <ElForm
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
    </ElFormItem>
    <ElFormItem
      label="Isi Postingan"
      prop="body"
      :rules="{
        required: true,
        trigger: 'blur',
      }"
    >
      <ElInput
        v-model="form.body"
        type="textarea"
        placeholder="Masukkan isi postingan"
      />
    </ElFormItem>
    <ClientOnly>
      <div
        class="c2c"
        style="
          display: flex;
          align-items: center;
          column-gap: 16px;
          width: 100%;
        "
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
          <ElDatePicker
            v-model="form.startAt"
            type="datetime"
            placeholder="Pilih tgl & waktu"
            style="width: 100%"
          />
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
          <ElDatePicker
            v-model="form.endAt"
            type="datetime"
            placeholder="Pilih tgl & waktu"
            style="width: 100%"
          />
        </ElFormItem>
      </div>
    </ClientOnly>
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
          v-if="state.selectedThumbnail"
          :src="getPreviewSelectedAvatar(state.selectedThumbnail)"
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
    <ElButton type="primary" style="width: max-content" @click="submit(formRef)"
      >Simpan</ElButton
    >
  </ElForm>
</template>

<script lang="ts" setup>
import { Plus } from "@element-plus/icons-vue";
import { Prisma } from "@prisma/client";
import { FormInstance, ElNotification } from "element-plus";

const formRef = ref<FormInstance>();
const { $client } = useNuxtApp();
const router = useRouter();

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
  categories: [] as Prisma.CategoryGetPayload<{}>[],
});

const form = reactive<Form>({
  title: "",
  body: "",
  type: "OFFLINE",
  isPublished: false,
  startAt: "",
  endAt: "",
  categoryId: "",
});

const onSelectThumbnail = async (selectedFile: any) => {
  state.selectedThumbnail = selectedFile.raw;
  await nextTick();
  state.uploadThumbnailKey = `${new Date().getTime()}-utk`;
};

const getPreviewSelectedAvatar = (selectedThumbnail: File) => {
  return URL.createObjectURL(selectedThumbnail);
};

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

      const event = await $client.event.add.mutate({
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
        message: "Berhasil menambahkan event",
        type: "success",
      });

      router.push(`/dashboard/events/${event.id}/tickets`);
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
