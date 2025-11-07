import { AppBar, Toolbar, Typography, Box, Button } from '@mui/material';
import { Logout as LogoutIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { storage } from '../../utils/localStorage';
import { LogoutConfirmationModal } from '../LogoutConfirmationModal/LogoutConfirmationModal';
import { UserUpdateModal } from '../UserUpdateModal/UserUpdateModal';
import { useState, useEffect } from 'react';

export const Header = () => {
  const navigate = useNavigate();
  const [openLogoutModal, setOpenLogoutModal] = useState(false);
  const [openUserUpdateModal, setOpenUserUpdateModal] = useState(false);
  const [name, setName] = useState(() => storage.getName() || '');
  const [register, setRegister] = useState(() => storage.getRegister() || '');

  useEffect(() => {
    const updateUserInfo = () => {
      setName(storage.getName() || '');
      setRegister(storage.getRegister() || '');
    };

    if (!openUserUpdateModal) {
      updateUserInfo();
    }
  }, [openUserUpdateModal]);

  const handleLogoutClick = () => {
    setOpenLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    storage.clearAuthData();
    navigate('/');
  };

  const handleNameClick = () => {
    setOpenUserUpdateModal(true);
  };

  const handleUserUpdateSuccess = () => {
    setOpenUserUpdateModal(false);
  };

  return (
    <>
      <AppBar
        position="static"
        sx={{
          boxShadow: 2,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <Typography
              variant="body1"
              fontWeight="bold"
              sx={{
                lineHeight: 1.2,
                cursor: 'pointer',
                '&:hover': {
                  textDecoration: 'underline',
                  opacity: 0.8,
                },
                transition: 'opacity 0.2s',
              }}
              onClick={handleNameClick}
            >
              {name}
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.2, opacity: 0.9 }}>
              {register}
            </Typography>
          </Box>

          <Typography
            variant="h5"
            component="div"
            sx={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              fontWeight: 'bold',
            }}
          >
            SISGES
          </Typography>

          <Button
            color="inherit"
            onClick={handleLogoutClick}
            startIcon={<LogoutIcon />}
            sx={{
              textTransform: 'none',
              fontWeight: 500,
            }}
          >
            Sair
          </Button>
        </Toolbar>
      </AppBar>

      <LogoutConfirmationModal
        open={openLogoutModal}
        onClose={() => setOpenLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
      />

      <UserUpdateModal
        open={openUserUpdateModal}
        onClose={() => setOpenUserUpdateModal(false)}
        onSuccess={handleUserUpdateSuccess}
      />
    </>
  );
};
