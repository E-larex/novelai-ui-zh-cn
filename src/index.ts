import { UiTranslator } from "./translator";

function isImageGenerationPage(location: Location): boolean {
  return location.hostname === "novelai.net" && location.pathname.startsWith("/image");
}

if (isImageGenerationPage(window.location)) {
  new UiTranslator(document).start();
}

export { UiTranslator, isImageGenerationPage };
