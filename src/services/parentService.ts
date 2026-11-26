import type { DemoAccount, ParentProfile, Student } from '../types/domain';
import { demoStorageService } from './demoStorageService';

export const parentService = {
  getParentProfile(parentId: string): ParentProfile | undefined {
    return demoStorageService.getState().parents.find((p) => p.id === parentId);
  },

  getAccessibleParents(user: DemoAccount): ParentProfile[] {
    const state = demoStorageService.getState();
    if (user.role === 'ADMIN') return state.parents;
    if (user.role === 'GVCN') {
      const classStudentIds = new Set(
        state.students
          .filter((s) => s.classId === user.assignedClassId)
          .map((s) => s.id),
      );
      return state.parents.filter((p) =>
        p.linkedStudentIds.some((sid) => classStudentIds.has(sid)),
      );
    }
    if (user.role === 'PARENT' && user.parentId) {
      return state.parents.filter((p) => p.id === user.parentId);
    }
    return [];
  },

  getLinkedStudentForParent(user: DemoAccount): Student | null {
    if (user.role !== 'PARENT' || !user.linkedStudentId) return null;
    const { students } = demoStorageService.getState();
    return students.find((s) => s.id === user.linkedStudentId) ?? null;
  },

  getHomeCompanionSuggestions(student: Student): string[] {
    const state = demoStorageService.getState();
    const publishedTips = state.comments
      .filter((c) => c.studentId === student.id && c.status === 'PUBLISHED' && c.homeCompanionTip)
      .map((c) => c.homeCompanionTip);

    const defaults = [
      `Khuyến khích ${student.fullName} duy trì thế mạnh "${student.strengths[0] ?? 'chủ động học tập'}" bằng lời khen cụ thể sau mỗi tuần.`,
      `Cùng con thống nhất khung giờ tự học 45 phút buổi tối và nhắc nghỉ mắt 10 phút giữa các phiên.`,
      student.needsAttention
        ? `Dành 10 phút trò chuyện nhẹ nhàng để lắng nghe khó khăn hiện tại (${student.attentionReason ?? 'áp lực bài vở'}) thay vì chỉ kiểm tra điểm số.`
        : `Hỏi con một điều mới mẻ hoặc thú vị nhất con đã chia sẻ cùng bạn bè trong tuần này.`,
    ];

    return Array.from(new Set([...publishedTips, ...defaults]));
  },
};
