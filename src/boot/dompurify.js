import { boot } from "quasar/wrappers";
import VueDOMPurifyHTML from "vue-dompurify-html";

export default boot(async ({ app }) => {
  const allowedTagsPattern = /^q-/;

  const config = {
    ALLOWED_TAGS: allowedTagsPattern,
  };
  app.use(VueDOMPurifyHTML, config);
});
