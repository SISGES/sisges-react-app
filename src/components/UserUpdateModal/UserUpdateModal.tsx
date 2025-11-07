import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
} from '@mui/material';
import { authService } from '../../services/authService';
import { storage } from '../../utils/localStorage';
import { useToast } from '../../contexts/ToastContext';
import type { UpdateUserRequest } from '../../types/auth';

interface UserUpdateModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const GENDER_OPTIONS = [
  { value: 'M' as const, label: 'Masculino' },
  { value: 'F' as const, label: 'Feminino' },
  { value: 'O' as const, label: 'Outro' },
];

export const UserUpdateModal = ({ open, onClose, onSuccess }: UserUpdateModalProps) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showCloseWarning, setShowCloseWarning] = useState(false);
  const [formData, setFormData] = useState<Partial<UpdateUserRequest>>({
    name: '',
    password: '',
    birthDate: '',
    gender: undefined,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof UpdateUserRequest, string>>>({});

  useEffect(() => {
    if (open) {
      const currentName = storage.getName() || '';
      setFormData({
        name: currentName,
        password: '',
        birthDate: '',
        gender: undefined,
      });
      setErrors({});
      setShowCloseWarning(false);
    }
  }, [open]);

  const hasChanges = () => {
    const currentName = storage.getName() || '';
    return (
      (formData.name && formData.name.trim() !== currentName) ||
      (formData.password && formData.password.trim() !== '') ||
      (formData.birthDate && formData.birthDate !== '') ||
      formData.gender !== undefined
    );
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof UpdateUserRequest, string>> = {};

    if (formData.password && formData.password.trim() && formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    if (formData.birthDate) {
      const birthDate = new Date(formData.birthDate);
      const today = new Date();
      if (birthDate > today) {
        newErrors.birthDate = 'Data de nascimento não pode ser no futuro';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof UpdateUserRequest) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const buildRequestData = (): UpdateUserRequest | null => {
    const requestData: Partial<UpdateUserRequest> = {};

    if (formData.name && formData.name.trim()) {
      requestData.name = formData.name.trim();
    }
    if (formData.password && formData.password.trim()) {
      requestData.password = formData.password.trim();
    }
    if (formData.birthDate) {
      requestData.birthDate = formData.birthDate;
    }
    if (formData.gender) {
      requestData.gender = formData.gender;
    }

    if (Object.keys(requestData).length === 0) {
      return null;
    }

    const currentName = storage.getName() || '';
    return {
      name: requestData.name || currentName,
      password: requestData.password || '',
      birthDate: requestData.birthDate || '',
      gender: requestData.gender || 'M',
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    const requestData = buildRequestData();
    if (!requestData) {
      showToast('Preencha pelo menos um campo para atualizar', 'warning');
      return;
    }

    setLoading(true);

    try {
      const userId = storage.getUserId();
      if (!userId) {
        showToast('Erro: ID do usuário não encontrado', 'error');
        setLoading(false);
        return;
      }

      await authService.updateUser(userId, requestData);
      showToast('Dados atualizados com sucesso!', 'success');
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('Update user error:', err);
      showToast(
        err.response?.data?.message || 'Erro ao atualizar dados. Tente novamente.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCloseAttempt = () => {
    if (hasChanges()) {
      setShowCloseWarning(true);
    } else {
      onClose();
    }
  };

  const handleCloseConfirm = () => {
    setShowCloseWarning(false);
    onClose();
  };

  const handleCloseCancel = () => {
    setShowCloseWarning(false);
  };

  return (
    <>
      <Dialog
        open={open && !showCloseWarning}
        onClose={handleCloseAttempt}
        maxWidth="sm"
        fullWidth
        aria-labelledby="user-update-dialog-title"
      >
        <form 
          onSubmit={handleSubmit} 
          autoComplete="off"
          data-form-type="other"
          noValidate
        >
          <input
            type="text"
            name="username"
            id="username-hidden"
            autoComplete="username"
            value=""
            readOnly
            style={{ 
              position: 'absolute', 
              left: '-9999px', 
              width: '1px', 
              height: '1px', 
              opacity: 0,
              pointerEvents: 'none',
              visibility: 'hidden'
            }}
            tabIndex={-1}
            aria-hidden="true"
          />
          <DialogTitle id="user-update-dialog-title">Atualizar Dados do Usuário</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField
                label="Nome"
                fullWidth
                name="name"
                id="name-field"
                value={formData.name || ''}
                onChange={handleChange('name')}
                error={!!errors.name}
                helperText={errors.name}
                disabled={loading}
                autoFocus
                autoComplete="off"
              />

              <TextField
                label="Senha"
                type="password"
                fullWidth
                name="password"
                id="password-field"
                value={formData.password || ''}
                onChange={handleChange('password')}
                error={!!errors.password}
                helperText={errors.password}
                disabled={loading}
                autoComplete="new-password"
                data-form-type="other"
              />

              <TextField
                label="Data de Nascimento"
                type="date"
                fullWidth
                name="birthDate"
                value={formData.birthDate || ''}
                onChange={handleChange('birthDate')}
                error={!!errors.birthDate}
                helperText={errors.birthDate}
                disabled={loading}
                autoComplete="bday"
                InputLabelProps={{
                  shrink: true,
                }}
              />

              <TextField
                label="Gênero"
                select
                fullWidth
                name="gender"
                value={formData.gender || ''}
                onChange={handleChange('gender')}
                disabled={loading}
                autoComplete="sex"
              >
                <MenuItem value="">
                  <em>Nenhum</em>
                </MenuItem>
                {GENDER_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleCloseAttempt} disabled={loading} color="inherit">
              Cancelar
            </Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog
        open={showCloseWarning}
        onClose={handleCloseCancel}
        aria-labelledby="close-warning-dialog-title"
      >
        <DialogTitle id="close-warning-dialog-title">Descartar alterações?</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            Você tem alterações não salvas. Deseja realmente fechar e descartar as alterações?
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseCancel} color="inherit">
            Cancelar
          </Button>
          <Button onClick={handleCloseConfirm} color="error" variant="contained">
            Descartar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
