'use client'

import Button from '@mui/material/Button'
import Link from 'next/link'
import { StatePanel } from '@whale/components'

export default function CharacterNotFound() {
  return (
    <StatePanel
      variant="empty"
      title="Character not found"
      description="That character id doesn't exist."
      action={
        <Button component={Link} href="/characters" variant="contained">
          Back to characters
        </Button>
      }
    />
  )
}
