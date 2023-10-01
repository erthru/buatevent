<template>
  <div
    style="
      display: flex;
      flex-direction: column;
      width: 100%;
      padding-top: 40px;
    "
  >
    <ElCard class="card">
      <p style="font-size: 28px; font-weight: 600; color: #303133">Login</p>
      <FormLogin style="margin-top: 16px" />
    </ElCard>
    <p style="margin: 8px auto; font-size: 14px">
      Belum punya akun?
      <NuxtLink to="/register" style="font-weight: 500">Daftar</NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
const { public: prc } = useRuntimeConfig();

useHead({
  title: `Login | ${prc.appTitle}`,
});

definePageMeta({
  middleware: "guest-middleware",
});
</script>

<style scoped>
.card {
  width: 100%;
  margin: 0 auto;
}

@media (min-width: 768px) {
  .card {
    width: 50%;
    max-width: 450px;
  }
}
</style>
