<template>
  <p>kategori</p>
</template>

<script lang="ts" setup>
const { public: prc } = useRuntimeConfig();

useHead({
  title: `.... | ${prc.appTitle}`,
});
</script>
