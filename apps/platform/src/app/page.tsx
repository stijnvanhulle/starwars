'use client'

import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { StatePanel } from '@stijnvanhulle/components'
import { useListCharactersQuery } from '@/store/api'

export default function HomePage() {
  const { data, isLoading, isError, error } = useListCharactersQuery()

  if (isLoading) {
    return (
      <Container>
        <StatePanel variant="loading" />
      </Container>
    )
  }

  if (isError) {
    return (
      <Container>
        <StatePanel variant="error" description={(error as { message?: string } | undefined)?.message ?? 'Request failed.'} />
      </Container>
    )
  }

  return (
    <Container>
      <Typography variant="h3" component="h1" gutterBottom>
        Whale Star Wars Team Builder
      </Typography>
      <Typography variant="body1">{data?.length ?? 0} characters</Typography>
    </Container>
  )
}
