<template>
  <component
    v-if="state.Editor"
    v-model="state.body"
    :is="state.Editor"
    :editor="state.ClassicEditor"
    :config="config"
  />
</template>

<script lang="ts" setup>
import { EditorConfig } from "@ckeditor/ckeditor5-core/src/editor/editorconfig";

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["update:modelValue"]);

const state = reactive({
  body: props.modelValue,
  Editor: null as any,
  ClassicEditor: null as any,
});

const config: EditorConfig = {
  toolbar: {
    items: [
      "undo",
      "redo",
      "|",
      "heading",
      "|",
      "bold",
      "italic",
      "|",
      "link",
      "insertTable",
      "blockQuote",
      "mediaEmbed",
      "|",
      "bulletedList",
      "numberedList",
      "outdent",
      "indent",
    ],
  },
};

onMounted(async () => {
  const Editor = await import("@ckeditor/ckeditor5-vue");
  const ClassicEditor = await import("@ckeditor/ckeditor5-build-classic");
  state.Editor = markRaw(Editor.default.component);
  state.ClassicEditor = markRaw(ClassicEditor.default);
});

watch(
  () => state.body,
  (val) => {
    emit("update:modelValue", val);
  }
);
</script>

<style>
.ck-editor {
  width: 100% !important;
}

.ck-toolbar {
  border-color: var(--el-border-color) !important;
}

.ck-rounded-corners {
  border-color: var(--el-border-color) !important;
}

.ck-content {
  line-height: 160%;
}
</style>
