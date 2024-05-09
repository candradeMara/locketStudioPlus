<template>
  <q-page-container class="bg-white">
    <LayoutHeader :show-logo="true" />
    <suspense v-if="!isMobile">
      <LayoutMenu />
    </suspense>
    <q-page padding>
      <q-breadcrumbs v-if="breadcrumbs !== []" align="center" class="q-my-md text-primary" active-color="dark">
        <q-breadcrumbs-el v-for="(breadcrumb, index) in breadcrumbs" :key="breadcrumb.path"
          :to="index + 1 < breadcrumbs.length ? breadcrumb.path : ''" :label="breadcrumb.label" />
      </q-breadcrumbs>
      <router-view :key="$route.fullPath" />
    </q-page>
  </q-page-container>
</template>

<script>
import { defineComponent, defineAsyncComponent, computed, watch } from "vue";
import { useQuasar, useMeta } from "quasar";
import { useRoute } from "vue-router";
import { useAppStore } from "stores/app";
import { storeToRefs } from "pinia";
import LayoutHeader from "src/components/layout/LayoutHeader.vue";
const LayoutMenu = defineAsyncComponent(() =>
  import("components/layout/LayoutMenu.vue")
);

export default defineComponent({
  name: "MainLayout",
  components: {
    LayoutHeader,
    LayoutMenu,
  },
  setup() {
    const $q = useQuasar();
    const route = useRoute();
    const appStore = useAppStore();
    const { breadcrumbs, pageTitle } = storeToRefs(appStore);
    useMeta(() => {
      return {
        title: pageTitle.value || "Marathon Company",
        titleTemplate: (title) => {
          return title !== "Marathon Company"
            ? `${title} - Marathon Company`
            : "Marathon Company";
        },
      };
    });

    const isMobile = computed(() => {
      return !$q.screen.gt.sm;
    });
    watch(
      () => route,
      (to, from) => {
        pageTitle.value = to?.meta?.pageTitle || pageTitle.value;
        breadcrumbs.value = [
          { label: "Home", path: "/" },
          { label: "Admin Dashboard", path: "/admin/" },
        ];
        if (to.path !== "/admin/") {
          breadcrumbs.value.push({ label: pageTitle.value, path: to.path });
        }
      },
      {
        immediate: true,
        flush: "post",
        deep: true,
      }
    );

    return { isMobile, breadcrumbs, pageTitle };
  },
});
</script>
