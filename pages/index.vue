<template>
  <PageIndexDefault v-if="data?.component === 'PageIndexDefault'" />
  <PageIndexUsername v-if="data?.component === 'PageIndexUsername'" />
</template>

<script setup lang="ts">
const { public: prc } = useRuntimeConfig();

useHead({
  title: `${prc.appTitle} | ${prc.appTagline}`,
});

const { data } = useLazyAsyncData("index", async () => {
  const { ssrContext } = useNuxtApp();
  const { public: prc } = useRuntimeConfig();
  const host = prc.baseUrl.replaceAll("http://", "").replaceAll("https://", "");
  const currentHost = ssrContext?.event.node.req.headers.host;
  let component = "PageIndexDefault";

  if (host !== currentHost) {
    setPageLayout("independent");
    component = "PageIndexUsername";
  }

  return {
    component,
  };
});
</script>
