import { Box, Typography } from '@mui/material';
import { Layout } from '../Layout/Layout';

export const Dashboard = () => {
  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1">
          Dashboard
        </Typography>
      </Box>
    </Layout>
  );
};

