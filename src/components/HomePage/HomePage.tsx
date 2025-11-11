import { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Grid, CircularProgress } from '@mui/material';
import { Layout } from '../Layout/Layout';
import { storage } from '../../utils/localStorage';
import { classService } from '../../services/classService';
import UserRoleEnum from '../../enums/UserRoleEnum';
import type { SchoolClassResponse } from '../../types/class';
import { useToast } from '../../contexts/ToastContext';

export const HomePage = () => {
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
          const studentResponse = await classService.getStudent(userId);
          if (isMounted && studentResponse.classEntity) {
            setClasses([studentResponse.classEntity]);
          }
        } else if (role === UserRoleEnum.TEACHER) {
          const teacherResponse = await classService.getTeacher(userId);
          if (isMounted && teacherResponse.classes) {
            setClasses(teacherResponse.classes);
          }
        }
      } catch (error: any) {
        if (isMounted) {
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
    return date.toLocaleDateString('pt-BR');
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
        ) : (
          <Grid container spacing={3}>
            {classes.map((classItem) => (
              <Grid item xs={12} sm={6} md={4} key={classItem.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
                      {classItem.name}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                      Alunos: {classItem.studentCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Criado em: {formatDate(classItem.createdAt)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {!loading && classes.length === 0 && (
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
