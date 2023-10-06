<template>
  <CKEditor.component
    v-model="state.body"
    :editor="ClassicEditor"
    :config="config"
  />
</template>

<script lang="ts" setup>
import CKEditor from "@ckeditor/ckeditor5-vue";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
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
