<template>
  <div
    style="
      display: flex;
      flex-direction: column;
      width: 100%;
      min-height: 100vh;
    "
  >
    <div style="flex: 1 1 0%">
      <slot />
    </div>
    <FooterIndependent />
  </div>
</template>
