import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Divider,
  Pagination,
} from '@mui/material';
import { Add, Close, Visibility, PersonRemove, PersonAdd } from '@mui/icons-material';
import { Layout } from '../Layout/Layout';
import { classService } from '../../services/classService';
import { userService } from '../../services/userService';
import type { SchoolClassResponse, CreateClassRequest, DetailedSchoolClassResponse, TeacherResponse, StudentResponse } from '../../types/class';
import type { User } from '../../types/user';
import { useToast } from '../../contexts/ToastContext';

export const ClassesManagementPanel = () => {
  const [classes, setClasses] = useState<SchoolClassResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [size] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [openLinkTeacherDialog, setOpenLinkTeacherDialog] = useState(false);
  const [openLinkStudentDialog, setOpenLinkStudentDialog] = useState(false);
  const [openConfirmStudentDialog, setOpenConfirmStudentDialog] = useState(false);
  const [selectedClass, setSelectedClass] = useState<SchoolClassResponse | null>(null);
  const [classDetail, setClassDetail] = useState<DetailedSchoolClassResponse | null>(null);
  const [availableTeachers, setAvailableTeachers] = useState<TeacherResponse[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [availableStudents, setAvailableStudents] = useState<User[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | ''>('');
  const [selectedStudentId, setSelectedStudentId] = useState<number | ''>('');
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [studentToLink, setStudentToLink] = useState<{ studentId: number; currentClass: SchoolClassResponse | null } | null>(null);
  const [createForm, setCreateForm] = useState<CreateClassRequest>({ name: '' });
  const { showToast } = useToast();

  useEffect(() => {
    fetchClasses();
    fetchStudents();
  }, [page]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await classService.searchClasses({
        page,
        size,
      });
      setClasses(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (error: any) {
      showToast(
        error.response?.data?.message || 'Erro ao carregar turmas',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableTeachers = async (): Promise<TeacherResponse[]> => {
    try {
      setLoadingTeachers(true);
      const response = await userService.searchTeachers({
        page: 0,
        size: 100, // Aumentado para garantir que todos os professores sejam retornados
      });
      const teachers = response.content || [];
      setAvailableTeachers(teachers);
      return teachers;
    } catch (error: any) {
      showToast(
        error.response?.data?.message || 'Erro ao carregar professores',
        'error'
      );
      return [];
    } finally {
      setLoadingTeachers(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const data = await userService.getAllStudents();
      setStudents(data);
    } catch (error: any) {
      showToast(
        error.response?.data?.message || 'Erro ao carregar estudantes',
        'error'
      );
    }
  };

  const fetchClassDetail = async (classId: number) => {
    try {
      const data = await classService.getClassById(classId);
      setClassDetail(data);
      return data;
    } catch (error: any) {
      showToast(
        error.response?.data?.message || 'Erro ao carregar detalhes da turma',
        'error'
      );
      return null;
    }
  };

  const handleCreateClass = async () => {
    try {
      if (!createForm.name.trim()) {
        showToast('Nome da turma é obrigatório', 'error');
        return;
      }

      await classService.createClass(createForm);
      showToast('Turma criada com sucesso!', 'success');
      setOpenCreateDialog(false);
      setCreateForm({ name: '' });
      fetchClasses();
    } catch (error: any) {
      showToast(
        error.response?.data?.message || 'Erro ao criar turma',
        'error'
      );
    }
  };

  const handleViewDetail = async (classItem: SchoolClassResponse) => {
    const detail = await fetchClassDetail(classItem.id);
    if (detail) {
      setSelectedClass(classItem);
      setOpenDetailDialog(true);
    }
  };

  const handleOpenLinkTeacher = async (classItem: SchoolClassResponse) => {
    const detail = await fetchClassDetail(classItem.id);
    if (detail) {
      setClassDetail(detail);
      setSelectedClass(classItem);
      setSelectedTeacherId('');
      const allTeachers = await fetchAvailableTeachers();
      const linkedTeacherIds = new Set(detail.teachers.map(t => t.id));
      const available = allTeachers.filter(t => !linkedTeacherIds.has(t.id));
      console.log('All teachers:', allTeachers);
      console.log('Linked teacher IDs:', Array.from(linkedTeacherIds));
      console.log('Available teachers:', available);
      setAvailableTeachers(available);
      setOpenLinkTeacherDialog(true);
    }
  };

  const handleOpenLinkStudent = async (classItem: SchoolClassResponse) => {
    const detail = await fetchClassDetail(classItem.id);
    if (detail) {
      setClassDetail(detail);
      const linkedStudentIds = new Set(detail.students.map(s => s.id));
      const available = students.filter(s => !linkedStudentIds.has(s.id));
      setAvailableStudents(available);
      setSelectedClass(classItem);
      setSelectedStudentId('');
      setOpenLinkStudentDialog(true);
    }
  };

  const handleLinkTeacher = async () => {
    if (!selectedClass || !selectedTeacherId) return;

    try {
      const updatedClass = await classService.linkTeacherToClass(selectedClass.id, selectedTeacherId as number);
      showToast('Professor vinculado com sucesso!', 'success');
      setOpenLinkTeacherDialog(false);
      setSelectedTeacherId('');
      const updatedDetail = await fetchClassDetail(selectedClass.id);
      if (updatedDetail) {
        setClassDetail(updatedDetail);
      }
      fetchClasses();
      setSelectedClass(updatedClass);
    } catch (error: any) {
      showToast(
        error.response?.data?.message || 'Erro ao vincular professor',
        'error'
      );
    }
  };

  const handleUnlinkTeacher = async (teacherId: number) => {
    if (!selectedClass) return;

    try {
      await classService.unlinkTeacherFromClass(selectedClass.id, teacherId);
      showToast('Professor desvinculado com sucesso!', 'success');
      const updatedDetail = await fetchClassDetail(selectedClass.id);
      if (updatedDetail) {
        setClassDetail(updatedDetail);
      }
      fetchClasses();
    } catch (error: any) {
      showToast(
        error.response?.data?.message || 'Erro ao desvincular professor',
        'error'
      );
    }
  };

  const handleLinkStudentClick = async () => {
    if (!selectedClass || !selectedStudentId) return;

    try {
      const currentClass = await classService.getStudentCurrentClass(selectedStudentId as number);
      
      if (currentClass && currentClass.id !== selectedClass.id) {
        setStudentToLink({
          studentId: selectedStudentId as number,
          currentClass: currentClass
        });
        setOpenLinkStudentDialog(false);
        setOpenConfirmStudentDialog(true);
      } else {
        await linkStudentToClass(selectedStudentId as number);
      }
    } catch (error: any) {
      showToast(
        error.response?.data?.message || 'Erro ao verificar turma do estudante',
        'error'
      );
    }
  };

  const linkStudentToClass = async (studentId: number) => {
    if (!selectedClass) return;

    try {
      await classService.linkStudentToClass(selectedClass.id, studentId);
      showToast('Estudante vinculado com sucesso!', 'success');
      setOpenLinkStudentDialog(false);
      setOpenConfirmStudentDialog(false);
      setSelectedStudentId('');
      setStudentToLink(null);
      const updatedDetail = await fetchClassDetail(selectedClass.id);
      if (updatedDetail) {
        setClassDetail(updatedDetail);
      }
      fetchClasses();
      fetchStudents();
    } catch (error: any) {
      showToast(
        error.response?.data?.message || 'Erro ao vincular estudante',
        'error'
      );
    }
  };

  const handleUnlinkStudent = async (studentId: number) => {
    if (!selectedClass) return;

    try {
      await classService.unlinkStudentFromClass(selectedClass.id, studentId);
      showToast('Estudante desvinculado com sucesso!', 'success');
      const updatedDetail = await fetchClassDetail(selectedClass.id);
      if (updatedDetail) {
        setClassDetail(updatedDetail);
      }
      fetchClasses();
    } catch (error: any) {
      showToast(
        error.response?.data?.message || 'Erro ao desvincular estudante',
        'error'
      );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Gerenciamento de Turmas
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenCreateDialog(true)}
          >
            Nova Turma
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
            <CircularProgress />
          </Box>
        ) : classes.length === 0 ? (
          <Card>
            <CardContent>
              <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center' }}>
                Nenhuma turma encontrada
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
              },
              gap: 3,
            }}
          >
            {classes.map((classItem) => (
              <Card
                key={classItem.id}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
                onClick={() => handleViewDetail(classItem)}
              >
                <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                    {classItem.name}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Estudantes:
                      </Typography>
                      <Chip label={classItem.studentCount} size="small" color="primary" />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Criada em:
                      </Typography>
                      <Typography variant="body2">
                        {formatDate(classItem.createdAt)}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Visibility />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetail(classItem);
                      }}
                    >
                      Ver Detalhes
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

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
          Total: {totalElements} turma(s)
        </Typography>

        <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            Criar Nova Turma
            <IconButton
              onClick={() => setOpenCreateDialog(false)}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField
                fullWidth
                label="Nome da Turma"
                value={createForm.name}
                onChange={(e) => setCreateForm({ name: e.target.value })}
                required
                autoFocus
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCreateDialog(false)}>Cancelar</Button>
            <Button onClick={handleCreateClass} variant="contained">
              Criar
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={openDetailDialog} onClose={() => setOpenDetailDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            Detalhes da Turma: {classDetail?.name || selectedClass?.name}
            <IconButton
              onClick={() => setOpenDetailDialog(false)}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            {classDetail && (
              <Box sx={{ pt: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Professores</Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<PersonAdd />}
                    onClick={() => handleOpenLinkTeacher(selectedClass!)}
                  >
                    Adicionar Professor
                  </Button>
                </Box>
                {classDetail.teachers.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Nenhum professor vinculado
                  </Typography>
                ) : (
                  <TableContainer component={Paper} sx={{ mb: 3 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Nome</TableCell>
                          <TableCell>Email</TableCell>
                          <TableCell align="right">Ações</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {classDetail.teachers.map((teacher) => (
                          <TableRow key={teacher.id}>
                            <TableCell>{teacher.name}</TableCell>
                            <TableCell>{teacher.email}</TableCell>
                            <TableCell align="right">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleUnlinkTeacher(teacher.id)}
                              >
                                <PersonRemove />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Estudantes</Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<PersonAdd />}
                    onClick={() => handleOpenLinkStudent(selectedClass!)}
                  >
                    Adicionar Estudante
                  </Button>
                </Box>
                {classDetail.students.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    Nenhum estudante vinculado
                  </Typography>
                ) : (
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Nome</TableCell>
                          <TableCell>Email</TableCell>
                          <TableCell>Matrícula</TableCell>
                          <TableCell align="right">Ações</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {classDetail.students.map((student) => (
                          <TableRow key={student.id}>
                            <TableCell>{student.name}</TableCell>
                            <TableCell>{student.email}</TableCell>
                            <TableCell>{student.register || '-'}</TableCell>
                            <TableCell align="right">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleUnlinkStudent(student.id)}
                              >
                                <PersonRemove />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDetailDialog(false)}>Fechar</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={openLinkTeacherDialog} onClose={() => setOpenLinkTeacherDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            Adicionar Professor à Turma
            <IconButton
              onClick={() => setOpenLinkTeacherDialog(false)}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField
                fullWidth
                select
                label="Professor"
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(Number(e.target.value))}
                SelectProps={{
                  native: true,
                }}
              >
                <option value="">Selecione um professor</option>
                {loadingTeachers ? (
                  <option value="">Carregando...</option>
                ) : (
                  availableTeachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name} - {teacher.email}
                    </option>
                  ))
                )}
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenLinkTeacherDialog(false)}>Cancelar</Button>
            <Button
              onClick={handleLinkTeacher}
              variant="contained"
              disabled={!selectedTeacherId}
            >
              Adicionar
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={openLinkStudentDialog} onClose={() => setOpenLinkStudentDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            Adicionar Estudante à Turma
            <IconButton
              onClick={() => setOpenLinkStudentDialog(false)}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField
                fullWidth
                select
                label="Estudante"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(Number(e.target.value))}
                SelectProps={{
                  native: true,
                }}
              >
                <option value="">Selecione um estudante</option>
                {availableStudents.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} - {student.email}
                  </option>
                ))}
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenLinkStudentDialog(false)}>Cancelar</Button>
            <Button
              onClick={handleLinkStudentClick}
              variant="contained"
              disabled={!selectedStudentId}
            >
              Adicionar
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={openConfirmStudentDialog} onClose={() => setOpenConfirmStudentDialog(false)}>
          <DialogTitle>
            Confirmar Mudança de Turma
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Este estudante já está vinculado à turma <strong>{studentToLink?.currentClass?.name}</strong>.
            </Typography>
            <Typography variant="body1">
              Ao continuar, o estudante será removido da turma atual e vinculado à nova turma <strong>{selectedClass?.name}</strong>.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setOpenConfirmStudentDialog(false);
              setOpenLinkStudentDialog(true);
              setStudentToLink(null);
            }}>
              Cancelar
            </Button>
            <Button
              onClick={() => studentToLink && linkStudentToClass(studentToLink.studentId)}
              variant="contained"
              color="warning"
            >
              Confirmar Mudança
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default ClassesManagementPanel;
