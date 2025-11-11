export interface SchoolClassResponse {
  id: number;
  name: string;
  studentCount: number;
  createdAt: string;
}

export interface StudentResponse {
  classEntity: SchoolClassResponse;
}

export interface TeacherResponse {
  classes: SchoolClassResponse[];
}

