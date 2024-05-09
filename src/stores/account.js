import { defineStore } from "pinia";

export const useAccountStore = defineStore("account", {
  persist: {
    enabled: true,
  },
  state: () => ({
    accountData: null,
    accountDocListenerUnsubscribe: null,
  }),

  getters: {
    getAddresses: (state) => {
      return state.accountData?.addresses || [];
    },
    isShipped: (state) => {
      return (sku) => {
        if (state.accountData?.shipped_items?.length > 0) {
          return state.accountData.shipped_items.some(
            (item) => item.sku === sku
          );
        } else {
          return false;
        }
      };
    },
  },

  actions: {},
});
