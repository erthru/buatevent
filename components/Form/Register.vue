<template>
  <ElForm
    v-loading="state.isLoading"
    ref="formRef"
    :model="form"
    label-position="top"
  >
    <ElFormItem
      label="Email"
      prop="email"
      :rules="{
        required: true,
        trigger: 'blur',
      }"
    >
      <ElInput v-model="form.email" type="email" placeholder="Masukkan email" />
    </ElFormItem>
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
    <ElButton type="primary" @click="submit(formRef)">Daftar</ElButton>
  </ElForm>
</template>

<script lang="ts" setup>
import { FormInstance, ElNotification } from "element-plus";

const formRef = ref<FormInstance>();
const { $client } = useNuxtApp();

type Form = {
  email: string;
  password: string;
};

const state = reactive({
  isLoading: false,
});

const form = reactive<Form>({
  email: "",
  password: "",
});

const submit = async (formInstance: FormInstance | undefined) => {
  if (!formInstance) {
    return;
  }

  const isValid = await formInstance.validate();

  if (isValid) {
    try {
      state.isLoading = true;

      await $client.user.login.mutate({
        email: form.email,
        password: form.password,
      });

      location.href = "/dashboard";
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
