import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';

interface LogoutConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const LogoutConfirmationModal = ({
  open,
  onClose,
  onConfirm,
}: LogoutConfirmationModalProps) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="logout-dialog-title"
      aria-describedby="logout-dialog-description"
    >
      <DialogTitle id="logout-dialog-title">Confirmar saída</DialogTitle>
      <DialogContent>
        <DialogContentText id="logout-dialog-description">
          Tem certeza que deseja sair do sistema?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        <Button onClick={handleConfirm} color="error" variant="contained" autoFocus>
          Sair
        </Button>
      </DialogActions>
    </Dialog>
  );
};

