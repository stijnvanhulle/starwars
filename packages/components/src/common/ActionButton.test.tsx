import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { ActionButton } from './ActionButton'

describe('ActionButton', () => {
  it('renders the label by default and stays enabled', () => {
    render(<ActionButton>Add to team</ActionButton>)

    expect(screen.getByRole('button', { name: 'Add to team' })).toBeEnabled()
  })

  it('is disabled and surfaces a tooltip when disabledReason is set', async () => {
    render(<ActionButton disabledReason="Vader is on the dark side and can't join.">Add to team</ActionButton>)

    const button = screen.getByRole('button', { name: 'Add to team' })

    expect(button).toBeDisabled()

    await userEvent.hover(button.parentElement as HTMLElement)
    await waitFor(() => expect(screen.getByRole('tooltip')).toHaveTextContent("Vader is on the dark side and can't join."))
  })

  it('disables the button while loading', () => {
    render(<ActionButton loading>Add to team</ActionButton>)

    expect(screen.getByRole('button')).toBeDisabled()
  })
})
