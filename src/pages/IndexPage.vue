<template>
  <div class="justify-center">
    <suspense>
      <template #fallback>
        <q-skeleton height="37.25vw" />
      </template>
      <carousel-home v-if="!isLoggedIn" />
    </suspense>
  </div>
  <div class="row justify-center">
    <div v-dompurify-html="content.html" />
  </div>
  <div v-if="isLoggedIn" class="q-col-gutter-lg q-px-md row justify-center">
    <div
      v-for="collection in getCollectionsArray"
      :key="collection"
      class="col-md-4 col-sm-6 col-xs-12"
    >
      <router-link
        :to="`${collection.path}`"
        class="collection-link"
        exact
        data-aos="fade-up"
      >
        <span class="title">{{ collection.label }}</span>
        <span class="action">View the Collection</span>
        <q-img :src="getCollectionImage(`${collection.path}`)" :ratio="3 / 2" />
      </router-link>
    </div>
  </div>
  <div class="column q-mt-md items-center">
    <img class="building" src="~/assets/img/building.png" />
  </div>
</template>

<script>
import { defineComponent, defineAsyncComponent, ref } from "vue";
import { useAppStore } from "stores/app";
import { useUserStore } from "stores/user";
import { storeToRefs } from "pinia";
import { db } from "src/boot/firebase";
import { doc, getDoc } from "firebase/firestore";

const CarouselHome = defineAsyncComponent(() =>
  import("components/base/CarouselHome.vue")
);

export default defineComponent({
  name: "IndexPage",
  components: {
    CarouselHome,
  },
  setup() {
    const appStore = useAppStore();
    const { getCollectionsArray } = storeToRefs(appStore);
    const userStore = useUserStore();
    const { isLoggedIn } = storeToRefs(userStore);
    const content = ref("");
    getDoc(doc(db, "app/pages")).then((docSnap) => {
      if (docSnap.exists()) {
        const pages = docSnap.data();
        content.value = pages["home"] || "";
      }
    });
    const getCollectionImage = (path) => {
      const shopPath = path.replace("products", "shop");
      return `${process.env.IMAGEKIT_URL}/${shopPath}.jpg?tr=n-collection`;
    };
    return {
      getCollectionsArray,
      isLoggedIn,
      content,
      getCollectionImage,
    };
  },
});
</script>
<style lang="scss" scoped>
.collection-link {
  border-radius: 0.125rem;
  box-shadow: $shadow-3;
  display: block;
  height: 100%;
  overflow: hidden;
  padding-bottom: 2rem;
  position: relative;
  width: 100%;
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
    border-bottom: 1px solid hsla(0deg, 0%, 0%, 0);
    color: $dark;
    position: absolute;
    bottom: 5px;
    left: 10px;
    font-weight: 600;
    text-decoration: none;
    text-shadow: 1px 1px 0px hsla(0deg, 0%, 100%, 0.5);
    transition: bottom 0.25s ease-out, border 0.25s ease-in;
    z-index: 4;
  }
  .action {
    color: $dark;
    position: absolute;
    bottom: -2rem;
    left: 10px;
    font-weight: 400;
    text-shadow: 1px 1px 1px hsla(0deg, 0%, 100%, 0.25);
    transition: bottom 0.25s ease-out;
    z-index: 4;
  }
  &:hover {
    &::after {
      background-position: 0 0, 0 0;
      transition-duration: 0.75s;
    }
    .title {
      border-bottom: 1px solid hsla(0deg, 0%, 0%, 0.5);
      bottom: 2rem;
    }
    .action {
      bottom: 5px;
    }
  }
}
.building {
  max-width: 100%;
}
</style>
