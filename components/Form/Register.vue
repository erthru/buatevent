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
    <ElFormItem
      label="No. HP"
      prop="phone"
      :rules="{
        required: true,
        trigger: 'blur',
      }"
    >
      <ElInput v-model="form.phone" type="number" placeholder="8123456xxx">
        <template #prepend> <span>+62</span> </template>
      </ElInput>
    </ElFormItem>
    <ElFormItem
      label="Username"
      prop="username"
      :rules="{
        required: true,
        trigger: 'blur',
      }"
    >
      <ElInput v-model="form.username" placeholder="Masukkan username">
        <template #append
          ><span>.{{ host }}</span></template
        >
      </ElInput>
    </ElFormItem>
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
    <ElButton type="primary" @click="submit(formRef)">Daftar</ElButton>
  </ElForm>
</template>

<script lang="ts" setup>
import { FormInstance, ElNotification } from "element-plus";

const formRef = ref<FormInstance>();
const { $client } = useNuxtApp();
const router = useRouter();

type Form = {
  name: string;
  phone: string;
  username: string;
  email: string;
  password: string;
  passwordConfirmation: string;
};

const state = reactive({
  isLoading: false,
});

const form = reactive<Form>({
  name: "",
  phone: "",
  username: "",
  email: "",
  password: "",
  passwordConfirmation: "",
});

const host = computed(() => {
  return typeof window !== "undefined" ? location.host : "";
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

      await $client.user.register.mutate({
        name: form.name,
        phone: form.phone,
        username: form.username,
        email: form.email,
        password: form.password,
      });

      ElNotification({
        title: "Sukses",
        message: "Berhasil mendaftar, silahkan login",
        type: "success",
      });

      router.push("/login");
    } catch (err: any) {
      ElNotification({
        title: "Error",
        message: err.message.includes("email")
          ? "Email telah digunakan"
          : err.message.includes("username")
          ? "Username telah digunakan"
          : err.message,
        type: "error",
      });
    } finally {
      state.isLoading = false;
    }
  }
};
</script>
