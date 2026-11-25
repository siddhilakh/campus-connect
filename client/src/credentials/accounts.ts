/**
 * Demo login credentials.
 *
 * These 4 profiles are checked entirely in the browser — no backend or
 * database is involved. When the email + password typed on the login screen
 * match one of these, the matching dashboard data (src/mock/data/fixtures.json)
 * is served. To change a password or add a profile, edit this file.
 */
export type DemoRole = 'STUDENT' | 'SENIOR' | 'PLACEMENT_ADMIN' | 'SYSTEM_ADMIN';

export interface DemoCredential {
  role: DemoRole;
  email: string;
  password: string;
}

export const DEMO_CREDENTIALS: DemoCredential[] = [
  { role: 'STUDENT', email: 'student@test.com', password: 'student123' },
  { role: 'SENIOR', email: 'senior@test.com', password: 'senior123' },
  { role: 'PLACEMENT_ADMIN', email: 'admin@test.com', password: 'admin123' },
  { role: 'SYSTEM_ADMIN', email: 'superadmin@test.com', password: 'superadmin123' },
];

export const findCredential = (email: string, password: string): DemoCredential | undefined =>
  DEMO_CREDENTIALS.find(
    (c) => c.email === email.trim().toLowerCase() && c.password === password
  );
