import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TeamMemberRow } from './TeamMemberRow'

describe('TeamMemberRow', () => {
  it('renders the name and fires onRemove', async () => {
    const onRemove = vi.fn()

    render(<TeamMemberRow name="Leia Organa" onRemove={onRemove} />)

    expect(screen.getByText('Leia Organa')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Remove Leia Organa' }))

    expect(onRemove).toHaveBeenCalledOnce()
  })
})
