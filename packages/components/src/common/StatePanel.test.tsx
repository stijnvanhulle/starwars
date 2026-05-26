import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StatePanel } from './StatePanel'

describe('StatePanel', () => {
  it.each(['loading', 'empty', 'error'] as const)('renders the %s variant with distinct content', (variant) => {
    render(<StatePanel variant={variant} />)

    const panel = screen.getByRole('status')

    expect(panel.dataset.variant).toBe(variant)
  })

  it('uses the passed title/description and renders the action slot', () => {
    render(<StatePanel variant="empty" title="No team yet" description="Add characters from a detail page." action={<button type="button">Browse</button>} />)

    expect(screen.getByText('No team yet')).toBeInTheDocument()
    expect(screen.getByText('Add characters from a detail page.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Browse' })).toBeInTheDocument()
  })
})
