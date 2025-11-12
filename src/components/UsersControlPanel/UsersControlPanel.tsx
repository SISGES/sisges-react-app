import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Pagination,
  IconButton,
  Chip,
  CircularProgress,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import { Add, Edit, Visibility, Close } from '@mui/icons-material';
import { Layout } from '../Layout/Layout';
import { userService } from '../../services/userService';
import type { User, SearchUserRequest, RegisterUserRequest } from '../../types/user';
import type { UpdateUserRequest } from '../../types/auth';
import { useToast } from '../../contexts/ToastContext';

const ROLE_LABELS: Record<string | number, string> = {
  STUDENT: 'Estudante',
  TEACHER: 'Professor',
  ADMIN: 'Administrador',
  DEV_ADMIN: 'Dev Admin',
  0: 'Estudante',
  1: 'Professor',
  2: 'Administrador',
  3: 'Dev Admin',
};


const ROLE_OPTIONS = [
  { value: 0, label: 'Estudante' },
  { value: 1, label: 'Professor' },
  { value: 2, label: 'Administrador' },
  { value: 3, label: 'Dev Admin' },
];

const GENDER_OPTIONS = [
  { value: 'F', label: 'Feminino' },
  { value: 'M', label: 'Masculino' },
  { value: 'O', label: 'Outro' },
];

export const UsersControlPanel = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [size] = useState(20);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [filters, setFilters] = useState<SearchUserRequest>({});
  const [appliedFilters, setAppliedFilters] = useState<SearchUserRequest>({});
  const [initialBirthDateDisplay, setInitialBirthDateDisplay] = useState('');
  const [finalBirthDateDisplay, setFinalBirthDateDisplay] = useState('');
  const { showToast } = useToast();

  const [createForm, setCreateForm] = useState<RegisterUserRequest & { birthDateDisplay: string }>({
    name: '',
    email: '',
    password: '',
    birthDate: '',
    birthDateDisplay: '',
    gender: 'M',
    userRole: 0,
  });

  const [editForm, setEditForm] = useState<UpdateUserRequest & { birthDateDisplay: string }>({
    name: '',
    password: '',
    birthDate: '',
    birthDateDisplay: '',
    gender: 'M',
  });

  const [createDateTouched, setCreateDateTouched] = useState(false);
  const [editDateTouched, setEditDateTouched] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [page, appliedFilters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.searchUsers({
        ...appliedFilters,
        page,
        size,
      });
      setUsers(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (error: any) {
      showToast(
        error.response?.data?.message || 'Erro ao carregar usuários',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      if (!createForm.name.trim()) {
        showToast('Nome é obrigatório', 'error');
        return;
      }

      if (!createForm.email.trim()) {
        showToast('Email é obrigatório', 'error');
        return;
      }

      if (!createForm.password.trim()) {
        showToast('Senha é obrigatória', 'error');
        return;
      }

      if (!createForm.birthDateDisplay.trim()) {
        showToast('Data de nascimento é obrigatória', 'error');
        return;
      }

      if (!validateDate(createForm.birthDateDisplay)) {
        showToast('Data inválida. Use o formato dd/mm/yyyy', 'error');
        return;
      }

      if (!createForm.gender) {
        showToast('Gênero é obrigatório', 'error');
        return;
      }

      if (createForm.userRole === undefined || createForm.userRole === null) {
        showToast('Papel do usuário é obrigatório', 'error');
        return;
      }

      const formData: RegisterUserRequest = {
        ...createForm,
        birthDate: parseDateToBackend(createForm.birthDateDisplay),
      };
      delete (formData as any).birthDateDisplay;

      await userService.registerUser(formData);
      showToast('Usuário criado com sucesso!', 'success');
      setOpenCreateDialog(false);
      setCreateForm({
        name: '',
        email: '',
        password: '',
        birthDate: '',
        birthDateDisplay: '',
        gender: 'M',
        userRole: 0,
      });
      setCreateDateTouched(false);
      fetchUsers();
    } catch (error: any) {
      showToast(
        error.response?.data?.message || 'Erro ao criar usuário',
        'error'
      );
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    try {
      if (!editForm.name.trim()) {
        showToast('Nome é obrigatório', 'error');
        return;
      }

      if (!editForm.birthDateDisplay.trim()) {
        showToast('Data de nascimento é obrigatória', 'error');
        return;
      }

      if (!validateDate(editForm.birthDateDisplay)) {
        showToast('Data inválida. Use o formato dd/mm/yyyy', 'error');
        return;
      }

      if (!editForm.gender) {
        showToast('Gênero é obrigatório', 'error');
        return;
      }

      const formData: UpdateUserRequest = {
        name: editForm.name,
        password: editForm.password,
        birthDate: parseDateToBackend(editForm.birthDateDisplay),
        gender: editForm.gender,
      };

      await userService.updateUser(selectedUser.id.toString(), formData);
      showToast('Usuário atualizado com sucesso!', 'success');
      setOpenEditDialog(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error: any) {
      showToast(
        error.response?.data?.message || 'Erro ao atualizar usuário',
        'error'
      );
    }
  };

  const handleViewDetail = (user: User) => {
    setSelectedUser(user);
    setOpenDetailDialog(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      password: '',
      birthDate: '',
      birthDateDisplay: parseDateFromBackend(user.birthDate),
      gender: normalizeGenderToLetter(user.gender),
    });
    setEditDateTouched(false);
    setOpenEditDialog(true);
  };

  const handleFilterChange = (field: keyof SearchUserRequest, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value || undefined,
    }));
  };

  const handleSearch = () => {
    const searchFilters: SearchUserRequest = {};
    
    if (filters.name?.trim()) {
      searchFilters.name = filters.name.trim();
    }
    if (filters.email?.trim()) {
      searchFilters.email = filters.email.trim();
    }
    if (filters.register?.trim()) {
      searchFilters.register = filters.register.trim();
    }
    if (filters.gender) {
      searchFilters.gender = filters.gender;
    }
    if (filters.initialBirthDate) {
      searchFilters.initialBirthDate = filters.initialBirthDate;
    }
    if (filters.finalBirthDate) {
      searchFilters.finalBirthDate = filters.finalBirthDate;
    }
    
    setAppliedFilters(searchFilters);
    setPage(0);
  };

  const handleClearFilters = () => {
    setFilters({});
    setAppliedFilters({});
    setInitialBirthDateDisplay('');
    setFinalBirthDateDisplay('');
    setPage(0);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const parseDateToBackend = (dateStr: string): string => {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const day = parts[0].padStart(2, '0');
      const month = parts[1].padStart(2, '0');
      const year = parts[2];
      return `${year}-${month}-${day}`;
    }
    return dateStr;
  };

  const parseDateFromBackend = (dateStr: string): string => {
    if (!dateStr) return '';
    if (dateStr.includes('/')) {
      return dateStr;
    }
    const parts = dateStr.split('T')[0].split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatDateInput = (value: string): string => {
    let cleaned = value.replace(/\D/g, '');
    if (cleaned.length > 8) cleaned = cleaned.slice(0, 8);
    
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 4) return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4)}`;
  };

  const isDateComplete = (dateStr: string): boolean => {
    return dateStr.length === 10 && dateStr.split('/').length === 3;
  };

  const validateDate = (dateStr: string): boolean => {
    if (!isDateComplete(dateStr)) return false;
    const parts = dateStr.split('/');
    if (parts.length !== 3) return false;
    if (parts[0].length !== 2 || parts[1].length !== 2 || parts[2].length !== 4) return false;
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    if (isNaN(day) || isNaN(month) || isNaN(year)) return false;
    if (day < 1 || day > 31) return false;
    if (month < 1 || month > 12) return false;
    if (year < 1900 || year > 2100) return false;
    const date = new Date(year, month - 1, day);
    if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
      return false;
    }
    return true;
  };

  const getRoleLabel = (userRole: string | undefined) => {
    if (!userRole) return 'N/A';
    return ROLE_LABELS[userRole] || userRole;
  };

  const getRoleColor = (userRole: string | undefined) => {
    if (!userRole) return 'default';
    switch (userRole) {
      case 'DEV_ADMIN':
        return 'error';
      case 'ADMIN':
        return 'warning';
      case 'TEACHER':
        return 'primary';
      case 'STUDENT':
        return 'success';
      default:
        return 'default';
    }
  };

  const normalizeGenderToLetter = (gender: string): 'M' | 'F' | 'O' => {
    const genderUpper = gender.toUpperCase().trim();
    if (genderUpper === 'M' || genderUpper === 'MASCULINO' || genderUpper.startsWith('M')) {
      return 'M';
    }
    if (genderUpper === 'F' || genderUpper === 'FEMININO' || genderUpper.startsWith('F')) {
      return 'F';
    }
    if (genderUpper === 'O' || genderUpper === 'OUTRO' || genderUpper.startsWith('O')) {
      return 'O';
    }
    return 'M';
  };

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Painel de Controle - Usuários
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenCreateDialog(true)}
          >
            Novo Usuário
          </Button>
        </Box>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Filtros
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                },
                gap: 2,
              }}
            >
              <TextField
                fullWidth
                label="Nome"
                value={filters.name || ''}
                onChange={(e) => handleFilterChange('name', e.target.value)}
                size="small"
              />
              <TextField
                fullWidth
                label="Email"
                value={filters.email || ''}
                onChange={(e) => handleFilterChange('email', e.target.value)}
                size="small"
              />
              <TextField
                fullWidth
                label="Matrícula"
                value={filters.register || ''}
                onChange={(e) => handleFilterChange('register', e.target.value)}
                size="small"
              />
              <TextField
                fullWidth
                select
                label="Gênero"
                value={filters.gender || ''}
                onChange={(e) => handleFilterChange('gender', e.target.value)}
                size="small"
              >
                <MenuItem value="">Todos</MenuItem>
                {GENDER_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                label="Data Nasc. Inicial (dd/mm/yyyy)"
                value={initialBirthDateDisplay}
                onChange={(e) => {
                  const formatted = formatDateInput(e.target.value);
                  setInitialBirthDateDisplay(formatted);
                }}
                onBlur={() => {
                  if (initialBirthDateDisplay) {
                    if (validateDate(initialBirthDateDisplay)) {
                      handleFilterChange('initialBirthDate', parseDateToBackend(initialBirthDateDisplay));
                    } else {
                      setInitialBirthDateDisplay('');
                      handleFilterChange('initialBirthDate', undefined);
                    }
                  } else {
                    handleFilterChange('initialBirthDate', undefined);
                  }
                }}
                placeholder="dd/mm/yyyy"
                inputProps={{ maxLength: 10 }}
                size="small"
              />
              <TextField
                fullWidth
                label="Data Nasc. Final (dd/mm/yyyy)"
                value={finalBirthDateDisplay}
                onChange={(e) => {
                  const formatted = formatDateInput(e.target.value);
                  setFinalBirthDateDisplay(formatted);
                }}
                onBlur={() => {
                  if (finalBirthDateDisplay) {
                    if (validateDate(finalBirthDateDisplay)) {
                      handleFilterChange('finalBirthDate', parseDateToBackend(finalBirthDateDisplay));
                    } else {
                      setFinalBirthDateDisplay('');
                      handleFilterChange('finalBirthDate', undefined);
                    }
                  } else {
                    handleFilterChange('finalBirthDate', undefined);
                  }
                }}
                placeholder="dd/mm/yyyy"
                inputProps={{ maxLength: 10 }}
                size="small"
              />
              <Button
                fullWidth
                variant="contained"
                onClick={handleSearch}
                sx={{ height: '40px' }}
              >
                Buscar
              </Button>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleClearFilters}
                sx={{ height: '40px' }}
              >
                Limpar
              </Button>
            </Box>
          </CardContent>
        </Card>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nome</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Papel</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={getRoleLabel(user.userRole)}
                          color={getRoleColor(user.userRole) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetail(user)}
                          color="primary"
                        >
                          <Visibility />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(user)}
                          color="primary"
                        >
                          <Edit />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination
                  count={totalPages}
                  page={page + 1}
                  onChange={(_, value) => setPage(value - 1)}
                  color="primary"
                />
              </Box>
            )}

            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
              Total: {totalElements} usuário(s)
            </Typography>
          </>
        )}

        <Dialog open={openCreateDialog} onClose={() => {
          setOpenCreateDialog(false);
          setCreateDateTouched(false);
        }} maxWidth="sm" fullWidth>
          <DialogTitle>
            Criar Novo Usuário
            <IconButton
              onClick={() => {
                setOpenCreateDialog(false);
                setCreateDateTouched(false);
              }}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField
                fullWidth
                label="Nome"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                required
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                required
              />
              <TextField
                fullWidth
                label="Senha"
                type="password"
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                required
              />
              <TextField
                fullWidth
                label="Data de Nascimento (dd/mm/yyyy)"
                value={createForm.birthDateDisplay}
                onChange={(e) => {
                  const formatted = formatDateInput(e.target.value);
                  setCreateForm({ ...createForm, birthDateDisplay: formatted });
                }}
                onBlur={() => setCreateDateTouched(true)}
                placeholder="dd/mm/yyyy"
                inputProps={{ maxLength: 10 }}
                required
                error={createDateTouched && isDateComplete(createForm.birthDateDisplay) && !validateDate(createForm.birthDateDisplay)}
                helperText={createDateTouched && isDateComplete(createForm.birthDateDisplay) && !validateDate(createForm.birthDateDisplay) ? 'Formato inválido. Use dd/mm/yyyy' : ''}
              />
              <TextField
                fullWidth
                select
                label="Gênero"
                value={createForm.gender}
                onChange={(e) => setCreateForm({ ...createForm, gender: e.target.value as 'F' | 'M' | 'O' })}
                required
              >
                {GENDER_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                select
                label="Papel"
                value={createForm.userRole}
                onChange={(e) => setCreateForm({ ...createForm, userRole: Number(e.target.value) })}
                required
              >
                {ROLE_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setOpenCreateDialog(false);
              setCreateDateTouched(false);
            }}>Cancelar</Button>
            <Button onClick={handleCreateUser} variant="contained">
              Criar
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={openEditDialog} onClose={() => {
          setOpenEditDialog(false);
          setEditDateTouched(false);
        }} maxWidth="sm" fullWidth>
          <DialogTitle>
            Editar Usuário
            <IconButton
              onClick={() => {
                setOpenEditDialog(false);
                setEditDateTouched(false);
              }}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField
                fullWidth
                label="Nome"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                required
              />
              <TextField
                fullWidth
                label="Senha"
                type="password"
                value={editForm.password}
                onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                helperText="Deixe em branco para manter a senha atual"
              />
              <TextField
                fullWidth
                label="Data de Nascimento (dd/mm/yyyy)"
                value={editForm.birthDateDisplay}
                onChange={(e) => {
                  const formatted = formatDateInput(e.target.value);
                  setEditForm({ ...editForm, birthDateDisplay: formatted });
                }}
                onBlur={() => setEditDateTouched(true)}
                placeholder="dd/mm/yyyy"
                inputProps={{ maxLength: 10 }}
                required
                error={editDateTouched && isDateComplete(editForm.birthDateDisplay) && !validateDate(editForm.birthDateDisplay)}
                helperText={editDateTouched && isDateComplete(editForm.birthDateDisplay) && !validateDate(editForm.birthDateDisplay) ? 'Formato inválido. Use dd/mm/yyyy' : ''}
              />
              <TextField
                fullWidth
                select
                label="Gênero"
                value={editForm.gender}
                onChange={(e) => setEditForm({ ...editForm, gender: e.target.value as 'M' | 'F' | 'O' })}
                required
              >
                {GENDER_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setOpenEditDialog(false);
              setEditDateTouched(false);
            }}>Cancelar</Button>
            <Button onClick={handleUpdateUser} variant="contained">
              Salvar
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={openDetailDialog} onClose={() => setOpenDetailDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            Detalhes do Usuário
            <IconButton
              onClick={() => setOpenDetailDialog(false)}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            {selectedUser && (
              <Box sx={{ pt: 1 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Nome
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {selectedUser.name}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {selectedUser.email}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                      gap: 2,
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Matrícula
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {selectedUser.register || 'N/A'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Papel
                      </Typography>
                      <Box sx={{ mt: 0.5 }}>
                        <Chip
                          label={getRoleLabel(selectedUser.userRole)}
                          color={getRoleColor(selectedUser.userRole) as any}
                          size="small"
                        />
                      </Box>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Gênero
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {GENDER_OPTIONS.find((g) => g.value === normalizeGenderToLetter(selectedUser.gender))?.label || selectedUser.gender}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Data de Nascimento
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {formatDate(selectedUser.birthDate)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDetailDialog(false)}>Fechar</Button>
            {selectedUser && (
              <Button onClick={() => {
                setOpenDetailDialog(false);
                handleEdit(selectedUser);
              }} variant="contained">
                Editar
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
};

