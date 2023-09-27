<template>
  <div style="width: 100%; display: flex; height: 100vh">
    <SidebarDashboard />
    <main style="width: 100%">
      <NavbarDashboard />
      <div>
        <slot />
      </div>
    </main>
  </div>
</template>

<script lang="ts" setup>
const { user, fetchUser } = useUser();

onMounted(() => {
  if (!user.value) {
    fetchUser();
  }
});
</script>

<style scoped>
main div {
  padding: 0 16px;
}

@media (min-width: 768px) {
  main div {
    padding: 0 24px;
  }
}
</style>
