<template>
  <q-layout view="lhr lpr lfr">
    <router-view :key="$route.fullPath" />
  </q-layout>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "MainLayout",
  setup() {
    return {};
  },
});
</script>
