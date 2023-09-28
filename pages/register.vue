<template>
  <div
    style="
      display: flex;
      flex-direction: column;
      width: 100%;
      padding-top: 52px;
      padding-bottom: 34px;
    "
  >
    <p style="margin: 0 auto; font-size: 28px; font-weight: 600">LOGO HERE</p>
    <ElCard class="card">
      <p style="font-size: 28px; font-weight: 600">Daftar</p>
      <FormRegister style="margin-top: 16px" />
    </ElCard>
    <p style="margin: 8px auto; font-size: 14px">
      Sudah punya akun?
      <NuxtLink to="/login" style="font-weight: 500">Login</NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
const { public: prc } = useRuntimeConfig();

useHead({
  title: `Daftar | ${prc.appTitle}`,
});

definePageMeta({
  middleware: "guest-middleware",
});
</script>

<style scoped>
.card {
  width: 100%;
  margin: 38px auto 0px;
}

@media (min-width: 768px) {
  .card {
    width: 50%;
    max-width: 450px;
  }
}
</style>
