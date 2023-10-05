<template>
  <div
    style="
      display: flex;
      flex-direction: column;
      width: 100%;
      min-height: 100vh;
    "
  >
    <NavbarDefault />
    <main style="width: 100%; display: flex; height: 100%; flex: 1 1 0%">
      <div style="margin: 0 auto; width: 100%; max-width: 1200px">
        <slot />
      </div>
    </main>
    <FooterDefault />
  </div>
</template>

<style scoped>
main div {
  padding: 16px;
}

@media (min-width: 768px) {
  main div {
    padding: 24px;
  }
}
</style>
