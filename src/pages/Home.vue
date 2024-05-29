<template>
  <q-page>


    <lorem add="2p" class="q-pa-md row q-ma-md" />
    <div class="q-gutter-md row justify-center">
      <router-link
        v-for="collection in [
          'Kiddie Kraft',
          'Essentials',
          'Stepping Stones',
          'Cape Cod',
          'Convertibles',
          'Evening Tide',
          'Replacement Chains',
        ]"
        :key="collection"
        :to="`/shop/${collection}`"
        class="col-4 collection-link"
        exact
        data-aos="fade-up"
      >
        <span class="title">{{ collection }}</span>
        <span class="action">View the Collection</span>
        <q-img
          :src="`https://via.placeholder.com/300x200?text=collection-${collection}`"
          :ratio="3 / 2"
        />
      </router-link>
    </div>
    <div class="column q-mt-md items-center">
      <img :src="`https://via.placeholder.com/300x100?text=building-image`" />
    </div>
  </q-page>
</template>

<script>
import { ref } from "vue";
import LoremIpsum from "vue-lorem-ipsum";

export default {
  name: "Home",
  components: {
    lorem: LoremIpsum,
  },
  setup() {
    const slide = ref(1);
    return { slide };
  },
};
</script>
<style lang="scss" scoped>
.collection-link {
  border-radius: 0.125rem;
  box-shadow: $shadow-3;
  overflow: hidden;
  position: relative;

  &::after {
    background-image: linear-gradient(
      -45deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.2) 37%,
      rgba(255, 255, 255, 0.6) 45%,
      rgba(255, 255, 255, 0) 50%
    );
    background-position: 200% 200%, 0 0;
    background-repeat: no-repeat;
    background-size: 250% 250%;
    border-radius: 0.125rem;
    content: "";
    display: block;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    transition: background-position 0s ease-out;
    width: 100%;
    z-index: 555;
  }
  .title {
    border-bottom: 1px solid hsla(0, 0, 0, 0);
    color: $dark;
    position: absolute;
    bottom: 5px;
    left: 10px;
    font-weight: 600;
    text-decoration: none;
    text-shadow: 1px 1px 1px hsla(0, 0, 100, 0.25);
    transition: bottom 0.25s ease-out, border 0.25s ease-in;
    z-index: 444;
  }
  .action {
    color: $dark;
    position: absolute;
    bottom: -2rem;
    left: 10px;
    font-weight: 400;
    text-shadow: 1px 1px 1px hsla(0, 0, 100, 0.25);
    transition: bottom 0.25s ease-out;
    z-index: 444;
  }
  &:hover {
    &::after {
      background-position: 0 0, 0 0;
      transition-duration: 0.75s;
    }
    .title {
      border-bottom: 1px solid hsla(0, 0, 0, 0.5);
      bottom: 2rem;
    }
    .action {
      bottom: 5px;
    }
  }
}
</style>
