import { Box, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard' },
    // Future menu items will be added here
    { label: 'Turmas', path: '/turmas' },
    { label: 'Presenças', path: '/presencas' },
    { label: 'Notas', path: '/notas' },
    { label: 'Planejamento', path: '/planejamento' },
    { label: 'Mensagens', path: '/mensagens' },
    { label: 'Configurações', path: '/configuracoes' },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <Box
      component="aside"
      sx={{
        width: 250,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: (theme) =>
          theme.palette.mode === 'dark' ? 'background.paper' : 'grey.300',
        borderRight: (theme) =>
          `1px solid ${theme.palette.mode === 'dark' ? theme.palette.divider : theme.palette.grey[300]}`,
        boxShadow: 1,
        overflow: 'hidden',
      }}
    >

      <Box component="nav" sx={{ flex: 1, pt: 2 }}>
        <List sx={{ px: 1 }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  selected={isActive}
                  sx={{
                    borderRadius: 1,
                    '&.Mui-selected': {
                      backgroundColor: (theme) =>
                        theme.palette.mode === 'dark'
                          ? 'primary.dark'
                          : 'primary.light',
                      color: (theme) =>
                        theme.palette.mode === 'dark'
                          ? 'primary.contrastText'
                          : 'primary.main',
                      '&:hover': {
                        backgroundColor: (theme) =>
                          theme.palette.mode === 'dark'
                            ? 'primary.dark'
                            : 'primary.light',
                      },
                    },
                    '&:hover': {
                      backgroundColor: (theme) =>
                        theme.palette.mode === 'dark'
                          ? 'action.hover'
                          : 'action.selected',
                    },
                  }}
                >
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontWeight: isActive ? 600 : 400,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Box>
  );
};

