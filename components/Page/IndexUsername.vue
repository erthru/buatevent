<template>
  <pre>{{ props.events }}</pre>
</template>

<script lang="ts" setup>
import { Prisma } from "@prisma/client";
import { PropType } from "nuxt/dist/app/compat/capi";

const props = defineProps({
  events: Array as PropType<
    Prisma.EventGetPayload<{
      include: {
        organizer: true;
      };
    }>[]
  >,
  default: () => {
    return [];
  },
});
</script>
