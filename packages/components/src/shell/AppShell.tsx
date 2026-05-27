import Box from '@mui/material/Box'
import type { ReactNode } from 'react'
import styles from './AppShell.module.css'

export type AppShellProps = {
  topBar: ReactNode
  sidebar: ReactNode
  rightPane?: ReactNode
  children: ReactNode
}

export function AppShell({ topBar, sidebar, rightPane, children }: AppShellProps) {
  const withRight = rightPane !== undefined
  const shellClass = `${styles.shell} ${withRight ? styles['shell-withRight'] : ''}`.trim()
  return (
    <Box className={shellClass}>
      <Box component="aside" className={styles.sidebar}>
        {sidebar}
      </Box>
      <Box className={styles.main}>
        <Box component="header" className={styles.topbar}>
          {topBar}
        </Box>
        <Box component="main" className={styles.content}>
          {children}
        </Box>
      </Box>
      {withRight && (
        <Box component="aside" className={styles.rightPane}>
          {rightPane}
        </Box>
      )}
    </Box>
  )
}
