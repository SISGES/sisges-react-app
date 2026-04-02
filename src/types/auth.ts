export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponseUserInfo {
  id: number
  name: string
  email: string
  register: string
  role: UserRole
}

export interface LoginResponse {
  accessToken: string
  tokenType: string
  user: LoginResponseUserInfo
}

export interface ResponsibleData {
  name: string
  phone: string
  alternativePhone?: string
  email: string
  alternativeEmail?: string
}

export interface RegisterUserRequest {
  name: string
  password: string
  birthDate: string
  gender: string
  role: UserRole
  responsibleId?: number | null
  classId?: number | null
  responsibleData?: ResponsibleData | null
}

export interface UserSearchResponse {
  id: number
  name: string
  email: string
  role: UserRole
}

export interface UserDetailResponse {
  id: number
  name: string
  email: string
  register: string
  role: UserRole
  birthDate: string
  gender: string
}

export type UserResponse = UserSearchResponse

export type SisgesErrorCode =
  | 'AUTH_INVALID_CREDENTIALS'
  | 'AUTH_UNAUTHORIZED'
  | 'AUTH_FORBIDDEN'
  | 'VALIDATION_ERROR'
  | 'BUSINESS_RULE_VIOLATION'
  | 'RESOURCE_NOT_FOUND'
  | 'DATA_CONFLICT'
  | 'INTERNAL_ERROR'

export interface FieldValidationError {
  field: string
  message: string
}

export interface SisgesErrorResponse {
  status: number
  code: SisgesErrorCode
  message: string
  timestamp: string
  errors?: FieldValidationError[]
}
export interface ApiErrorMessage {
  message: string
}

export interface ApiValidationError {
  message: string
  errors: Array<{
    field: string
    message: string
  }>
}

export type ApiError = ApiErrorMessage | ApiValidationError

export interface UserSearchFilters {
  name?: string
  email?: string
  register?: string
  gender?: string
  initialDate?: string
  finalDate?: string
}
export interface User {
  id: number
  name: string
  email: string
  register: string
  role: UserRole
}

export type LoginCredentials = LoginRequest

export interface TeacherSearchResponse {
  id: number
  name: string
  email: string
}

export interface TeacherSearchFilters {
  name?: string
  email?: string
}

export interface ClassSimple {
  id: number
  name: string
  year: number
}

export interface TeacherDetailResponse {
  id: number
  name: string
  email: string
  register: string
  birthDate: string
  gender: string
  classes: ClassSimple[]
}

export interface StudentSearchResponse {
  id: number
  name: string
  email: string
}

export interface StudentSearchFilters {
  name?: string
  email?: string
}

export interface AttendanceClassMeeting {
  disciplineName: string
  meetingDate: string
  createdAt: string
}

export interface StudentAttendance {
  classMeeting: AttendanceClassMeeting
  present: boolean
}

export interface ResponsibleSimple {
  name: string
  phone: string
  email: string
}

export interface StudentDetailResponse {
  id: number
  name: string
  email: string
  register: string
  birthDate: string
  gender: string
  class?: ClassSimple | null
  attendances: StudentAttendance[]
  responsibles: ResponsibleSimple[]
}


export interface ClassSearchResponse {
  id: number
  name: string
  academicYear: string
  studentCount: number
  teacherCount: number
}

export interface ClassSearchFilters {
  name?: string
  academicYear?: string
}

export interface UserSimple {
  id: number
  name: string
  email: string
}

export interface DisciplineSimple {
  id: number
  name: string
}

export interface ClassDetailResponse {
  id: number
  name: string
  academicYear: string
  students: UserSimple[]
  teachers: UserSimple[]
  disciplines?: DisciplineSimple[]
}

export interface DisciplineResponse {
  id: number
  name: string
  description?: string
  teachers?: { id: number; name: string; email: string }[]
}

export interface CreateDisciplineRequest {
  name: string
  description?: string
  teacherIds?: number[]
}

export interface DisciplineTeacherUpdate {
  teacherId: number
  vinculado: boolean
}

export interface UpdateDisciplineRequest {
  name?: string
  description?: string
  teachers?: DisciplineTeacherUpdate[]
}

export interface AulaSearchFilters {
  date?: string
  disciplineId?: number
  schoolClassId?: number
  teacherId?: number
}

export interface AulaSearchResponse {
  id: number
  date: string
  startTime: string
  endTime: string
  disciplineName: string
  schoolClassName: string
  teacherName: string
}

export interface AulaDetailStudent extends StudentSearchResponse {
  present?: boolean | null
}

export interface AulaDetailResponse {
  id: number
  name: string
  academicYear: string
  students: AulaDetailStudent[]
  professor: { id: number; name: string; email: string }
  date?: string
  startTime?: string
  endTime?: string
  disciplineId?: number
  schoolClassId?: number
}

export interface CreateAulaRequest {
  date: string
  disciplineId: number
  startTime: string
  endTime: string
  classId: number
  teacherId?: number
}

export interface UpdateAulaRequest extends CreateAulaRequest {}

export interface FrequencyEntry {
  studentId: number
  status: 'P' | 'F'
}

export interface SubmitFrequencyRequest {
  entries: FrequencyEntry[]
}

export interface CreateClassRequest {
  name: string
  academicYear: string
  studentIds?: number[]
  teacherIds?: number[]
  disciplineIds?: number[]
}

export interface ResponsibleSearchResponse {
  id: number
  name: string
  phone: string
  email: string
}

export interface ResponsibleSearchFilters {
  name?: string
  email?: string
}
