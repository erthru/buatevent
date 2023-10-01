<template>
  <p>bantuan</p>
</template>

<script setup lang="ts">
const { public: prc } = useRuntimeConfig();

useHead({
  title: `Bantuan | ${prc.appTitle}`,
});
</script>
