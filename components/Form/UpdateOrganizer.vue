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
      label="Username"
      prop="username"
      :rules="{
        required: true,
        trigger: 'blur',
      }"
    >
      <ElInput v-model="form.username" placeholder="Masukkan username" disabled>
        <template #append> <span>.buatevent.com</span> </template>
      </ElInput>
    </ElFormItem>
    <p style="font-size: 12px; margin: -10px 0 16px 0">
      Event yang dibuat nanti dapat diakses pada:
      <span style="font-weight: 600"
        >{{ form.username }}.buatevent.com/contoh-event</span
      >
    </p>
    <ElFormItem
      label="Email"
      prop="email"
      :rules="{
        required: true,
        trigger: 'blur',
      }"
    >
      <ElInput
        v-model="form.email"
        type="email"
        placeholder="Masukkan Eamil"
        disabled
      />
    </ElFormItem>
    <ElFormItem
      label="No. HP"
      prop="phone"
      :rules="{
        required: true,
        trigger: 'blur',
      }"
    >
      <ElInput v-model="form.phone" type="number" placeholder="Masukkan No. HP">
        <template #prepend> <span>+62</span> </template></ElInput
      >
    </ElFormItem>
    <ElFormItem label="Avatar" prop="avatar">
      <ElUpload
        :key="state.uploadAvatarKey"
        :auto-upload="false"
        :limit="1"
        accept=".jpg, .png, .webp, .gif, .jpeg"
        :on-change="onSelectAvatar"
      >
        <img
          v-if="form.avatar || state.selectedAvatar"
          :src="
            state.selectedAvatar
              ? getPreviewSelectedAvatar(state.selectedAvatar)
              : `/uploads/${form.avatar}`
          "
          style="width: 175px; height: 175px; object-fit: cover"
        />
        <div
          v-else
          style="
            width: 175px;
            height: 175px;
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
    <ElButton type="primary" style="margin-top: -16px" @click="submit(formRef)"
      >Simpan</ElButton
    >
  </ElForm>
</template>

<script lang="ts" setup>
import { Plus } from "@element-plus/icons-vue";
import { FormInstance, ElNotification } from "element-plus";

const formRef = ref<FormInstance>();
const { $client } = useNuxtApp();
const { user, fetchUser } = useUser();

type Form = {
  name: string;
  username: string;
  email: string;
  avatar: string;
  phone: string;
};

const state = reactive({
  isLoading: false,
  selectedAvatar: null as File | null,
  uploadAvatarKey: `${new Date().getTime()}-uak`,
});

const form = reactive<Form>({
  name: user.value?.organizer?.name!!,
  username: user.value?.organizer?.username!!,
  email: user.value?.email!!,
  avatar: user.value?.organizer?.avatar!!,
  phone: user.value?.organizer?.phone!!,
});

const onSelectAvatar = async (selectedFile: any) => {
  state.selectedAvatar = selectedFile.raw;
  await nextTick();
  state.uploadAvatarKey = `${new Date().getTime()}-uak`;
};

const getPreviewSelectedAvatar = (selectedAvatar: File) => {
  return URL.createObjectURL(selectedAvatar);
};

const submit = async (formInstance: FormInstance | undefined) => {
  if (!formInstance) {
    return;
  }

  const isValid = await formInstance.validate();

  if (isValid) {
    try {
      state.isLoading = true;

      let avatarBase64 = "";

      if (state.selectedAvatar) {
        avatarBase64 = await convertFileToBase64(state.selectedAvatar);
      }

      await $client.user.updateOrganizer.mutate({
        name: form.name,
        phone: form.phone,
        avatar: avatarBase64,
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
