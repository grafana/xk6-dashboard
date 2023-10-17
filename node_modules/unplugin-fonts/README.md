# unplugin-fonts

㊗️ Universal Webfont loader - Unfonts

[![npm](https://img.shields.io/npm/v/unplugin-fonts.svg)](https://www.npmjs.com/package/unplugin-fonts)

This plugin goes beyond just generating font-face rules - it also takes care of link preload and prefetch, optimizing font loading for a faster and more efficient user experience.

Unfonts currently supports popular font providers like Typekit, Google Fonts, and Fontsource, as well as custom fonts. This gives you the flexibility to choose from a vast range of fonts and seamlessly integrate them into your projects.

With Unfonts, you no longer have to manually manage font files and font-face rules, or worry about slow loading times. Our package does all the heavy lifting for you, so you can focus on creating amazing content with ease.

View configuration:
- [Typekit](#typekit)
- [Google Fonts](#google-fonts)
- [Custom Fonts](#custom-fonts)
- [Fontsource](#fontsource)


## Install

```bash
npm i --save-dev unplugin-fonts # pnpm add -D unplugin-fonts
```

<details>
<summary>Vite</summary><br>

```ts
// vite.config.ts
import Unfonts from 'unplugin-fonts/vite'

export default defineConfig({
  plugins: [
    Unfonts({ /* options */ }),
  ],
})
```

Example: [`examples/vite`](./examples/vite)

<br></details>

<!-- <details>
<summary>Rollup</summary><br>

```ts
// rollup.config.js
import Starter from 'unplugin-fonts/rollup'

export default {
  plugins: [
    Starter({ /* options */ }),
  ],
}
```

<br></details> -->


<details>
<summary>Webpack</summary><br>

> **Warning**  
> Not implemented yet

```ts
// webpack.config.js
module.exports = {
  /* ... */
  plugins: [
    require('unplugin-fonts/webpack')({ /* options */ })
  ]
}
```

<br></details>

<details>
<summary>Nuxt</summary><br>

```ts
// nuxt.config.js
export default {
  modules: [
    ['unplugin-fonts/nuxt'],
  ],
  unfonts: {
    /* options */
  }
}
```

Example: [`examples/nuxt`](./examples/nuxt)

<br></details>

<!-- <details>
<summary>Vue CLI</summary><br>

```ts
// vue.config.js
module.exports = {
  configureWebpack: {
    plugins: [
      require('unplugin-fonts/webpack')({ /* options */ }),
    ],
  },
}
```

<br></details> -->


<details>
<summary>SvelteKit</summary><br>

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import { sveltekit } from '@sveltejs/kit/vite'
import Unfonts from 'unplugin-fonts/vite'

export default defineConfig({
  plugins: [
    sveltekit(),
    Unfonts({
      /* options */
    })
  ]
})
```

Example: [`examples/sveltekit`](./examples/sveltekit)

<br></details>

<details>
<summary>Astro</summary><br>

```ts
// astro.config.js
import { defineConfig } from 'astro/config'
import Unfonts from 'unplugin-fonts/astro'

export default defineConfig({
  integrations: [
    Unfonts({
      /* options */
    })
  ]
})
```

```astro
---
// src/pages/index.astro
import Unfont from 'unplugin-fonts/astro/component.astro';
---

<html>
  <head>
    <Unfont />
  </head>
  <body>
    <!-- ... -->
  </body>
</html>
```

Example: [`examples/astro`](./examples/astro)

<br></details>

---


<details>
<summary>Migrating from <code>vite-plugin-fonts</code></summary><br>

```diff
// vite.config.ts
-import { VitePluginFonts } from 'vite-plugin-fonts'
+import Unfonts from 'unplugin-fonts/vite'

export default defineConfig({
  plugins: [
-    VitePluginFonts({ 
+    Unfonts({ 
      /* options */ 
    }),
  ],
})
```


```diff
// main.ts
-import 'virtual:fonts.css'
+import 'unfonts.css'
```


<br></details>


## Import generated `@font-rules` CSS

> **Note**  
> Required if using **custom** or **fontsource** providers

```ts
import 'unfonts.css'
```



## Providers


### Typekit

Load fonts from [Typekit](https://typekit.com/).

```ts
Unfonts({
  // Typekit API
  typekit: {
    /**
     * Typekit project id
     */
    id: '<projectId>',

    /**
     * enable non-blocking renderer
     *   <link rel="preload" href="xxx" as="style" onload="this.rel='stylesheet'">
     * default: true
     */
    defer: true,

    /**
     * define where the font load tags should be inserted
     * default: 'head-prepend'
     *   values: 'head' | 'body' | 'head-prepend' | 'body-prepend'
     */
    injectTo: 'head-prepend',
  },
})
``` 


### Google Fonts

Load fonts from [Google Fonts](https://fonts.google.com/).

```ts
Unfonts({
  // Google Fonts API V2
  google: {
    /**
     * enable preconnect link injection
     *   <link rel="preconnect" href="https://fonts.gstatic.com/" crossorigin>
     * default: true
     */
    preconnect: false,

    /**
     * values: auto, block, swap(default), fallback, optional
     * default: 'swap'
     */
    display: 'block',

    /**
     * define which characters to load
     * default: undefined (load all characters)
     */
    text: 'ViteAwsom',

    /**
     * define where the font load tags should be inserted
     * default: 'head-prepend'
     *   values: 'head' | 'body' | 'head-prepend' | 'body-prepend'
     */
    injectTo: 'head-prepend',

    /**
     * Fonts families lists
     */
    families: [
      // families can be either strings (only regular 400 will be loaded)
      'Source Sans Pro',

      // or objects
      {
        /**
         * Family name (required)
         */
        name: 'Roboto',

        /**
         * Family styles
         */
        styles: 'ital,wght@0,400;1,200',

        /**
         * enable non-blocking renderer
         *   <link rel="preload" href="xxx" as="style" onload="this.rel='stylesheet'">
         * default: true
         */
        defer: true,
      },
    ],
  },
})
``` 

### Custom Fonts

Load custom fonts from files.

```ts
Unfonts({
  // Custom fonts.
  custom: {
    /**
     * Fonts families lists
     */
    families: [{
      /**
       * Name of the font family.
       */
      name: 'Roboto',
      /**
       * Local name of the font. Used to add `src: local()` to `@font-rule`.
       */
      local: 'Roboto',
      /**
       * Regex(es) of font files to import. The names of the files will
       * predicate the `font-style` and `font-weight` values of the `@font-rule`'s.
       */
      src: './src/assets/fonts/*.ttf',

      /**
       * This function allow you to transform the font object before it is used
       * to generate the `@font-rule` and head tags.
       */
      transform(font) {
        if (font.basename === 'Roboto-Bold') {
          // update the font weight
          font.weight = 700
        }

        // we can also return null to skip the font
        return font
      }
    }],

    /**
     * Defines the default `font-display` value used for the generated
     * `@font-rule` classes.
     */
    display: 'auto',

    /**
     * Using `<link rel="preload">` will trigger a request for the WebFont
     * early in the critical rendering path, without having to wait for the
     * CSSOM to be created.
     */
    preload: true,

    /**
     * Using `<link rel="prefetch">` is intended for prefetching resources
     * that will be used in the next navigation/page load
     * (e.g. when you go to the next page)
     *
     * Note: this can not be used with `preload`
     */
    prefetch: false,

    /**
     * define where the font load tags should be inserted
     * default: 'head-prepend'
     *   values: 'head' | 'body' | 'head-prepend' | 'body-prepend'
     */
    injectTo: 'head-prepend',
  },

})
``` 

### Fontsource

Load fonts from [Fontsource](https://fontsource.org/) packages.

> **Note**
> You will need to install `@fontsource/<font>` packages.

```ts
Unfonts({
  // Fontsource API
  fontsource: {
    /**
     * Fonts families lists
     */
    families: [
      // families can be either strings (load default font set)
      // Require the `@fontsource/abeezee` package to be installed.
      'ABeeZee',
      {
        /**
         * Name of the font family.
         * Require the `@fontsource/roboto` package to be installed.
         */
        name: 'Roboto',
        /**
         * Load only a subset of the font family.
         */
        weights: [400, 700],
        /**
         * Restrict the font styles to load.
         */
        styles: ['italic', 'normal'],
        /**
         * Use another font subset.
         */
        subset: 'latin-ext',
      },
      {
        /**
         * Name of the font family.
         * Require the `@fontsource/cabin` package to be installed.
         */
        name: 'Cabin',
        /**
         * Instead of using weights/styles, we can use variables fonts.
         */
        variables: ['variable-full', 'variable-full-italic'],
        /**
         * Use another font subset.
         */
        subset: 'latin-ext',
      },
    ],
  },
})
```

## Typescript Definitions

```json
{
  "compilerOptions": {
    "types": ["unplugin-fonts/client"]
  }
}
```

or 

```ts	
// declaration.d.ts
/// <reference types="unplugin-fonts/client" />
```

## Resources

- https://web.dev/optimize-webfont-loading/
- https://csswizardry.com/2020/05/the-fastest-google-fonts/
- _(unmaintained)_ https://www.npmjs.com/package/webfontloader
