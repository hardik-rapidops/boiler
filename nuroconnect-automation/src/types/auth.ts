import type { RoleKey } from './roles';

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  id: string;
  ttl: number;
  created: string;
  userId: string;
};

export type AuthSession = {
  roleKey: RoleKey;
  token: string;
  userId: string;
  ttl: number;
  created: string;
};
