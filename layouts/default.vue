<template>
  <NavbarDefault />
  <main style="width: 100%; display: flex">
    <div class="wrapper" style="margin: 0 auto; width: 100%; max-width: 1200px">
      <slot />
    </div>
  </main>
</template>

<style scoped>
.wrapper {
  padding: 0 16px 16px 16px;
}

@media (min-width: 768px) {
  .wrapper {
    padding: 0 24px 24px 24px;
  }
}
</style>
