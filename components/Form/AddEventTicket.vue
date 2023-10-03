<template>
  <ElForm
    v-loading="state.isLoading"
    ref="formRef"
    :model="form"
    label-position="top"
    style="display: flex; flex-direction: column; width: 100%"
  >
    <ElFormItem
      label="Nama"
      prop="name"
      :rules="{
        required: true,
        trigger: 'blur',
      }"
    >
      <ElInput v-model="form.name" placeholder="Masukkan nama" />
    </ElFormItem>
    <ElFormItem
      label="Deskripsi"
      prop="description"
      :rules="{
        required: true,
        trigger: 'blur',
      }"
    >
      <ElInput
        v-model="form.description"
        type="textarea"
        placeholder="Masukkan deskripsi"
      />
    </ElFormItem>
    <ElFormItem
      label="Harga"
      prop="price"
      :rules="{
        required: true,
        trigger: 'blur',
      }"
    >
      <ElInput
        v-model="form.price"
        type="number"
        placeholder="Masukkan harga"
      />
    </ElFormItem>
    <ElFormItem
      label="Kuota"
      prop="quota"
      :rules="{
        required: true,
        trigger: 'blur',
      }"
    >
      <ElInput v-model="form.quota" type="number" placeholder="Masukkan kuota">
        <template #append>
          <p>Orang</p>
        </template>
      </ElInput>
    </ElFormItem>
  </ElForm>
</template>

<script lang="ts" setup>
import { FormInstance, ElNotification } from "element-plus";

const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
});

const formRef = ref<FormInstance>();
const { $client } = useNuxtApp();
const emit = defineEmits(["update:loading", "added"]);
const route = useRoute();

type Form = {
  name: string;
  description: string;
  price: string;
  quota: string;
};

const form = reactive<Form>({
  name: "",
  description: "",
  price: "",
  quota: "",
});

const state = reactive({
  isLoading: props.loading,
});

const _submit = async (formInstance: FormInstance | undefined) => {
  if (!formInstance) {
    return;
  }

  const isValid = await formInstance.validate();

  if (isValid) {
    try {
      state.isLoading = true;

      await $client.eventTicket.add.mutate({
        name: form.name,
        description: form.description,
        price: Number(form.price),
        quota: Number(form.quota),
        eventId: Number(route.params.id),
      });

      ElNotification({
        title: "Sukses",
        message: "Berhasil menambahkan tiket",
        type: "success",
      });

      emit("added");
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

watch(
  () => state.isLoading,
  (val) => {
    emit("update:loading", val);
  }
);

defineExpose({
  submit: () => {
    _submit(formRef.value);
  },
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
