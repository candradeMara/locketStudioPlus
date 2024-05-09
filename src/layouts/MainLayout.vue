<template>
  <q-page-container class="bg-white q-pa-none">
    <LayoutHeader />
    <LayoutBanner v-if="$q.screen.gt.sm" />
    <suspense v-if="!isMobile">
      <LayoutMenu />
    </suspense>
    <q-page padding>
      <q-breadcrumbs v-if="breadcrumbs.length" align="center" class="q-my-md text-primary" active-color="dark">
        <q-breadcrumbs-el v-for="breadcrumb in breadcrumbs" :key="breadcrumb.path" :to="breadcrumb.path"
          :label="breadcrumb.label" />
      </q-breadcrumbs>
      <router-view :key="$route.fullPath" />
    </q-page>
    <suspense v-if="!isMobile">
      <LayoutFooter />
    </suspense>
    <suspense v-if="isMobile">
      <LayoutFooterMobile />
    </suspense>
  </q-page-container>
</template>

<script>
import { defineComponent, defineAsyncComponent, computed, watch } from "vue";
import { useQuasar, useMeta } from "quasar";
import { useRoute } from "vue-router";
import { useAppStore } from "stores/app";
import { storeToRefs } from "pinia";
import LayoutHeader from "src/components/layout/LayoutHeader.vue";
import LayoutBanner from "components/layout/LayoutBanner.vue";
const LayoutMenu = defineAsyncComponent(() =>
  import("components/layout/LayoutMenu.vue")
);
const LayoutFooter = defineAsyncComponent(() =>
  import("components/layout/LayoutFooter.vue")
);
const LayoutFooterMobile = defineAsyncComponent(() =>
  import("components/layout/LayoutFooterMobile.vue")
);

export default defineComponent({
  name: "MainLayout",
  components: {
    LayoutHeader,
    LayoutBanner,
    LayoutMenu,
    LayoutFooter,
    LayoutFooterMobile,
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
        // see if this is an account or shop page... (and need breadcrumbs)
        const routeOptions = [
          "/account",
          "/products",
          "/product",
          "/cart",
          "/checkout",
        ];

        if (!to.matched.some((match) => routeOptions.includes(match.path))) {
          // reset the breadcrumbs if not an account or products page...
          breadcrumbs.value = [];
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
