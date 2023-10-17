type AlignItems = "stretch" | "flex-start" | "flex-end" | "center" | "baseline" | "start" | "end" | "self-start" | "self-end"

type FlexBasis = "auto" | string

type FlexDirection = "column" | "row"

type FlexWrap = "nowrap" | "wrap" | "wrap-reverse"

type JustifyContent =
  | "flex-start"
  | "flex-end"
  | "center"
  | "space-between"
  | "space-around"
  | "space-evenly"
  | "start"
  | "end"
  | "left"
  | "right"

export interface FlexElementProps {
  align?: AlignItems
  direction?: FlexDirection
  gap?: 1 | 2 | 3 | 4
  rowGap?: number
  columnGap?: number
  justify?: JustifyContent
  wrap?: FlexWrap
  basis?: FlexBasis
  grow?: number
  shrink?: number
  padding?: number
  height?: string | number
  width?: string | number
}
