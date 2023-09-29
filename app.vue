<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script lang="ts" setup>
const { isError, errorCode, errorMessage } = useCustomError();

watch(
  () => isError.value,
  (val) => {
    if (val) {
      showError({
        statusCode: errorCode.value,
        statusMessage: errorMessage.value,
      });
    }
  },
  { immediate: true }
);
</script>
