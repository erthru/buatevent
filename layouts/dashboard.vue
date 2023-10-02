<template>
  <div style="width: 100%; display: flex; min-height: 100vh; height: 100%">
    <SidebarDashboard />
    <main style="width: 100%; display: flex">
      <div
        class="wrapper"
        style="width: 100%; max-width: 1200px; margin: 0 auto"
      >
        <NavbarDashboard />
        <div>
          <slot />
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
main .wrapper {
  padding: 0 16px 16px 16px;
}

@media (min-width: 768px) {
  main .wrapper {
    padding: 0 24px 24px 24px;
  }
}
</style>
