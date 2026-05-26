import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AppShell } from './AppShell'

describe('AppShell', () => {
  it('renders all three slots', () => {
    render(
      <AppShell topBar={<span>top</span>} sidebar={<span>side</span>}>
        <span>main</span>
      </AppShell>,
    )

    expect(screen.getByText('top')).toBeInTheDocument()
    expect(screen.getByText('side')).toBeInTheDocument()
    expect(screen.getByText('main')).toBeInTheDocument()
  })
})
