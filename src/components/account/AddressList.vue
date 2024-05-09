<template>
  <q-dialog
    :model-value="isOpen"
    @update:model-value="(value) => $emit('update:isOpen', value)"
  >
    <q-card style="min-width: 350px">
      <q-btn
        v-close-popup
        dense
        flat
        icon="close"
        class="button-close float-right"
      >
        <q-tooltip class="bg-white text-primary"> Close </q-tooltip>
      </q-btn>
      <q-list>
        <template v-for="address in addresses" :key="address.name">
          <q-item
            :v-ripple="selected && addresses.length > 1"
            tag="label"
            @click="$emit('update:selected', address)"
          >
            <q-item-section v-if="addresses.length > 1" avatar>
              <q-radio
                :model-value="selected"
                :val="address"
                @click="$emit('update:selected', address)"
              />
            </q-item-section>
            <q-item-section>
              <div class="text-subtitle">{{ address.name }}</div>
              <div class="text-subtitle2">{{ address.line1 }}</div>
              <div class="text-subtitle2">{{ address.line2 }}</div>
              <div class="text-subtitle2">
                {{ address.city }}, {{ address.state }} {{ address.zipcode }}
              </div>
            </q-item-section>
          </q-item>
          <q-separator />
        </template>
        <q-item>
          To add or make changes to any addresses, please contact Marathon
          directly.
        </q-item>
      </q-list>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent, ref } from "vue";
import { useUserStore } from "stores/user";
import { storeToRefs } from "pinia";
import { db } from "boot/firebase";
import { doc, getDoc } from "firebase/firestore";

export default defineComponent({
  name: "AddressList",
  props: {
    isOpen: {
      type: Boolean,
      required: true,
    },
    selected: {
      type: Object,
      default: null,
    },
  },
  emits: ["update:selected", "update:isOpen"],
  async setup(props) {
    const userStore = useUserStore();
    const { userData } = storeToRefs(userStore);
    const addresses = ref([]);

    await getDoc(doc(db, `accounts/${userData.value.account}`)).then(
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          addresses.value = data?.addresses;
        }
      }
    );

    return { addresses };
  },
});
</script>
