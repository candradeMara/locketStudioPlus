<template>
  <div>
    <div class="row justify-center">
      <suspense v-if="currentImage !== 'threeSixty'">
        <template #fallback>
          <q-spinner-grid color="primary" size="4rem" />
        </template>
        <image-zoom :src="getWatermarkedImageUrlMain(currentImage?.url)" />
      </suspense>
      <suspense v-else>
        <template #fallback>
          <q-spinner-grid color="primary" size="4rem" />
        </template>
        <image-360 :src="threeSixty" />
      </suspense>
      <!-- <component
      :is="currentImage === 'threeSixty' ? 'base-360-image' : 'base-zoom-image'"
      :src="
        currentImage === 'threeSixty'
          ? threeSixty
          : `${currentImage?.url}?tr=n=main`
      "
      class="current-image"
    /> -->
    </div>
    <div v-if="gallery.length > 1 || threeSixty.length > 0" class="gallery row q-gutter-md q-my-md justify-center">
      <q-img v-for="image in gallery" :key="image" no-native-menu fit="fill" :ratio="1"
        :src="getWatermarkedImageUrl(image.url, 'thumb')" class="col gallery-image"
        :class="currentImage === image ? 'current' : ''" @click="currentImage = image" />
      <q-img v-if="threeSixty.length > 0" no-native-menu fit="contain" :ratio="1"
        class="col gallery-image gallery-image-360" :class="currentImage === 'threeSixty' ? 'current' : ''"
        :src="threeSixty[0].thumbnail" @click="currentImage = 'threeSixty'" />
    </div>
  </div>
</template>

<script>
import { defineAsyncComponent, ref } from "vue";
import { getFunctions, httpsCallable } from "@firebase/functions";
const ImageZoom = defineAsyncComponent(() =>
  import("src/components/shop/ImageZoom.vue")
);
const Image360 = defineAsyncComponent(() =>
  import("components/shop/Image360.vue")
);

// Gallery of images from imagekit folder
export default {
  name: "ProductGallery",
  components: {
    ImageZoom,
    Image360,
  },
  props: {
    sku: {
      type: String,
      required: true,
    },
    parent: {
      type: String,
      default: () => {
        return null;
      },
    },
  },
  methods: {
    getWatermarkedImageUrl(imageUrl, transformationName) {
      const watermarkedImageUrl = `${imageUrl}?tr=l-image,i-watermark@@watermark.png,w-250,h-250,x-10,y-10,l-end,n-${transformationName}`;
      return watermarkedImageUrl;
    },
    getWatermarkedImageUrlMain(imageUrl) {
      const watermarkedImageUrl = `${imageUrl}?tr=l-image,i-watermark@@watermark.png,w-iw,h-ih,x-10,y-10,l-end`;
      return watermarkedImageUrl;
    },
  },
  async setup(props) {
    const currentImage = ref(null);
    const functions = getFunctions();
    const fetchImages = httpsCallable(functions, "callablefetchimages");
    const gallery = ref([]);
    const threeSixty = ref([]);
    await fetchImages(`products/${props.sku}`)
      .then(({ data }) => {
        if (Array.isArray(data) && data.length > 0) {
          const images = [...data].sort((a, b) => {
            return a.name.replace(/\..+$/, "") < b.name.replace(/\..+$/, "")
              ? -1
              : 1;
          });
          gallery.value = [...gallery.value, ...images];
          currentImage.value = gallery.value[0];
        }
      })
      .catch((error) => {
        console.error(error);
      });
    await fetchImages(`products/${props.sku}/360`).then(({ data }) => {
      if (Array.isArray(data) && data.length > 0) {
        threeSixty.value = data;
        if (currentImage.value == null) {
          currentImage.value = "threeSixty";
        }
      }
    });
    // add parent image if none found for that product
    if (props.parent && gallery.value?.length < 1) {
      await fetchImages(`products/${props.parent}`)
        .then(({ data }) => {
          if (Array.isArray(data) && data.length > 0) {
            const images = [...data].sort((a, b) => {
              return a.name.replace(/\..+$/, "") < b.name.replace(/\..+$/, "")
                ? -1
                : 1;
            });
            gallery.value = [...gallery.value, ...images];
            currentImage.value = gallery.value[0];
          } else {
            currentImage.value = "fallback";
          }
        })
        .catch((error) => {
          console.error(error);
        });
    }
    return { currentImage, gallery, threeSixty };
  },
};
</script>
<style lang="scss" scoped>
.gallery-image.current,
.current-image {
  box-shadow: $shadow-12;
  border: 2px solid $primary;
}

.gallery-main-image {
  border-radius: 0.125rem;
  box-shadow: $shadow-2;
}

.gallery-image {
  background: white;
  border: 2px solid white;
  border-radius: 0.125rem;
  box-shadow: $shadow-3;
  cursor: pointer;
  overflow: hidden;
  position: relative;

  &::after {
    background-image: linear-gradient(-45deg,
        rgba(255, 255, 255, 0) 0%,
        rgba(255, 255, 255, 0.2) 37%,
        rgba(255, 255, 255, 0.6) 45%,
        rgba(255, 255, 255, 0) 50%);
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

  &:hover {
    &::after {
      background-position: 0 0, 0 0;
      transition-duration: 0.75s;
    }
  }
}

.gallery-image.gallery-image-360 {
  position: relative;
  z-index: 1;

  &::before {
    color: $primary;
    content: "360°";
    display: block;
    font-size: 1.5rem;
    position: absolute;
    bottom: 0;
    left: 0;
    text-align: center;
    text-shadow: 1px, 1px, 1px hsla(0deg, 0%, 100%, 1);
    width: 100%;
    z-index: 2;
  }
}
</style>
