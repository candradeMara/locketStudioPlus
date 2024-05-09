import { defineStore } from "pinia";

export const useAppStore = defineStore("app", {
  persist: {
    enabled: true,
  },
  state: () => ({
    appDocListenerUnsubscribe: null,
    appData: null,
    breadcrumbs: [],
    pageTitle: "",
  }),

  getters: {
    getMenu: (state) => state.appData?.menu || [],
    getFilters: (state) => state.appData?.filters,
    getFilter: (state) => {
      return (filterKey) => {
        return state.appData?.filters[filterKey];
      };
    },
    getCollections: (state) => {
      return state.appData?.collections;
    },

    getCollectionsArray: (state) => {
      const collections = state.appData?.collections || {};
      const sorted = Object.values(collections).map(item => {
        const { children, ...rest } = item;
        const sortedChildren = children
          ? Object.values(children).sort((a, b) => a.label.localeCompare(b.label))
          : [];
        return { ...rest, children: sortedChildren };
      });
      sorted.sort((a, b) => a.menu_order - b.menu_order);
      return sorted;
    },

    getCollection: (state) => {
      return (collectionSlug) => {
        return state.appData?.collections[collectionSlug];
      };
    },

    getCollectionLabel: (state) => {
      return (collectionSlug) => {
        const collectionData = state.appData?.collections[collectionSlug];
        return collectionData?.label;
      };
    },

    getCategories: (state) => {
      return (collectionSlug) => {
        const children = state.appData?.collections?.[collectionSlug]?.children;
        if (children) {
          return children;
        } else {
          return {};
        }
      };
    },

    getCategory: (state) => {
      return (collectionSlug, categorySlug) => {
        const collectionData = state.appData.collections?.[collectionSlug];
        if (!collectionData) {
          return null; // or some default value if appropriate
        }

        const categoryData = collectionData.children?.[categorySlug];
        if (!categoryData) {
          return null; // or some default value if appropriate
        }

        return categoryData;
      };
    },

    getCategoryLabel: (state) => {
      return (collectionSlug, categorySlug) => {
        const category = state.getCategory(collectionSlug, categorySlug);
        if (!category) {
          return null;
        }
        return category.label || "";
      };
    },
  },

  actions: {},
});
