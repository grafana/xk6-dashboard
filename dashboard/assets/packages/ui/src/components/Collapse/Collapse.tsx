import React, { ReactNode } from "react"

import { Flex } from "../Flex"

import { ReactComponent as ExpandLessIcon } from "assets/icons/expand_less.svg"
import { ReactComponent as ExpandMoreIcon } from "assets/icons/expand_more.svg"
import * as styles from "./Collapse.css"

interface CollapseProps {
  children: ReactNode
  title: string
  isOpen: boolean
  onClick: () => void
}

export const Collapse = ({ children, title, isOpen, onClick }: CollapseProps) => {
  return (
    <div>
      <Flex align="center" className={styles.header} onClick={onClick}>
        {isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        <h3>{title}</h3>
      </Flex>

      {isOpen && <div className={styles.content}>{children}</div>}
    </div>
  )
}
