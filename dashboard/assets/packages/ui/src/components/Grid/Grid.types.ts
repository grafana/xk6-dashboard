export interface GridElementProps {
  columns?: number
  gap?: 1 | 2 | 3 | 4
  height?: string | number
  width?: string | number
}

export interface GridStyleProps extends Omit<GridElementProps, "width" | "height"> {
  $height?: string | number
  $width?: string | number
}

export interface GridColumnElementProps {
  xs?: number
  sm?: number
  md?: number
  lg?: number
  xl?: number
  xxl?: number
}
