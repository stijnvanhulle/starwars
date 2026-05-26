import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { CharacterList } from '@/components/CharacterList'

export default function HomePage() {
  return (
    <Container>
      <Typography variant="h3" component="h1" gutterBottom>
        Whale Star Wars Team Builder
      </Typography>
      <CharacterList />
    </Container>
  )
}
