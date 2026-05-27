import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TeamSidebar } from './TeamSidebar'

describe('TeamSidebar', () => {
  it('renders the empty-state copy when no roster is passed', () => {
    render(<TeamSidebar />)

    expect(screen.getByText('Your team')).toBeInTheDocument()
    expect(screen.getByText('0 / 5')).toBeInTheDocument()
    expect(screen.getByText(/No characters yet/i)).toBeInTheDocument()
  })

  it('renders provided roster children instead of the empty state', () => {
    render(
      <TeamSidebar count={2}>
        <div>Luke</div>
      </TeamSidebar>,
    )

    expect(screen.getByText('2 / 5')).toBeInTheDocument()
    expect(screen.getByText('Luke')).toBeInTheDocument()
  })
})
