import { Section } from "@xk6-dashboard/view"

export interface Tab {
  title?: string
  id?: string
  summary?: string
  report: boolean
  sections: Section[]
}

export interface DigestConfig {
  title?: string
  tabs: Tab[]
}
