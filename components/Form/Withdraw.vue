<template>
  <ElForm
    v-loading="state.isLoading"
    ref="formRef"
    :model="form"
    label-position="top"
    style="display: flex; flex-direction: column; width: 100%"
  >
    <ElFormItem
      label="Bank"
      prop="bank"
      :rules="{
        required: true,
        trigger: 'blur',
      }"
    >
      <ElSelect
        v-model="form.bank"
        placeholder="Pilih Bank"
        style="width: 100%"
      >
        <ElOption
          v-for="(item, i) in bankOptions"
          :key="`select-category-${i}`"
          :label="item.label"
          :value="item.value"
        />
      </ElSelect>
    </ElFormItem>
    <ElFormItem
      label="Nama Penerima"
      prop="accountHolder"
      :rules="{
        required: true,
        trigger: 'blur',
      }"
    >
      <ElInput
        v-model="form.accountHolder"
        placeholder="Masukkan nama penerima"
      />
    </ElFormItem>
    <ElFormItem
      label="No. Rekening"
      prop="accountNumber"
      :rules="{
        required: true,
        trigger: 'blur',
      }"
    >
      <ElInput
        v-model="form.accountNumber"
        placeholder="Masukkan No. rekening"
      />
    </ElFormItem>
    <ElFormItem
      label="Jumlah"
      prop="amount"
      :rules="{
        required: true,
        trigger: 'blur',
        validator: checkAmount,
      }"
    >
      <ElInput
        v-model="form.amount"
        type="number"
        placeholder="Masukkan Jumlah"
      />
      <p style="font-size: 12px; margin-bottom: -10px; margin-top: -4px">
        Saldo: Rp {{ props.balance.toLocaleString() }}
      </p>
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
        placeholder="Masukkan Password"
      />
    </ElFormItem>
    <ElAlert type="warning" effect="dark" :closable="false">
      Anda akan dikenakan biaya transfer sebesar Rp 6,500
    </ElAlert>
  </ElForm>
</template>

<script lang="ts" setup>
import { FormInstance, ElNotification } from "element-plus";

const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
  },

  balance: {
    type: Number,
    default: false,
  },
});

const formRef = ref<FormInstance>();
const { $client } = useNuxtApp();
const emit = defineEmits(["update:loading", "withdrew"]);
const { fetchUser } = useUser();

type Form = {
  bank: string;
  accountHolder: string;
  accountNumber: string;
  password: string;
  amount: string;
};

const form = reactive<Form>({
  bank: "",
  accountHolder: "",
  accountNumber: "",
  password: "",
  amount: "",
});

const state = reactive({
  isLoading: props.loading,
});

const bankOptions = [
  {
    value: "ID_BCA",
    label: "Bank Central Asia",
  },
  {
    value: "ID_BNI",
    label: "Bank Negara Indonesia",
  },
  {
    value: "ID_MANDIRI",
    label: "Mandiri",
  },
  {
    value: "ID_BRI",
    label: "Bank Rakyat Indonesia",
  },
];

const checkAmount = (rule: any, value: any, callback: any) => {
  if (!value) {
    return callback(new Error("amount is required"));
  }

  if (Number(value) < 10000) {
    return callback(new Error("amount must be greater or equal than 10000"));
  }

  if (Number(value) > props.balance - 6500) {
    return callback(new Error(`balance is not sufficient`));
  }

  return callback();
};

const _submit = async (formInstance: FormInstance | undefined) => {
  if (!formInstance) {
    return;
  }

  const isValid = await formInstance.validate();

  if (isValid) {
    try {
      state.isLoading = true;

      await $client.organizer.withdraw.mutate({
        bank: form.bank,
        accountHolder: form.accountHolder,
        accountNumber: form.accountNumber,
        amount: Number(form.amount),
        password: form.password,
      });

      await fetchUser();

      ElNotification({
        title: "Sukses",
        message: "Proses penarikan saldo sedang diproses",
        type: "success",
      });

      emit("withdrew");
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
