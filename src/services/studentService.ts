import type {
  ClassId,
  DemoAccount,
  EffortBadge,
  SelfAssessment,
  Student,
  StudentTask,
  WeeklyGoal,
} from '../types/domain';
import { demoStorageService } from './demoStorageService';

export interface StudentFilterParams {
  search?: string;
  classId?: ClassId | 'ALL';
  conduct?: 'ALL' | 'Tốt' | 'Khá' | 'Đạt';
  attentionOnly?: boolean;
}

export const studentService = {
  getAccessibleStudents(user: DemoAccount): Student[] {
    const { students } = demoStorageService.getState();
    switch (user.role) {
      case 'ADMIN':
        return students;
      case 'GVCN':
        return students.filter((s) => s.classId === user.assignedClassId);
      case 'PARENT':
      case 'STUDENT':
        return students.filter((s) => s.id === user.linkedStudentId);
      default:
        return [];
    }
  },

  filterStudents(user: DemoAccount, filters: StudentFilterParams): Student[] {
    const accessible = this.getAccessibleStudents(user);
    const q = (filters.search ?? '').trim().toLowerCase();

    return accessible.filter((student) => {
      if (filters.classId && filters.classId !== 'ALL' && student.classId !== filters.classId) {
        return false;
      }
      if (filters.conduct && filters.conduct !== 'ALL' && student.conduct !== filters.conduct) {
        return false;
      }
      if (filters.attentionOnly && !student.needsAttention) {
        return false;
      }
      if (q) {
        const hay = `${student.fullName} ${student.studentCode} ${student.parentName} ${student.classId}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  },

  canAccessStudent(user: DemoAccount, studentId: string): boolean {
    const accessible = this.getAccessibleStudents(user);
    return accessible.some((s) => s.id === studentId);
  },

  getStudentById(user: DemoAccount, studentId: string): Student | null {
    if (!this.canAccessStudent(user, studentId)) return null;
    const { students } = demoStorageService.getState();
    return students.find((s) => s.id === studentId) ?? null;
  },

  toggleNeedsAttention(
    studentId: string,
    needsAttention: boolean,
    reason?: string,
  ): Student | null {
    let updatedStudent: Student | null = null;
    demoStorageService.updateState((state) => ({
      ...state,
      students: state.students.map((s) => {
        if (s.id !== studentId) return s;
        updatedStudent = {
          ...s,
          needsAttention,
          attentionReason: needsAttention
            ? reason?.trim() || s.attentionReason || 'Cần theo dõi thêm trong tuần'
            : undefined,
        };
        return updatedStudent;
      }),
    }));
    return updatedStudent;
  },

  updateStudentProfile(
    studentId: string,
    patch: Partial<Pick<Student, 'personalityNote' | 'conduct' | 'gpa' | 'attendanceRate' | 'strengths' | 'focusAreas'>>,
  ): Student | null {
    let updatedStudent: Student | null = null;
    demoStorageService.updateState((state) => ({
      ...state,
      students: state.students.map((s) => {
        if (s.id !== studentId) return s;
        updatedStudent = { ...s, ...patch };
        return updatedStudent;
      }),
    }));
    return updatedStudent;
  },

  awardBadge(studentId: string, badgeId: string): void {
    demoStorageService.updateState((state) => ({
      ...state,
      students: state.students.map((s) => {
        if (s.id !== studentId) return s;
        if (s.badgeIds.includes(badgeId)) return s;
        return {
          ...s,
          badgeIds: [...s.badgeIds, badgeId],
          effortPoints: s.effortPoints + 15,
        };
      }),
    }));
  },

  getAllBadges(): EffortBadge[] {
    return demoStorageService.getState().badges;
  },

  getAssessmentsForStudent(studentId: string): SelfAssessment[] {
    return demoStorageService
      .getState()
      .assessments.filter((a) => a.studentId === studentId)
      .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  },

  getAssessmentsForClass(classId: ClassId): SelfAssessment[] {
    return demoStorageService
      .getState()
      .assessments.filter((a) => a.classId === classId);
  },

  submitSelfAssessment(
    studentId: string,
    payload: Omit<SelfAssessment, 'id' | 'studentId' | 'classId' | 'submittedAt'>,
  ): SelfAssessment {
    const state = demoStorageService.getState();
    const student = state.students.find((s) => s.id === studentId);
    if (!student) {
      throw new Error('Không tìm thấy học sinh.');
    }
    const created: SelfAssessment = {
      ...payload,
      id: `ASM_${studentId}_${Date.now()}`,
      studentId,
      classId: student.classId,
      submittedAt: new Date().toISOString().slice(0, 10),
    };
    demoStorageService.updateState((prev) => ({
      ...prev,
      assessments: [created, ...prev.assessments],
      students: prev.students.map((s) =>
        s.id === studentId
          ? {
              ...s,
              effortPoints: s.effortPoints + 10,
              badgeIds: s.badgeIds.includes('BDG_SELF_REFLECT')
                ? s.badgeIds
                : [...s.badgeIds, 'BDG_SELF_REFLECT'],
            }
          : s,
      ),
    }));
    return created;
  },

  getGoalsForStudent(studentId: string): WeeklyGoal[] {
    return demoStorageService
      .getState()
      .goals.filter((g) => g.studentId === studentId);
  },

  createGoal(
    studentId: string,
    payload: { title: string; category: WeeklyGoal['category']; weekLabel: string },
  ): WeeklyGoal {
    const state = demoStorageService.getState();
    const student = state.students.find((s) => s.id === studentId);
    if (!student) throw new Error('Không tìm thấy học sinh.');
    const goal: WeeklyGoal = {
      id: `GOAL_${studentId}_${Date.now()}`,
      studentId,
      classId: student.classId,
      weekLabel: payload.weekLabel,
      title: payload.title.trim(),
      category: payload.category,
      progress: 0,
      isCompleted: false,
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    demoStorageService.updateState((prev) => ({
      ...prev,
      goals: [goal, ...prev.goals],
    }));
    return goal;
  },

  updateGoalProgress(goalId: string, progress: number): void {
    const clamped = Math.max(0, Math.min(100, progress));
    demoStorageService.updateState((prev) => ({
      ...prev,
      goals: prev.goals.map((g) =>
        g.id === goalId
          ? {
              ...g,
              progress: clamped,
              isCompleted: clamped === 100,
              updatedAt: new Date().toISOString().slice(0, 10),
            }
          : g,
      ),
    }));
  },

  deleteGoal(goalId: string): void {
    demoStorageService.updateState((prev) => ({
      ...prev,
      goals: prev.goals.filter((g) => g.id !== goalId),
    }));
  },

  getTasksForStudent(studentId: string): StudentTask[] {
    return demoStorageService
      .getState()
      .tasks.filter((t) => t.studentId === studentId);
  },

  toggleTaskComplete(taskId: string): void {
    demoStorageService.updateState((prev) => {
      const target = prev.tasks.find((t) => t.id === taskId);
      if (!target) return prev;
      const nextDone = !target.isCompleted;
      return {
        ...prev,
        tasks: prev.tasks.map((t) =>
          t.id === taskId ? { ...t, isCompleted: nextDone } : t,
        ),
        students: prev.students.map((s) =>
          s.id === target.studentId
            ? {
                ...s,
                effortPoints: Math.max(
                  0,
                  s.effortPoints + (nextDone ? target.points : -target.points),
                ),
              }
            : s,
        ),
      };
    });
  },
};
