<template>
  <h3>{{ title }}</h3>
  <div class="q-col-gutter-lg row wrap q-mt-md justify-center">
    <a
      v-for="resource in resources"
      :key="resource"
      class="col-md-3 col-sm-4 col-6"
      :download="resource.name"
      :href="resource.download"
      target="_blank"
    >
      <q-img
        v-if="resource.image"
        no-native-menu
        fit="fill"
        :src="`${resource.image}?tr=w-400`"
        class="resource"
      />
      <q-btn v-else class="full-width">{{ resource.name }}</q-btn>
    </a>
  </div>
</template>

<script>
import { defineComponent, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useAppStore } from "stores/app";
import { getFunctions, httpsCallable } from "@firebase/functions";

export default defineComponent({
  name: "ResourcesType",
  setup() {
    const route = useRoute();
    const appStore = useAppStore();
    const functions = getFunctions();
    const fetchImages = httpsCallable(functions, "callablefetchimages");
    const resourceType = ref(null);
    const resources = ref([]);
    const title = ref("");
    watch(
      () => route.params,
      async (params) => {
        resources.value = [];
        if (params.resourceType) {
          resourceType.value = params.resourceType;
          // Unhyphenate and Title Case
          title.value = params.resourceType
            .replaceAll("-", " ")
            .split(" ")
            .map((w) => w[0].toUpperCase() + w.substring(1).toLowerCase())
            .join(" ");
          appStore.pageTitle = title.value;
          const { data } = await fetchImages(`resources/${resourceType.value}`);
          // split everything into pdfs and images
          const { pdfs, images } = data.reduce(
            (acc, e) => {
              if (e.name.endsWith(".pdf")) {
                acc.pdfs.push(e);
              } else {
                acc.images.push(e);
              }
              return acc;
            },
            { pdfs: [], images: [] }
          );
          if (images.length > 0) {
            const pdfMap = pdfs.reduce((map, pdf) => {
              const filename = pdf.name.replace(/\.[^/.]+$/, "");
              map.set(filename, pdf.url);
              return map;
            }, new Map());
            let tmpResources = [];

            for (const image of images) {
              const filename = image.name.replace(/\.[^/.]+$/, "");
              const download = pdfMap.get(filename) || image.url;
              tmpResources.push({
                name: image.name.replace(/\.[^/.]+$/, ""),
                image: image.url,
                download,
              });
              console.log(tmpResources);
              resources.value = tmpResources.sort((a, b) =>
                a.name > b.name ? 1 : -1
              );
            }
          } else if (pdfs.length > 0) {
            const pdfObjects = pdfs.map((pdf) => ({
              name: pdf.name.replace(/\.[^/.]+$/, ""),
              download: pdf.url,
            }));
            resources.value = pdfObjects.sort((a, b) =>
              a.name > b.name ? 1 : -1
            );
          }
        }
      },
      { immediate: true }
    );
    return { resources, resourceType, title };
  },
});
</script>
<style lang="scss" scoped>
.resource {
  box-shadow: $shadow-4;
  cursor: pointer;
  display: flex;
  transition: $shadow-transition;
  &:hover {
    box-shadow: $shadow-8;
    &::before {
      animation: shine 0.85s;
      animation-fill-mode: forwards;
    }
  }
  &::before {
    animation: deshine 1.85s;
    background: linear-gradient(
      to right,
      fade_out(#fff, 1) 0%,
      fade_out(#fff, 0.4) 40%,
      fade_out(#fff, 0.6) 50%,
      fade_out(#fff, 1) 100%
    );
    content: "";
    display: block;
    height: 100%;
    left: -125%;
    opacity: 1;
    position: absolute;
    top: 0;
    transform: skewX(-25deg);
    width: 50%;
    z-index: 2;
  }
  @keyframes deshine {
    0% {
      left: 85%;
      opacity: 0.5;
    }
    100% {
      left: 200%;
      opacity: 0.25;
    }
  }
  @keyframes shine {
    100% {
      left: 85%;
      opacity: 0.5;
    }
  }
}
</style>
