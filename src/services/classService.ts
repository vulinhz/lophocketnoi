import type { ClassId, Classroom, DemoAccount, Teacher } from '../types/domain';
import { demoStorageService } from './demoStorageService';

export interface ClassSummaryStats {
  classroom: Classroom;
  teacher: Teacher | undefined;
  studentCount: number;
  attentionCount: number;
  averageGpa: number;
  attendanceAvg: number;
  publishedCommentsCount: number;
  pendingCommentsCount: number;
  selfAssessmentRate: number;
  announcementReadRate: number;
}

export const classService = {
  getAccessibleClasses(user: DemoAccount): Classroom[] {
    const { classes } = demoStorageService.getState();
    if (user.role === 'ADMIN') return classes;
    if (user.assignedClassId) {
      return classes.filter((c) => c.id === user.assignedClassId);
    }
    return [];
  },

  getClassById(classId: ClassId): Classroom | undefined {
    return demoStorageService.getState().classes.find((c) => c.id === classId);
  },

  getTeacherById(teacherId: string): Teacher | undefined {
    return demoStorageService.getState().teachers.find((t) => t.id === teacherId);
  },

  getAllTeachers(): Teacher[] {
    return demoStorageService.getState().teachers;
  },

  getClassSummaryStats(classId: ClassId): ClassSummaryStats | null {
    const state = demoStorageService.getState();
    const classroom = state.classes.find((c) => c.id === classId);
    if (!classroom) return null;

    const teacher = state.teachers.find((t) => t.id === classroom.homeroomTeacherId);
    const students = state.students.filter((s) => s.classId === classId);
    const studentCount = students.length;
    const attentionCount = students.filter((s) => s.needsAttention).length;

    const averageGpa =
      studentCount > 0
        ? Math.round(
            (students.reduce((sum, s) => sum + s.gpa, 0) / studentCount) * 100,
          ) / 100
        : 0;

    const attendanceAvg =
      studentCount > 0
        ? Math.round(
            students.reduce((sum, s) => sum + s.attendanceRate, 0) / studentCount,
          )
        : 0;

    const classComments = state.comments.filter((c) => c.classId === classId);
    const publishedCommentsCount = classComments.filter(
      (c) => c.status === 'PUBLISHED',
    ).length;
    const pendingCommentsCount = classComments.filter(
      (c) => c.status === 'DRAFT' || c.status === 'APPROVED',
    ).length;

    const assessedStudentIds = new Set(
      state.assessments
        .filter((a) => a.classId === classId)
        .map((a) => a.studentId),
    );
    const selfAssessmentRate =
      studentCount > 0
        ? Math.round((assessedStudentIds.size / studentCount) * 100)
        : 0;

    const publishedAnnouncements = state.announcements.filter(
      (a) => (a.classId === classId || a.classId === 'ALL') && a.status === 'PUBLISHED',
    );
    const announcementReadRate =
      publishedAnnouncements.length > 0
        ? Math.round(
            (publishedAnnouncements.reduce(
              (sum, a) => sum + a.readByParentIds.length / Math.max(1, a.targetParentCount),
              0,
            ) /
              publishedAnnouncements.length) *
              100,
          )
        : 0;

    return {
      classroom,
      teacher,
      studentCount,
      attentionCount,
      averageGpa,
      attendanceAvg,
      publishedCommentsCount,
      pendingCommentsCount,
      selfAssessmentRate,
      announcementReadRate,
    };
  },

  getAllClassSummaries(): ClassSummaryStats[] {
    const { classes } = demoStorageService.getState();
    return classes
      .map((c) => this.getClassSummaryStats(c.id))
      .filter((item): item is ClassSummaryStats => item !== null);
  },

  updateWeeklyFocus(classId: ClassId, weeklyFocus: string): void {
    demoStorageService.updateState((prev) => ({
      ...prev,
      classes: prev.classes.map((c) =>
        c.id === classId ? { ...c, weeklyFocus: weeklyFocus.trim() } : c,
      ),
    }));
  },
};
