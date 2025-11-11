import { Box } from '@mui/material';
import { Header } from '../Header/Header';
import { Sidebar } from '../Sidebar/Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Header />
      <Box sx={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <Sidebar />
        <Box
          component="main"
          sx={{
            flex: 1,
            overflow: 'auto',
            backgroundColor: 'background.default',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

