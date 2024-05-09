<template>
  <q-footer bordered>
    <div class="row-md bg-secondary text-dark items-start footer">
      <div class="col">
        <q-list dense class="">
          <q-item-label header class="q-gt-sm"> About Us </q-item-label>
          <q-item v-ripple clickable to="/about/story"> Our Story </q-item>
          <q-item v-ripple clickable to="/about/warranty"> Warranty </q-item>
          <q-item v-ripple clickable to="/about/ethics"> Ethics </q-item>
          <q-item v-ripple clickable to="/about/tradeshows"> Trade Shows </q-item>
        </q-list>
      </div>
      <div class="col">
        <q-list dense class="">
          <q-item-label header class="q-gt-sm"> Message Us </q-item-label>
          <q-item v-ripple clickable to="/contact"> Contact Us </q-item>
        </q-list>
      </div>
      <div class="col contact-info">
        <q-list dense class="">
          <q-item-label header class="q-gt-sm text-center">Contact Us </q-item-label>
          <div class="row justify-center">
            <div class="col-6">
              <q-item dense> Telephone: <base-encoded-link link="tel:+18004511515" text="800-451-1515" /> </q-item>
              <q-item dense> Telephone: <base-encoded-link link="tel:+15082225544" text="508-222-5544" /> </q-item>
              <q-item dense>Fax: 508-226-6272</q-item>
            </div>
            <div class="col-6">
              <q-item dense> Email: <base-encoded-link link="mailto:mail@marathon-co.com" text="mail@marathon-co.com" />
              </q-item>
              <q-item dense>
                Marathon Company <br />PO Box 419 / 90 O'Neil Blvd. <br />Attleboro, MA 02703
              </q-item>
            </div>
          </div>
        </q-list>
      </div>
    </div>
    <div class="row bg-grey-8 q-pa-xs boilerplate">
      <router-link to="/page/copyrights" class="col"> © {{ year }} Marathon Company / Terms of Use & Privacy Policy
      </router-link>
      <a v-if="isLoggedIn" class="col" href="" @click="logout">Log Out</a>
      <router-link v-if="!isLoggedIn" class="col" to="/register">Register</router-link>
      <a v-if="!isLoggedIn" class="col" href="" @click.prevent="openLogin">Log In</a>
    </div>
    <div class="row bg-grey-8 text-grey-6 q-pa-xs text-caption disclaimer">
      Lestage® Cape Cod Jewelry® is certified by the responsible jewelry council. Lestage® is not affiliated with Eden
      Hand Arts of Dennis, MA. The creator of the Cape Cod Screwball® bracelet. Lestage® and Cape Cod Jewelry® are
      registered trademarks owned by Marathon Company.
    </div>
  </q-footer>
</template>

<script>
import { defineComponent } from "vue";
import { date } from "quasar";
import { useUserStore } from "stores/user";
import { storeToRefs } from "pinia";
import BaseEncodedLink from "../base/BaseEncodedLink.vue";

export default defineComponent({
  name: "LayoutFooter",
  components: {
    BaseEncodedLink,
  },
  async setup() {
    const year = date.formatDate(Date.now(), "YYYY");
    const userStore = useUserStore();
    const { isLoggedIn } = storeToRefs(userStore);
    return { isLoggedIn, year };
  },
});
</script>

<style lang="scss" scoped>
.footer {
  a.q-item {
    border-radius: 0.25rem;
    overflow: hidden;
    position: relative;
    transition: border 0.25s ease-out;

    &::after {
      content: "➔";
      display: flex;
      height: 100%;
      flex-direction: column;
      justify-content: center;
      position: absolute;
      right: -2rem;
      top: 0;
      transition: right 0.25s ease-out;
    }

    &:hover {
      border-left: 4px solid $dark;
      z-index: 2;

      &::after {
        right: 10px;
      }
    }
  }
}

.contact-info {
  padding-right: 2rem;

  .row {
    margin-left: -0.5rem;
    margin-right: -0.5rem;
  }

  .col-6 {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }

  .q-item {
    margin-bottom: 0.25rem;
  }
}

.boilerplate {
  a {
    color: $grey-5;
    text-decoration: none;
    text-align: center;

    &:hover {
      color: white;
    }
  }
}

.disclaimer {
  font-size: 0.65rem;
}
</style>