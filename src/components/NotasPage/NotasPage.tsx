import { Box, Typography, Card, CardContent } from '@mui/material';
import { Layout } from '../Layout/Layout';

export const NotasPage = () => {
  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Card>
          <CardContent>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
              Notas
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Página de notas - Em desenvolvimento
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Layout>
  );
};

