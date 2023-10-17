import {
  src_default
} from "./chunk-TMZKTUU5.mjs";

// src/astro.ts
function astro_default(options) {
  return {
    name: "unplugin-fonts",
    hooks: {
      "astro:config:setup": async (astro) => {
        var _a;
        if (options == null ? void 0 : options.custom)
          options.custom.stripPrefix = "public/";
        (_a = astro.config.vite).plugins || (_a.plugins = []);
        astro.config.vite.plugins.push(src_default.vite(options));
        astro.injectScript("page-ssr", 'import "unfonts.css";');
      }
    }
  };
}
export {
  astro_default as default
};
