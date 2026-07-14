import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'

function App() {
  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome to Mission Manager
      </Typography>
      <Typography color="text.secondary">
        This is your starting point — start building your app here.
      </Typography>
    </Container>
  )
}

export default App
