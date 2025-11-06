const TOKEN_KEY = 'sisges_token';
const EXPIRES_IN_KEY = 'sisges_expires_in';
const NAME_KEY = 'sisges_name';
const EMAIL_KEY = 'sisges_email';
const REGISTER_KEY = 'sisges_register';
const ROLE_KEY = 'sisges_role';

export const storage = {
  setAuthData: (
    token: string,
    expiresIn: number,
    name: string,
    email: string,
    register: string,
    role: string
  ): void => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(EXPIRES_IN_KEY, expiresIn.toString());
    localStorage.setItem(NAME_KEY, name);
    localStorage.setItem(EMAIL_KEY, email);
    localStorage.setItem(REGISTER_KEY, register);
    localStorage.setItem(ROLE_KEY, role);
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

  clearAuthData: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EXPIRES_IN_KEY);
    localStorage.removeItem(NAME_KEY);
    localStorage.removeItem(EMAIL_KEY);
    localStorage.removeItem(REGISTER_KEY);
    localStorage.removeItem(ROLE_KEY);
  },
};

