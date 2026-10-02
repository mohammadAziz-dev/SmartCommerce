const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type CsrfToken = {
  token: string;
  headerName: string;
};

export async function getCsrfToken(): Promise<CsrfToken> {
  const response = await fetch(`${API_BASE_URL}/api/auth/csrf`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Failed to get CSRF token (${response.status})`);
  }

  return response.json() as Promise<CsrfToken>;
}

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
};

export async function register(request: RegisterRequest): Promise<void> {
  const csrf = await getCsrfToken();

  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      [csrf.headerName]: csrf.token,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Failed to register (${response.status})`);
  }
}

export async function verifyEmail(token: string): Promise<void> {
  const csrf = await getCsrfToken();

  const response = await fetch(`${API_BASE_URL}/api/auth/verify-email`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      [csrf.headerName]: csrf.token,
    },
    body: JSON.stringify({ token }),
  });

  if (!response.ok) {
    throw new Error(`Failed to verify email (${response.status})`);
  }
}

export type LoginRequest = {
  email: string;
  password: string;
};

export async function login(request: LoginRequest): Promise<void> {
  const csrf = await getCsrfToken();

  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      [csrf.headerName]: csrf.token,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Failed to login (${response.status})`);
  }
}

export type AuthenticatedUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
};

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    credentials: "include",
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to get current user (${response.status})`);
  }

  return response.json() as Promise<AuthenticatedUser>;
}

export async function logout(): Promise<void> {
  const csrf = await getCsrfToken();

  const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
    headers: {
      [csrf.headerName]: csrf.token,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to logout (${response.status})`);
  }
}
