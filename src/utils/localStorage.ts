const TOKEN_KEY = 'sisges_token';
const EXPIRES_IN_KEY = 'sisges_expires_in';
const USER_ID_KEY = 'sisges_user_id';
const NAME_KEY = 'sisges_name';
const EMAIL_KEY = 'sisges_email';
const REGISTER_KEY = 'sisges_register';
const ROLE_KEY = 'sisges_role';
const STUDENT_ID_KEY = 'sisges_student_id';
const STUDENT_REGISTER_KEY = 'sisges_student_register';
const STUDENT_CLASS_ID_KEY = 'sisges_student_class_id';
const CLASS_DATA_KEY = 'sisges_class_data';

export const storage = {
  setAuthData: (
    id: string,
    token: string,
    expiresIn: number,
    name: string,
    email: string,
    register: string,
    role: string
  ): void => {
    localStorage.setItem(USER_ID_KEY, id);
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(EXPIRES_IN_KEY, expiresIn.toString());
    localStorage.setItem(NAME_KEY, name);
    localStorage.setItem(EMAIL_KEY, email);
    localStorage.setItem(REGISTER_KEY, register);
    localStorage.setItem(ROLE_KEY, role);
  },

  getUserId: (): string | null => {
    return localStorage.getItem(USER_ID_KEY);
  },

  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  getExpiresIn: (): number | null => {
    const expiresIn = localStorage.getItem(EXPIRES_IN_KEY);
    return expiresIn ? parseInt(expiresIn, 10) : null;
  },

  getName: (): string | null => {
    return localStorage.getItem(NAME_KEY);
  },

  getEmail: (): string | null => {
    return localStorage.getItem(EMAIL_KEY);
  },

  getRegister: (): string | null => {
    return localStorage.getItem(REGISTER_KEY);
  },

  getRole: (): string | null => {
    return localStorage.getItem(ROLE_KEY);
  },

  getStudentId: (): string | null => {
    return localStorage.getItem(STUDENT_ID_KEY);
  },

  getStudentRegister: (): string | null => {
    return localStorage.getItem(STUDENT_REGISTER_KEY);
  },

  getStudentClassId: (): string | null => {
    return localStorage.getItem(STUDENT_CLASS_ID_KEY);
  },

  setClassData: (classData: string): void => {
    localStorage.setItem(CLASS_DATA_KEY, classData);
  },

  getClassData: (): string | null => {
    return localStorage.getItem(CLASS_DATA_KEY);
  },

  setItem: (key: string, value: string): void => {
    localStorage.setItem(key, value);
  },

  clearAuthData: (): void => {
    localStorage.removeItem(USER_ID_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EXPIRES_IN_KEY);
    localStorage.removeItem(NAME_KEY);
    localStorage.removeItem(EMAIL_KEY);
    localStorage.removeItem(REGISTER_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(STUDENT_ID_KEY);
    localStorage.removeItem(STUDENT_REGISTER_KEY);
    localStorage.removeItem(STUDENT_CLASS_ID_KEY);
    localStorage.removeItem(CLASS_DATA_KEY);
  },
};

