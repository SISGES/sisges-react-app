import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import { Groups, School, Person } from '@mui/icons-material';
import { Layout } from '../Layout/Layout';
import { storage } from '../../utils/localStorage';
import { classService } from '../../services/classService';
import UserRoleEnum from '../../enums/UserRoleEnum';
import type { SchoolClassSimpleResponse, SchoolClassResponse } from '../../types/class';
import { useToast } from '../../contexts/ToastContext';

export const ClassesPage = () => {
  const [classData, setClassData] = useState<SchoolClassSimpleResponse | null>(null);
  const [teacherClasses, setTeacherClasses] = useState<SchoolClassResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const role = storage.getRole();

  useEffect(() => {
    const fetchClassData = async () => {
      if (!role) {
        setLoading(false);
        return;
      }

      try {
        if (role === UserRoleEnum.STUDENT) {
          const savedClassData = storage.getClassData();
          if (savedClassData) {
            try {
              const parsed = JSON.parse(savedClassData) as SchoolClassSimpleResponse;
              setClassData(parsed);
              setLoading(false);
              return;
            } catch (error) {
            }
          }

          const classId = storage.getStudentClassId();
          if (classId) {
            const data = await classService.findClassById(parseInt(classId, 10));
            setClassData(data);
            storage.setClassData(JSON.stringify(data));
          }
        } else if (role === UserRoleEnum.TEACHER) {
          const userId = storage.getUserId();
          if (userId) {
            const classes = await classService.getTeacherClassesByUserId(userId);
            setTeacherClasses(Array.isArray(classes) ? classes : []);
          }
        }
      } catch (error: any) {
        showToast(
          error.response?.data?.message || 'Erro ao carregar dados das turmas',
          'error'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchClassData();
  }, [role, showToast]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  if (!role) {
    return (
      <Layout>
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
            <CircularProgress />
          </Box>
        </Box>
      </Layout>
    );
  }

  if (role !== UserRoleEnum.STUDENT && role !== UserRoleEnum.TEACHER) {
    return (
      <Layout>
        <Box sx={{ p: 3 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Acesso não autorizado
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
            Esta página é apenas para estudantes e professores.
          </Typography>
        </Box>
      </Layout>
    );
  }

  if (role === UserRoleEnum.TEACHER) {
    return (
      <Layout>
        <Box sx={{ p: 3 }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, mb: 1 }}>
              Minhas Turmas
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Turmas que você leciona
            </Typography>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
              <CircularProgress />
            </Box>
          ) : teacherClasses.length > 0 ? (
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
              {teacherClasses.map((classItem) => (
                <Card
                  key={classItem.id}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}
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
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : (
            <Card>
              <CardContent>
                <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                  Você não está vinculado a nenhuma turma no momento
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, mb: 1 }}>
            Minha Turma
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Informações sobre sua turma
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
            <CircularProgress />
          </Box>
        ) : classData ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Card com nome da turma */}
            <Card
              sx={{
                background: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)'
                    : 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                color: 'white',
                boxShadow: 3,
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <School sx={{ fontSize: 48 }} />
                  <Box>
                    <Typography variant="h4" component="h2" sx={{ fontWeight: 700, mb: 1 }}>
                      {classData.name}
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      Turma atual
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Professores */}
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Person sx={{ fontSize: 32, color: 'primary.main' }} />
                  <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                    Professores
                  </Typography>
                  <Chip
                    label={classData.teachersNameAndEmail?.length || 0}
                    color="primary"
                    size="small"
                  />
                </Box>
                <Divider sx={{ mb: 2 }} />
                {classData.teachersNameAndEmail && classData.teachersNameAndEmail.length > 0 ? (
                  <TableContainer component={Paper} variant="outlined">
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Nome</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>E-mail</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {classData.teachersNameAndEmail.map((teacher, index) => {
                          const name = teacher.name || teacher['name'] || Object.values(teacher)[0] || '-';
                          const email = teacher.email || teacher['email'] || Object.values(teacher)[1] || '-';
                          return (
                            <TableRow key={index} hover>
                              <TableCell>{name}</TableCell>
                              <TableCell>{email}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                    Nenhum professor vinculado
                  </Typography>
                )}
              </CardContent>
            </Card>

            {/* Estudantes */}
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Groups sx={{ fontSize: 32, color: 'primary.main' }} />
                  <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                    Estudantes
                  </Typography>
                  <Chip
                    label={classData.studentsNameAndEmail?.length || 0}
                    color="primary"
                    size="small"
                  />
                </Box>
                <Divider sx={{ mb: 2 }} />
                {classData.studentsNameAndEmail && classData.studentsNameAndEmail.length > 0 ? (
                  <TableContainer component={Paper} variant="outlined">
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Nome</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>E-mail</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {classData.studentsNameAndEmail.map((student, index) => {
                          const name = student.name || student['name'] || Object.values(student)[0] || '-';
                          const email = student.email || student['email'] || Object.values(student)[1] || '-';
                          return (
                            <TableRow key={index} hover>
                              <TableCell>{name}</TableCell>
                              <TableCell>{email}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                    Nenhum estudante vinculado
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Box>
        ) : (
          <Card>
            <CardContent>
              <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                Você não está vinculado a nenhuma turma no momento
              </Typography>
            </CardContent>
          </Card>
        )}
      </Box>
    </Layout>
  );
};

export default ClassesPage;

