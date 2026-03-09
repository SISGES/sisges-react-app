# SISGES – MVP Status and Gap Analysis

**Date:** March 9, 2025  
**Projects:** `sisges-react-app` (frontend) + `sisges-sboot-app` (backend)

---

## 1. Project Overview

| Project | Stack | Purpose |
|---------|-------|---------|
| **sisges-react-app** | React 18, TypeScript, Vite 5, React Router 6 | SPA frontend |
| **sisges-sboot-app** | Spring Boot 3.5.4, Java 21, PostgreSQL, Flyway | REST API backend |

**Base API URL:** `http://localhost:8080/api` (configurable via `VITE_API_BASE_URL`)

---

## 2. Current Structure

### 2.1 Frontend (sisges-react-app)

#### Routes and Pages

| Path | Component | Access |
|------|------------|--------|
| `/login` | Login | Public (redirects to `/` if authenticated) |
| `/` | Home | Protected (any authenticated user) |
| `/admin/register` | RegisterUser | Admin only |
| `/admin/classes` | Classes | Admin only |
| `/admin/classes/:id/edit` | EditClass | Admin only |
| `/admin/students` | Students | Admin only |
| `/admin/disciplines` | Disciplines | Admin only |
| `/admin/users/:id` | UserDetail | Admin only |
| `/aulas` | Aulas | Teacher or Admin |
| `/aulas/new` | CreateAula | Teacher or Admin |
| `/aulas/:id` | AulaDetail | Teacher or Admin |
| `/aulas/:id/edit` | EditAula | Teacher or Admin |
| `/users/:id` | UserDetail | Teacher or Admin |
| `*` | Redirect to `/` | Catch-all |

#### Key Components

- **Login** – Email/password form
- **ProtectedRoute** – Requires auth; redirects to `/login`
- **AdminRoute** – Requires `ADMIN` role
- **TeacherRoute** – Requires `TEACHER` or `ADMIN`
- **AdminDashboard** – Admin hub (students, classes, disciplines, aulas)
- **ThemeToggle**, **Toast**, **BackButton**, **ColorPalette**

#### State Management

- **AuthContext** – `user`, `isAuthenticated`, `login`, `logout`
- **ThemeContext** – `theme`, `mode`, `toggleTheme`
- **ToastContext** – `toasts`, `showToast`, `removeToast`

No Redux/Zustand; state via React Context.

---

### 2.2 Backend (sisges-sboot-app)

#### Controllers and Endpoints

| Controller | Base Path | Endpoints |
|------------|-----------|-----------|
| **AuthController** | `/api/auth` | `POST /login`, `POST /register`, `GET /validate` |
| **UserController** | `/api/users` | `POST /search`, `GET /{id}` |
| **TeacherController** | `/api/teachers` | `GET /me`, `POST /search`, `GET /{id}` |
| **StudentController** | `/api/students` | `POST /search`, `GET /{id}` |
| **DisciplineController** | `/api/disciplines` | `GET`, `POST`, `GET /{id}`, `PUT /update/{id}` |
| **SchoolClassController** | `/api/classes` | CRUD, search, add/remove teachers/students/disciplines |
| **ClassMeetingController** | `/api/class` | CRUD, `POST /{id}/frequency` (attendance) |

**Public (no auth):** `/api/auth/login`, `/api/auth/register`, Swagger UI

#### Entities (JPA)

| Entity | Table | Purpose |
|--------|-------|---------|
| User | `users` | Base for Teacher, Student, Admin |
| Teacher | `teacher` | 1:1 User; N:N SchoolClass |
| Student | `student` | 1:1 User; N:1 SchoolClass; N:N StudentResponsible |
| StudentResponsible | `student_responsible` | Legal guardian data |
| SchoolClass | `school_class` | Turma (cohort); N:N Teacher, Student, Discipline |
| Discipline | `discipline` | Subject; N:N SchoolClass, Teacher |
| ClassMeeting | `class_meeting` | Aula (one meeting instance); N:1 SchoolClass, Discipline, Teacher |
| Attendance | `attendance` | Presence per student per ClassMeeting |
| StudentDocument | `student_document` | Student docs (RG, certidão, etc.) – metadata only, no file |
| DocumentType | `document_type` | Catalog (RG, Certidão, etc.) |
| DisciplineMaterial | `discipline_material` | Study materials – metadata only, no file |
| Lesson | `lesson` | Syllabus content per discipline |
| UserLog | `user_logs` | Audit log |

---

## 3. Authentication and Authorization

### 3.1 Auth Flow

1. Login via `POST /api/auth/login` → JWT returned
2. JWT stored in `localStorage` as `token`
3. User data in `localStorage` as `user`
4. `Authorization: Bearer <token>` on API calls
5. 401 on protected endpoints → logout and redirect to `/login`

### 3.2 Roles

- **ADMIN** – Full access
- **TEACHER** – Aulas, frequency, own profile
- **STUDENT** – No dedicated UI yet (empty Home)

### 3.3 Registration Security Gap

| Layer | Status |
|-------|--------|
| **Frontend** | `/admin/register` protected by `AdminRoute` – only admins see the page |
| **Backend** | `POST /api/auth/register` is **public** – no `@PreAuthorize`; anyone can register |

**MVP requirement:** Only admins should register users. Backend must restrict `POST /api/auth/register` to `ADMIN` role.

---

## 4. MVP Feature Status

### 4.1 User Registration (Students, Teachers, Admins – Only Admins Register)

| Aspect | Status | Notes |
|--------|--------|-------|
| Frontend registration page | Implemented | Admin-only route, supports TEACHER, STUDENT, ADMIN |
| Role selection | Implemented | TEACHER, STUDENT, ADMIN |
| Student-specific fields | Implemented | Class, responsible (new or existing) |
| Backend registration logic | Implemented | `RegistrationService` (register, email generation) |
| **Backend auth restriction** | Missing | API is public; must add `@PreAuthorize("hasRole('ADMIN')")` |

---

### 4.2 Class Creation with Attendance

| Aspect | Status | Notes |
|--------|--------|-------|
| SchoolClass CRUD | Implemented | Admin creates classes (name, academicYear) |
| Class–Discipline association | Implemented | Add/remove disciplines per class |
| Class–Teacher association | Implemented | Add/remove teachers per class |
| Class–Student association | Implemented | Add/remove students per class |
| ClassMeeting (aula) creation | Implemented | Teacher creates aulas linked to class/discipline |
| Attendance (frequency) | Implemented | `POST /class/{id}/frequency`; UI in AulaDetail |
| Student home for classes | Missing | Students have no view of their classes |

---

### 4.3 Evaluative Activities (Linked to Classes/Cohorts with Document Uploads)

| Aspect | Status | Notes |
|--------|--------|-------|
| Evaluative activity entity | Missing | No `EvaluativeActivity` or similar |
| Link to class/cohort | N/A | Entity does not exist |
| Document upload (pdf, txt, docx) | Missing | No file upload anywhere |
| Backend file storage | Missing | `file_path` removed from `student_document` and `discipline_material` (V3 migration) |

**Needed:** New entity (e.g. `EvaluativeActivity`) linked to `SchoolClass` and/or `Discipline`, with file upload support.

---

### 4.4 Study Materials (PDF, TXT, DOCX) by Teachers for Cohort/Subject

| Aspect | Status | Notes |
|--------|--------|-------|
| DisciplineMaterial entity | Exists | `discipline_material` table; title, description, materialType |
| File storage | Missing | `file_path` dropped in V3; "inserção de arquivos será reintroduzida depois" |
| API for materials | Missing | No controller, service, or repository for DisciplineMaterial |
| Link to cohort/subject | Partial | DisciplineMaterial → Discipline; Discipline ↔ SchoolClass via class_discipline |
| Teacher-only creation | N/A | No API yet |

**Needed:**

- Restore `file_path` (or equivalent) for `discipline_material`
- Implement file upload (MultipartFile, storage strategy)
- CRUD API for DisciplineMaterial (teacher-only create)
- Frontend UI for teachers to upload materials per discipline/cohort

---

### 4.5 Announcement Banners Feed (Admin Creates, Filter by Role, Home Screen)

| Aspect | Status | Notes |
|--------|--------|-------|
| Announcement entity | Missing | No table or entity |
| Admin creation | Missing | No UI or API |
| Role-based filtering | Missing | No concept of target roles |
| Home screen feed | Missing | Home shows AdminDashboard (admin), teacher hub (teacher), nothing (student) |

**Needed:**

- New `announcement` (or `banner`) entity: title, content, targetRoles, start/end dates, etc.
- Admin API and UI to create/edit announcements
- API to list announcements filtered by current user role
- Home page component to display announcement feed for all roles

---

## 5. Additional Gaps

### 5.1 Student Experience

- **Home page:** Students see an empty `<main>` (no content for `user?.role === 'STUDENT'`)
- **Routes:** No student-specific routes (e.g. my classes, my materials, my activities)
- **API:** Students can call search endpoints if they have a token, but there is no student-oriented UI

### 5.2 DisciplineMaterial

- Entity exists; no repository, service, or controller
- No frontend integration

### 5.3 Cohort vs Class

- **SchoolClass** = turma (cohort)
- **Discipline** = subject, linked to SchoolClass via `class_discipline`
- MVP uses SchoolClass as the cohort concept

---

## 6. Summary: Implemented vs Missing for MVP

### Implemented

| Feature | Frontend | Backend |
|---------|----------|---------|
| Login | Yes | Yes |
| JWT auth | Yes | Yes |
| User registration (admin UI) | Yes | Yes (but API not restricted) |
| Class (turma) CRUD | Yes | Yes |
| Class–teachers/students/disciplines | Yes | Yes |
| Aula (ClassMeeting) CRUD | Yes | Yes |
| Attendance (frequency) | Yes | Yes |
| Disciplines CRUD | Yes | Yes |
| User/Teacher/Student search | Yes | Yes |
| Admin dashboard | Yes | N/A |
| Teacher hub (aulas) | Yes | N/A |

### Missing for MVP

| Feature | Work Required |
|---------|---------------|
| **Registration restricted to admins** | Add `@PreAuthorize("hasRole('ADMIN')")` on `POST /api/auth/register` |
| **Evaluative activities** | New entity, API, file upload, frontend |
| **Study materials with files** | Restore file storage, DisciplineMaterial API, upload UI |
| **Announcement banners** | New entity, API, admin UI, home feed component |
| **Student home** | Student-specific home content and routes |
| **File upload (pdf, txt, docx)** | Backend storage + upload endpoints; frontend upload UI |

---

## 7. Recommended Implementation Order

1. **Registration security** – Restrict `POST /api/auth/register` to ADMIN (quick fix).
2. **Announcement banners** – Entity, migration, API, admin UI, home feed.
3. **Student home** – Basic home view for students (e.g. announcements, links to future features).
4. **Study materials** – Restore `file_path`, implement DisciplineMaterial CRUD + file upload.
5. **Evaluative activities** – New entity and full flow with document uploads.

---

*Generated from exploration of `sisges-react-app` and `sisges-sboot-app`.*
