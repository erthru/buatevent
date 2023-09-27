<template>
  <p>index</p>
  <NuxtLink to="/login">
    <ElButton>Login</ElButton>
  </NuxtLink>
</template>

<script setup lang="ts">
const { public: prc } = useRuntimeConfig();

useHead({
  title: `${prc.appTitle} | ${prc.appTagline}`,
});
</script>
