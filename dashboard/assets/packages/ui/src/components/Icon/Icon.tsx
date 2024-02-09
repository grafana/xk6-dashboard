// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import React, { forwardRef, type ComponentProps, type FunctionComponent, type Ref } from "react"

import { ReactComponent as DarkModeIcon } from "assets/icons/dark_mode.svg"
import { ReactComponent as ExpandLessIcon } from "assets/icons/expand_less.svg"
import { ReactComponent as ExpandMoreIcon } from "assets/icons/expand_more.svg"
import { ReactComponent as HourGlassIcon } from "assets/icons/hour_glass.svg"
import { ReactComponent as InfoIcon } from "assets/icons/info.svg"
import { ReactComponent as LightModeIcon } from "assets/icons/light_mode.svg"
import { ReactComponent as LogoIcon } from "assets/icons/logo.svg"
import { ReactComponent as OptionsIcon } from "assets/icons/options.svg"
import { ReactComponent as QuestionIcon } from "assets/icons/question.svg"
import { ReactComponent as RewindTimeIcon } from "assets/icons/rewind_time.svg"
import { ReactComponent as SpinnerIcon } from "assets/icons/spinner.svg"
import { ReactComponent as StopWatchIcon } from "assets/icons/stop_watch.svg"

interface IconCommonProps extends ComponentProps<"svg"> {
  className?: string
  title?: string
}

interface IconProps extends IconCommonProps {
  name: keyof typeof IconMap
}

function IconBase({ className, name, title, ...props }: IconProps, ref: Ref<HTMLSpanElement>) {
  const IconComponent = IconMap[name]

  return (
    <span ref={ref}>
      <IconComponent aria-hidden="true" className={className} title={title} {...props} />
    </span>
  )
}

type SVGComponent = FunctionComponent<IconCommonProps>

export const IconMap = {
  "chevron-down": ExpandMoreIcon as SVGComponent,
  "chevron-up": ExpandLessIcon as SVGComponent,
  "hour-glass": HourGlassIcon as SVGComponent,
  info: InfoIcon as SVGComponent,
  options: OptionsIcon as SVGComponent,
  logo: LogoIcon as SVGComponent,
  moon: DarkModeIcon as SVGComponent,
  question: QuestionIcon as SVGComponent,
  "rewind-time": RewindTimeIcon as SVGComponent,
  spinner: SpinnerIcon as SVGComponent,
  "stop-watch": StopWatchIcon as SVGComponent,
  sun: LightModeIcon as SVGComponent
}

export const Icon = forwardRef(IconBase)
