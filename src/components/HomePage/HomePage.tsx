import { Box, Container } from '@mui/material';
import { Header } from '../Header/Header';

export const HomePage = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Container maxWidth="lg" sx={{ flex: 1, py: 4 }}>
      </Container>
    </Box>
  );
};
