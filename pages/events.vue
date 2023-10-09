<template>
  <p>kubun</p>
</template>

<script lang="ts" setup>
const { public: prc } = useRuntimeConfig();

useHead({
  title: `Event | ${prc.appTitle}`,
});
</script>
