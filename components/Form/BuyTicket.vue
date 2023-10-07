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
      label="Email"
      prop="email"
      :rules="{
        required: true,
        trigger: 'blur',
      }"
    >
      <ElInput v-model="form.email" placeholder="Masukkan email" />
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

  price: {
    type: Number,
    default: false,
  },
});

const formRef = ref<FormInstance>();
const { $client } = useNuxtApp();
const emit = defineEmits(["update:loading", "bought"]);
const route = useRoute();

type Form = {
  name: string;
  phone: string;
  email: string;
};

const form = reactive<Form>({
  name: "",
  phone: "",
  email: "",
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

      // do something...

      if (props.price) {
        ElNotification({
          title: "Sukses",
          message:
            "Berhasil membeli tiket, detail tiket akan dikirimkan ke email anda",
          type: "success",
        });
      } else {
        ElNotification({
          title: "Sukses",
          message: "Silahkan cek email untuk melanjutkan pembayaran anda",
          type: "success",
        });
      }

      emit("bought");
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
