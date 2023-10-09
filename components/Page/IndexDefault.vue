<template>
  <div>
    <img
      src="/uploads/default.png"
      alt="banner"
      class="banner"
      style="width: 100%; object-fit: cover; border-radius: 4px"
    />
    <div
      class="categories"
      style="
        width: 100%;
        display: flex;
        overflow-x: auto;
        margin-top: 21px;
        height: 160px;
      "
      v-loading="state.isCategoriesLoading"
    >
      <div
        v-for="(category, i) in state.categories"
        class="category"
        :key="`category-${i}`"
      >
        <img
          :src="`/uploads/${category.thumbnail}`"
          alt="category"
          style="
            border-radius: 100%;
            width: 100%;
            height: 100%;
            object-fit: cover;
          "
        />
        <p
          style="
            width: 100%;
            text-align: center;
            font-size: 14px;
            font-weight: 600;
            margin-top: 8px;
          "
        >
          {{ category.name }}
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Prisma } from "@prisma/client";

const { $client } = useNuxtApp();

const state = reactive({
  isCategoriesLoading: false,
  categories: [] as Prisma.CategoryGetPayload<{}>[],
});

const fetchCategories = async () => {
  try {
    state.isCategoriesLoading = true;
    const categories = await $client.category.getAll.query();
    state.categories = categories as any;
  } catch (err: any) {
    ElNotification({
      title: "Error",
      message: err.message,
      type: "error",
    });
  } finally {
    state.isCategoriesLoading = false;
  }
};

onMounted(() => {
  fetchCategories();
});
</script>

<style scoped>
.banner {
  height: 240px;
}

.categories {
  column-gap: 21px;
}

.categories .category {
  min-width: 95px;
  max-width: 95px;
  min-height: 95px;
  max-height: 95px;
}

@media (min-width: 768px) {
  .banner {
    height: 300px;
  }

  .categories {
    column-gap: 32px;
  }

  .categories .category {
    min-width: 115px;
    max-width: 115px;
    min-height: 115px;
    max-height: 115px;
  }
}
</style>
