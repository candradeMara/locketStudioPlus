<template>
  <q-layout view="hhh lpr fff" class="q-pb-md">
    <BaseHeader />

    <q-page-container>
      <q-breadcrumbs align="center" class="q-mt-md">
        <q-breadcrumbs-el v-for="breadcrumb in breadcrumbs" :key="breadcrumb.label" :to="breadcrumb.to"
          :label="breadcrumb.label" />
      </q-breadcrumbs>
      <router-view :key="$route.fullPath" />
    </q-page-container>

    <BaseFooter />
  </q-layout>
</template>

<script>
import { computed } from "vue";
import { useStore } from "vuex";
import BaseHeader from "components/base/BaseHeader";
import BaseFooter from "components/base/BaseFooter";

export default {
  name: "AccountLayout",

  components: { BaseHeader, BaseFooter },

  setup() {
    const store = useStore();
    const breadcrumbs = computed(() => {
      return store.getters["breadcrumbs/get_breadcrumbs"];
    });
    return { breadcrumbs };
  },
};
</script>
