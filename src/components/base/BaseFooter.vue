<template>
  <q-footer bordered>
    <div class="row bg-secondary text-dark items-start footer">
      <q-list dense padding class="col q-pa-lg">
        <q-item-label header>About Us</q-item-label>
        <q-item v-ripple clickable to="/about/story">Our Story</q-item>
        <q-item v-ripple clickable to="/about/warranty">Warranty</q-item>
        <q-item v-ripple clickable to="/about/ethics">Ethics</q-item>
        <q-item v-ripple clickable to="/about/trade-shows">Trade Shows</q-item>
      </q-list>
      <q-list dense padding class="col q-pa-lg">
        <q-item-label header>Message Us</q-item-label>
        <q-item v-ripple clickable to="/contact">Open An Account</q-item>
        <q-item v-ripple clickable to="/contact">Email Us</q-item>
        <q-item v-ripple clickable to="/contact">Employment</q-item>
        <q-item v-ripple clickable to="/contact">800-451-1515</q-item>
      </q-list>
      <q-list dense padding class="col q-pa-lg">
        <q-item-label header>Contact Us</q-item-label>
        <q-item
          >Telephone:
          <base-encoded-link link="tel:+1800451-1515" text="800-451-1515"
        /></q-item>
        <q-item>Fax: 508-226-6272</q-item>
        <q-item
          >Email:
          <base-encoded-link
            link="mailto:mail@marathon-co.com"
            text="mail@marathon-co.com"
        /></q-item>
        <q-item
          >Marathon Company <br />PO Box 419 / 90 O'Neil Blvd. <br />Attleboro,
          MA 02703</q-item
        >
      </q-list>
    </div>
    <div class="row bg-grey-8 text-white q-pa-md text-center">
      <div class="col">© {{ year }} Marathon Company</div>
      <div class="col">Terms of Use</div>
      <div class="col">Privacy Policy</div>
    </div>
    <div class="row bg-grey-8 text-grey-6 q-pa-md text-center text-caption">
      Every piece of Lestage® Cape Cod Jewelry® is made in the U.S.A. and is
      certified by the responsible jewelry council. Lestage® is not affiliated
      with Eden Hand Arts of Dennis, MA. The creator of the Cape Cod Screwball®
      bracelet. Lestage® and Cape Cod Jewelry® are registered trademarks owned
      by Marathon Company.
    </div>
  </q-footer>
</template>

<script>
import { date } from "quasar";
import BaseEncodedLink from "components/base/BaseEncodedLink";

export default {
  components: {
    BaseEncodedLink,
  },
  setup() {
    const year = date.formatDate(Date.now(), "YYYY");
    return { year };
  },
};
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
</style>
