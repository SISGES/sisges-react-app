import { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, CircularProgress, Divider } from '@mui/material';
import { Groups, CalendarToday } from '@mui/icons-material';
import { Layout } from '../Layout/Layout';
import { storage } from '../../utils/localStorage';
import { classService } from '../../services/classService';
import UserRoleEnum from '../../enums/UserRoleEnum';
import type { SchoolClassResponse } from '../../types/class';
import { useToast } from '../../contexts/ToastContext';

export const ClassesPage = () => {
  const [classes, setClasses] = useState<SchoolClassResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const role = storage.getRole();
        const userId = storage.getUserId();

        if (!role || !userId) {
          if (isMounted) {
            setLoading(false);
          }
          return;
        }

        if (role === UserRoleEnum.STUDENT) {
          const studentId = await classService.getStudentIdByUserId(userId);
          const studentResponse = await classService.getStudent(studentId.toString());
          if (isMounted && studentResponse.classEntity) {
            setClasses([studentResponse.classEntity]);
          } else if (isMounted) {
            setClasses([]);
          }
        } else if (role === UserRoleEnum.TEACHER) {
          const teacherClasses = await classService.getTeacherClassesByUserId(userId);
          if (isMounted) {
            setClasses(Array.isArray(teacherClasses) ? teacherClasses : []);
          }
        } else if (isMounted) {
          setClasses([]);
        }
      } catch (error: any) {
        if (isMounted) {
          setClasses([]);
          const role = storage.getRole();
          if (role) {
            showToast(
              error.response?.data?.message || 'Erro ao carregar dados das turmas',
              'error'
            );
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [showToast]);

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
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
          Turmas
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
            <CircularProgress />
          </Box>
        ) : Array.isArray(classes) && classes.length > 0 ? (
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
                    border: (theme) =>
                      `1px solid ${
                        theme.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.1)'
                          : 'rgba(0, 0, 0, 0.08)'
                      }`,
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: (theme) =>
                        theme.palette.mode === 'dark'
                          ? '0 12px 24px rgba(0, 0, 0, 0.5)'
                          : '0 12px 24px rgba(0, 0, 0, 0.15)',
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="h5"
                        component="h2"
                        sx={{
                          fontWeight: 700,
                          mb: 1,
                          color: 'primary.main',
                          fontSize: { xs: '1.25rem', sm: '1.5rem' },
                        }}
                      >
                        {classItem.name}
                      </Typography>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            backgroundColor: (theme) =>
                              theme.palette.mode === 'dark'
                                ? 'rgba(37, 99, 235, 0.2)'
                                : 'rgba(37, 99, 235, 0.1)',
                            color: 'primary.main',
                          }}
                        >
                          <Groups fontSize="small" />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="caption"
                            sx={{
                              textTransform: 'uppercase',
                              letterSpacing: 0.5,
                              fontWeight: 600,
                              color: 'text.secondary',
                              fontSize: '0.7rem',
                            }}
                          >
                            Alunos
                          </Typography>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 600,
                              mt: 0.5,
                            }}
                          >
                            {classItem.studentCount}
                          </Typography>
                        </Box>
                      </Box>

                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            backgroundColor: (theme) =>
                              theme.palette.mode === 'dark'
                                ? 'rgba(16, 185, 129, 0.2)'
                                : 'rgba(16, 185, 129, 0.1)',
                            color: 'secondary.main',
                          }}
                        >
                          <CalendarToday fontSize="small" />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="caption"
                            sx={{
                              textTransform: 'uppercase',
                              letterSpacing: 0.5,
                              fontWeight: 600,
                              color: 'text.secondary',
                              fontSize: '0.7rem',
                            }}
                          >
                            Criado em
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{
                              fontWeight: 500,
                              mt: 0.5,
                            }}
                          >
                            {formatDate(classItem.createdAt)}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
            ))}
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="body1" color="text.secondary">
              Nenhuma turma encontrada
            </Typography>
          </Box>
        )}
      </Box>
    </Layout>
  );
};

