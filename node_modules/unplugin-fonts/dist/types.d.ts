interface Options {
    custom?: CustomFonts;
    fontsource?: FontsourceFonts;
    google?: GoogleFonts;
    typekit?: TypeKitFonts;
    sourcemap?: string;
}
interface CustomFontFace {
    source: string;
    name: string;
    basename: string;
    weight: number;
    style: string;
    display: string;
    local?: string | string[];
    files: {
        src: string;
        ext: string;
        path: string;
        format: string;
    }[];
}
interface CustomFontFamily {
    /**
     * Name of the font family.
     * @example 'Comic Sans MS'
     */
    name: string;
    /**
     * Regex(es) of font files to import. The names of the files will
     * predicate the `font-style` and `font-weight` values of the `@font-rule`'s.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/font-weight#common_weight_name_mapping
     *
     * @example
     * A value of `./RobotoBoldItalic.*` will create this `@font-rule`:
     *
     * ```css
     * font-face {
     *    font-family: 'Roboto';
     *    src: url(./RobotoBoldItalic.ttf) format('truetype')
     *         url(./RobotoBoldItalic.woff) format('woff')
     *         url(./RobotoBoldItalic.woff2) format('woff2');
     *    font-weight: bold;
     *    font-style: italic;
     *    font-display: auto;
     * }
     * ```
     */
    src: string | string[];
    /**
     * Local name of the font. Used to add `src: local()` to `@font-rule`.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face#description
     */
    local?: string | string[];
    /**
     * Allows to transform the generated config for any font face.
     *
     * @param font
     * @returns
     */
    transform?: (font: CustomFontFace) => CustomFontFace | null;
}
interface CustomFonts {
    /**
     * Font families.
     */
    families: CustomFontFamily[] | Record<string, string | string[] | Omit<CustomFontFamily, 'name'>>;
    /**
     * Defines the default `font-display` value used for the generated
     * `@font-rule` classes.
     * @see https://developer.mozilla.org/fr/docs/Web/CSS/@font-face/font-display
     * @default 'auto'
     */
    display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional';
    /**
     * Using `<link rel="preload">` will trigger a request for the WebFont
     * early in the critical rendering path, without having to wait for the
     * CSSOM to be created.
     * @see https://web.dev/optimize-webfont-loading/#preload-your-webfont-resources
     * @default true
     */
    preload?: boolean;
    /**
     * Using `<link rel="prefetch">` is intended for prefetching resources
     * that will be used in the next navigation/page load
     * (e.g. when you go to the next page)
     *
     * Note: this can not be used with `preload`
     * @default false
     */
    prefetch?: boolean;
    /**
     * @default: 'head-prepend'
     */
    injectTo?: 'head' | 'body' | 'head-prepend' | 'body-prepend';
    /**
     * Remove the prefix from the front path
     * @default: 'public/'
     */
    stripPrefix?: string;
}
interface BaseFontsourceFontFamily {
    name: string;
    styles?: ('italic' | 'normal')[];
    subset?: string;
}
interface WeightsFontsourceFontFamily extends BaseFontsourceFontFamily {
    weights: (100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900)[];
}
interface VariableFontsourceFontFamily extends BaseFontsourceFontFamily {
    variables: ('variable' | 'variable-italic' | 'variable-full' | 'variable-full-italic')[];
}
type FontsourceFontFamily = WeightsFontsourceFontFamily | VariableFontsourceFontFamily;
interface FontsourceFonts {
    families: (string | FontsourceFontFamily)[];
}
interface GoogleFontFamily {
    name: string;
    styles?: string;
    defer?: boolean;
}
interface GoogleFonts {
    families: (string | GoogleFontFamily)[];
    text?: string;
    display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional';
    preconnect?: boolean;
    /**
     * @default: 'head-prepend'
     */
    injectTo?: 'head' | 'body' | 'head-prepend' | 'body-prepend';
}
interface TypeKitFonts {
    id: string;
    defer?: boolean;
    /**
     * default: 'head-prepend'
     */
    injectTo?: 'head' | 'body' | 'head-prepend' | 'body-prepend';
}

export { CustomFontFace, CustomFontFamily, CustomFonts, FontsourceFontFamily, FontsourceFonts, GoogleFontFamily, GoogleFonts, Options, TypeKitFonts };
