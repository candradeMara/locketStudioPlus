import AOS from "aos";

// "async" is optional;
// more info on params: https://quasar.dev/quasar-cli/boot-files
export default async (/* { app, router, ... } */) => {
  AOS.init({ once: true });
};
