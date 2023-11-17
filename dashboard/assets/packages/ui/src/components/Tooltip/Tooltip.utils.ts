import { type Placement } from "@popperjs/core"

interface Attributes {
  [key: string]: { [key: string]: string } | undefined
}

export const getPopperPlacement = (attributes?: Attributes) => {
  return attributes?.popper?.["data-popper-placement"] as Placement | undefined
}

export const getArrowPosition = (placement?: Placement) => {
  if (!placement) {
    return "left"
  }

  if (placement.startsWith("top")) {
    return "top"
  }

  if (placement.startsWith("bottom")) {
    return "bottom"
  }

  if (placement.startsWith("right")) {
    return "right"
  }

  return "left"
}
