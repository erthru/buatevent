<template>
  <ElForm
    v-loading="state.isLoading"
    ref="formRef"
    :model="form"
    label-position="top"
    style="display: flex; flex-direction: column; width: 100%"
  >
    <ElFormItem
      label="Status"
      prop="status"
      :rules="{
        required: true,
        trigger: 'blur',
      }"
    >
      <ElSelect
        v-model="form.status"
        placeholder="Pilih Status"
        style="width: 100%"
      >
        <ElOption
          v-for="(item, i) in statusOptions"
          :key="`select-category-${i}`"
          :label="item.label"
          :value="item.value"
        />
      </ElSelect>
    </ElFormItem>
  </ElForm>
</template>

<script lang="ts" setup>
import { Prisma } from "@prisma/client";
import { FormInstance, ElNotification } from "element-plus";
import { PropType } from "nuxt/dist/app/compat/capi";

const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  eventMember: {
    type: Object as PropType<Prisma.EventMemberGetPayload<{}> | null>,
    default: () => {
      return null;
    },
  },
});

const formRef = ref<FormInstance>();
const { $client } = useNuxtApp();
const emit = defineEmits(["update:loading", "updated"]);

type Form = {
  status: string;
};

const form = reactive<Form>({
  status: props.eventMember?.status || "",
});

const state = reactive({
  isLoading: props.loading,
});

const statusOptions = [
  {
    label: "Menunggu Pembayaran",
    value: "UNPAID",
  },
  {
    label: "Telah Dibayar",
    value: "PAID",
  },
  {
    label: "Expired",
    value: "EXPIRED",
  },
];

const _submit = async (formInstance: FormInstance | undefined) => {
  if (!formInstance) {
    return;
  }

  const isValid = await formInstance.validate();

  if (isValid) {
    try {
      state.isLoading = true;

      await $client.eventMember.updateStatus.mutate({
        id: props.eventMember?.id!!,
        status: form.status as any,
      });

      ElNotification({
        title: "Sukses",
        message: "Berhasil memperbarui status",
        type: "success",
      });

      emit("updated");
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
