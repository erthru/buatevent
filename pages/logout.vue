<template>
  <p>Redirecting...</p>
</template>

<script lang="ts" setup>
useAsyncData("logout", async () => {
  const tokenToken = useCookie("token");
  tokenToken.value = "";
});

onMounted(() => {
  location.href = "/";
});
</script>
