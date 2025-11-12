import { Box, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { storage } from '../../utils/localStorage';
import UserRoleEnum from '../../enums/UserRoleEnum';

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = storage.getRole();

  const adminMenuItems = [
    { label: 'Usuários', path: '/admin/users' },
    { label: 'Turmas', path: '/admin/classes' },
  ];

  const teacherMenuItems = [
    { label: 'Turma', path: '/turmas' },
  ];

  const studentMenuItems = [
    { label: 'Turma', path: '/turmas' },
    { label: 'Notas', path: '/notas' },
    { label: 'Faltas', path: '/faltas' },
  ];

  const getMenuItems = () => {
    if (role === UserRoleEnum.DEV_ADMIN || role === UserRoleEnum.ADMIN) {
      return adminMenuItems;
    }
    if (role === UserRoleEnum.TEACHER) {
      return teacherMenuItems;
    }
    if (role === UserRoleEnum.STUDENT) {
      return studentMenuItems;
    }
    return [];
  };

  const menuItems = getMenuItems();

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

