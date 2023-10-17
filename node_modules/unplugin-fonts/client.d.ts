declare module 'unfonts.css' {
  const content: string
  export default content
}

declare module 'unplugin-fonts/head' {
  import { HtmlTagDescriptor } from "vite"
  export const links: HtmlTagDescriptor[]
}
