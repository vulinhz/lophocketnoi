import type { DemoAccount, UserRole } from '../types/domain';
import { FEMALE_TEACHER_AVATAR, MALE_TEACHER_AVATAR } from '../data/mockTeachers';

const AUTH_STORAGE_KEY = 'lhk_demo_active_account_v1';

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: 'ACC_ADMIN',
    email: 'admin@hpu2.it',
    password: '123456',
    role: 'ADMIN',
    fullName: 'Quản trị viên Hệ thống',
    title: 'Ban Giám hiệu · Quản trị trường',
    avatarUrl: FEMALE_TEACHER_AVATAR,
  },
  {
    id: 'ACC_GV_7A1',
    email: 'teacher7a1@hpu2.it',
    password: '123456',
    role: 'GVCN',
    fullName: 'Cô Nguyễn Thị Minh Thu',
    title: 'Giáo viên chủ nhiệm lớp 7A1',
    assignedClassId: '7A1',
    teacherId: 'GV_7A1',
    avatarUrl: FEMALE_TEACHER_AVATAR,
  },
  {
    id: 'ACC_GV_7A3',
    email: 'teacher7a3@dhpu2.it',
    password: '123456',
    role: 'GVCN',
    fullName: 'Thầy Trần Quốc Hùng',
    title: 'Giáo viên chủ nhiệm lớp 7A3',
    assignedClassId: '7A3',
    teacherId: 'GV_7A3',
    avatarUrl: MALE_TEACHER_AVATAR,
  },
  {
    id: 'ACC_GV_10A2',
    email: 'teacher10a2@hpu2.it',
    password: '123456',
    role: 'GVCN',
    fullName: 'Cô Phạm Lan Anh',
    title: 'Giáo viên chủ nhiệm lớp 10A2',
    assignedClassId: '10A2',
    teacherId: 'GV_10A2',
    avatarUrl: FEMALE_TEACHER_AVATAR,
  },
  {
    id: 'ACC_GV_11A1',
    email: 'teacher11a1@hpu2.it',
    password: '123456',
    role: 'GVCN',
    fullName: 'Thầy Lê Đức Mạnh',
    title: 'Giáo viên chủ nhiệm lớp 11A1',
    assignedClassId: '11A1',
    teacherId: 'GV_11A1',
    avatarUrl: MALE_TEACHER_AVATAR,
  },
  {
    id: 'ACC_GV_11A2',
    email: 'teacher11a2@hpu2.it',
    password: '123456',
    role: 'GVCN',
    fullName: 'Cô Vũ Thanh Hương',
    title: 'Giáo viên chủ nhiệm lớp 11A2',
    assignedClassId: '11A2',
    teacherId: 'GV_11A2',
    avatarUrl: FEMALE_TEACHER_AVATAR,
  },
  {
    id: 'ACC_PH_01',
    email: 'parent01@hpu2.it',
    password: '123456',
    role: 'PARENT',
    fullName: 'Chị Lê Thị Thanh Mai',
    title: 'Phụ huynh em Nguyễn Minh An · Lớp 7A1',
    assignedClassId: '7A1',
    linkedStudentId: 'HS7A101',
    parentId: 'PH_01',
  },
  {
    id: 'ACC_PH_02',
    email: 'parent02@hpu2.it',
    password: '123456',
    role: 'PARENT',
    fullName: 'Anh Trần Văn Khánh',
    title: 'Phụ huynh em Trần Bảo Ngọc · Lớp 10A2',
    assignedClassId: '10A2',
    linkedStudentId: 'HS10A201',
    parentId: 'PH_02',
  },
  {
    id: 'ACC_PH_03',
    email: 'parent03@hpu2.it',
    password: '123456',
    role: 'PARENT',
    fullName: 'Chị Phạm Thu Hà',
    title: 'Phụ huynh em Lê Hoàng Phúc · Lớp 11A1',
    assignedClassId: '11A1',
    linkedStudentId: 'HS11A101',
    parentId: 'PH_03',
  },
  {
    id: 'ACC_HS_01',
    email: 'student01@hpu2.it',
    password: '123456',
    role: 'STUDENT',
    fullName: 'Nguyễn Minh An',
    title: 'Học sinh lớp 7A1 · Mã HS7A101',
    assignedClassId: '7A1',
    linkedStudentId: 'HS7A101',
  },
  {
    id: 'ACC_HS_02',
    email: 'student02@hpu2.it',
    password: '123456',
    role: 'STUDENT',
    fullName: 'Trần Bảo Ngọc',
    title: 'Học sinh lớp 10A2 · Mã HS10A201',
    assignedClassId: '10A2',
    linkedStudentId: 'HS10A201',
  },
  {
    id: 'ACC_HS_03',
    email: 'student03@hpu2.it',
    password: '123456',
    role: 'STUDENT',
    fullName: 'Lê Hoàng Phúc',
    title: 'Học sinh lớp 11A1 · Mã HS11A101',
    assignedClassId: '11A1',
    linkedStudentId: 'HS11A101',
  },
];

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Quản trị viên (Admin)',
  GVCN: 'Giáo viên chủ nhiệm',
  PARENT: 'Phụ huynh',
  STUDENT: 'Học sinh',
};

type AuthListener = () => void;
const authListeners = new Set<AuthListener>();

export const demoAuthService = {
  getAccounts(): DemoAccount[] {
    return DEMO_ACCOUNTS;
  },

  getCurrentUser(): DemoAccount | null {
    try {
      const id = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!id) return null;
      return DEMO_ACCOUNTS.find((a) => a.id === id) ?? null;
    } catch {
      return null;
    }
  },

  loginWithCredentials(
    email: string,
    password: string,
  ): { ok: true; account: DemoAccount } | { ok: false; error: string } {
    const normalizedEmail = email.trim().toLowerCase();
    const account = DEMO_ACCOUNTS.find(
      (a) => a.email.toLowerCase() === normalizedEmail,
    );
    if (!account) {
      return {
        ok: false,
        error: 'Email không nằm trong danh sách tài khoản demo.',
      };
    }
    if (password.trim() !== account.password) {
      return {
        ok: false,
        error: 'Mật khẩu demo không đúng (mật khẩu mặc định là 123456).',
      };
    }
    this.setSession(account);
    return { ok: true, account };
  },

  quickLoginById(accountId: string): DemoAccount | null {
    const account = DEMO_ACCOUNTS.find((a) => a.id === accountId) ?? null;
    if (account) {
      this.setSession(account);
    }
    return account;
  },

  setSession(account: DemoAccount): void {
    try {
      window.localStorage.setItem(AUTH_STORAGE_KEY, account.id);
    } catch {
      // ignore
    }
    authListeners.forEach((fn) => fn());
  },

  logout(): void {
    try {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // ignore
    }
    authListeners.forEach((fn) => fn());
  },

  subscribe(fn: AuthListener): () => void {
    authListeners.add(fn);
    return () => {
      authListeners.delete(fn);
    };
  },
};
