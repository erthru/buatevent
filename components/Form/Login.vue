<template>
  <ElForm
    v-loading="state.isLoading"
    ref="formRef"
    :model="form"
    label-position="top"
    style="display: flex; flex-direction: column; width: 100%"
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
    <NuxtLink
      to="/forgot-password"
      style="margin: -14px 0 10px auto; font-size: 14px; font-weight: 500"
      >Lupa Password?</NuxtLink
    >
    <ElButton type="primary" @click="submit(formRef)" style="width: max-content"
      >Login</ElButton
    >
  </ElForm>
</template>

<script lang="ts" setup>
import { FormInstance, ElNotification } from "element-plus";

const formRef = ref<FormInstance>();
const { $client } = useNuxtApp();
const { fetchUser } = useUser();

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
