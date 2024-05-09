import { defineStore } from "pinia";
import { db } from "boot/firebase";
import { doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";

export const useUserStore = defineStore("user", {
  persist: {
    enabled: true,
  },
  state: () => ({
    authUser: null,
    userData: null,
    authListenerUnsubscribe: null,
    userDocListenerUnsubscribe: null,
  }),

  getters: {
    isLoggedIn: (state) => {
      return state.userData ? true : false;
    },
    isBuyer: (state) => {
      return (
        state.userData?.role === "buyer" ||
        state.userData?.role === "account_admin" ||
        state.userData?.role === "marathon_admin"
      );
    },
	isGuest: (state) => {
      return (
        state.userData?.role === "guest"
      );
    },
    isAccountAdmin: (state) => {
      return (state.userData?.role === "account_admin"|| state.userData?.role === "marathon_admin") ;
    },
    isAdmin: (state) => {
      return state.userData?.role === "marathon_admin";
    },
    getCart: (state) => {
      return state.userData?.cart || [];
    },
    isInCart: (state) => {
      return (sku) => {
        if (state.userData?.cart?.items?.length > 0) {
          return state.userData?.cart?.items.some((item) => item.sku === sku);
        } else {
          return false;
        }
      };
    },
    getPreferredAddress: (state) => {
      return state.userData?.address_preferred;
    },
    getFavorites: (state) => {
      return state.userData?.favorites;
    },
    isFavorite: (state) => {
      return (sku) => {
        return state.userData?.favorites?.includes(sku);
      };
    },
  },

  actions: {
    /**
     * // trusting user data since this is not B2C...
     * // if B2C this should be moved to cloud function
     * @param {Array} items - array of objects that includes sku, quantity, and sometimes engraveData.
     * @param {Boolean} additive - if true, the quantity will be adjusted by the amount, if false it will be set to that amount.
     * @returns Promise
     */
    async addToCart(items, additive = true) {
      return new Promise(async (resolve, reject) => {
        let cartItems = this.userData?.cart?.items || [];
        await Promise.all(
          // use .map to process all docs at once
          items.map(async (item) => {
            let existingProduct = false;
            if (!item.engraveData) {
              existingProduct = cartItems.some((cartItem, index) => {
                // look for the item already in cart. Excluding engraved items
                if (cartItem.sku === item.sku && !cartItem.engraveData) {
                  existingProduct = true;
                  cartItem.total = item.quantity * item.price;
                  if (additive) {
                    cartItem.quantity += item.quantity;
                  } else {
                    cartItem.quantity = item.quantity;
                    if (item.quantity <= 0) {
                      cartItems.splice(index, 1);
                    }
                  }
                  return true;
                }
                return false;
              });
            }
            if (!existingProduct) {
              // fetch doc from firestore
              const docSnap = await getDoc(doc(db, "products", item.sku));
              if (docSnap.exists()) {
                const itemData = docSnap.data();
                // strip out unwanted data
                let orderItemData = Object.entries(itemData).reduce(
                  (acc, [key, value]) => {
                    const keys = [
                      "category",
                      "collection",
                      "materials",
                      "name",
                      "path",
                      "price",
                      "sku",
                    ];
                    if (keys.includes(key)) {
                      acc[key] = value;
                    }
                    return acc;
                  },
                  {}
                );
                orderItemData.quantity = item.quantity;
                orderItemData.total = item.quantity * orderItemData.price;

                if (
                  item.engraveData &&
                  Object.keys(item.engraveData).length > 0
                ) {
                  // add engrave data and overwrite price and name
                  orderItemData = {
                    ...orderItemData,
                    engraveData: item.engraveData,
                    price: itemData.price + itemData.engraving.price,
                    name: `${orderItemData.name} (engraved)`,
                    total:
                      item.quantity * item.price + itemData.engraving.price,
                  };
                }
                cartItems.push(orderItemData);
              }
            }
          })
        );
        const total_price = cartItems.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );

        const total_items = cartItems.reduce(
          (total, item) => total + item.quantity,
          0
        );
        const cart = {
          items: cartItems,
          total_price: total_price,
          total_items: total_items,
        };
        const userDocRef = doc(
          db,
          `accounts/${this.userData.account}/users/${this.userData.uid}`
        );
        await setDoc(userDocRef, { cart: cart }, { merge: true });
        resolve(cart);
      });
    },

    async toggleFavorite(sku) {
      let favorites = this.userData?.favorites
        ? [...this.userData?.favorites]
        : [];
      const index = favorites.indexOf(sku);
      if (index !== -1) {
        favorites.splice(index, 1);
      } else {
        favorites.push(sku);
      }
      const userDocRef = doc(
        db,
        `accounts/${this.userData.account}/users/${this.userData.uid}`
      );
      await setDoc(userDocRef, { favorites: favorites }, { merge: true });
      return favorites;
    },
  },
});
