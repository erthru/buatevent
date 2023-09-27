<template>
  <ElForm
    v-loading="state.isLoading"
    ref="formRef"
    :model="form"
    label-position="top"
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
    <ElButton type="primary" @click="submit(formRef)">Simpan</ElButton>
  </ElForm>
</template>

<script lang="ts" setup>
import { FormInstance, ElNotification } from "element-plus";

const formRef = ref<FormInstance>();
const { $client } = useNuxtApp();
const { user, fetchUser } = useUser();

type Form = {
  name: string;
};

const state = reactive({
  isLoading: false,
});

const form = reactive<Form>({
  name: user.value?.organizer?.name!!,
});

const submit = async (formInstance: FormInstance | undefined) => {
  if (!formInstance) {
    return;
  }

  const isValid = await formInstance.validate();

  if (isValid) {
    try {
      state.isLoading = true;

      await $client.user.updateOrganizer.mutate({
        name: form.name,
      });

      await fetchUser();

      ElNotification({
        title: "Sukses",
        message: "Berhasil memperbarui profil",
        type: "success",
      });

      navigateTo("/dashboard");
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
</script>
