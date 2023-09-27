<template>
  <ElForm
    v-loading="state.isLoading"
    ref="formRef"
    :model="form"
    label-position="top"
  >
    <ElFormItem
      label="Password"
      prop="password"
      :rules="{
        required: true,
        trigger: 'blur',
      }"
    >
      <ElInput
        v-model="form.password"
        type="password"
        placeholder="Masukkan password"
      />
    </ElFormItem>
    <ElFormItem
      label="Konfirmasi Password"
      prop="passwordConfirmation"
      :rules="{
        required: true,
        trigger: 'blur',
      }"
    >
      <ElInput
        v-model="form.passwordConfirmation"
        type="password"
        placeholder="Masukkan konfirmasi password"
      />
    </ElFormItem>
    <ElButton type="primary" @click="submit(formRef)">Simpan</ElButton>
  </ElForm>
</template>

<script lang="ts" setup>
import { FormInstance, ElNotification } from "element-plus";

const formRef = ref<FormInstance>();
const { $client } = useNuxtApp();

type Form = {
  password: string;
  passwordConfirmation: string;
};

const state = reactive({
  isLoading: false,
});

const form = reactive<Form>({
  password: "",
  passwordConfirmation: "",
});

const submit = async (formInstance: FormInstance | undefined) => {
  if (!formInstance) {
    return;
  }

  const isValid = await formInstance.validate();

  if (isValid) {
    try {
      if (form.password !== form.passwordConfirmation) {
        throw new Error("Password tidak sama");
      }

      state.isLoading = true;

      await $client.user.updatePassword.mutate({
        password: form.password,
      });

      ElNotification({
        title: "Sukses",
        message: "Berhasil mengganti password",
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
