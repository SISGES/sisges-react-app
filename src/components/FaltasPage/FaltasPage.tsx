import { Box, Typography, Card, CardContent } from '@mui/material';
import { Layout } from '../Layout/Layout';

export const FaltasPage = () => {
  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Card>
          <CardContent>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
              Faltas
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Página de faltas - Em desenvolvimento
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Layout>
  );
};

