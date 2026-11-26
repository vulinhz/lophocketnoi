import type { DemoAccount, ParentFeedback } from '../types/domain';
import { demoStorageService } from './demoStorageService';

export const feedbackService = {
  getAccessibleFeedback(user: DemoAccount): ParentFeedback[] {
    const { feedbacks } = demoStorageService.getState();
    const sorted = [...feedbacks].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
    switch (user.role) {
      case 'ADMIN':
        return sorted;
      case 'GVCN':
        return sorted.filter((f) => f.classId === user.assignedClassId);
      case 'PARENT':
        return sorted.filter(
          (f) => f.parentId === user.parentId || f.studentId === user.linkedStudentId,
        );
      default:
        return [];
    }
  },

  submitFeedback(
    user: DemoAccount,
    payload: {
      topic: ParentFeedback['topic'];
      message: string;
    },
  ): ParentFeedback {
    if (user.role !== 'PARENT' || !user.linkedStudentId || !user.assignedClassId) {
      throw new Error('Chỉ phụ huynh mới có thể gửi phản hồi qua cổng phụ huynh.');
    }
    const created: ParentFeedback = {
      id: `FB_${Date.now()}`,
      parentId: user.parentId ?? user.id,
      parentName: user.fullName,
      studentId: user.linkedStudentId,
      classId: user.assignedClassId,
      topic: payload.topic,
      message: payload.message.trim(),
      createdAt: new Date().toISOString(),
      isResolved: false,
    };
    demoStorageService.updateState((prev) => ({
      ...prev,
      feedbacks: [created, ...prev.feedbacks],
    }));
    return created;
  },

  replyFeedback(user: DemoAccount, feedbackId: string, replyText: string): ParentFeedback {
    const state = demoStorageService.getState();
    const target = state.feedbacks.find((f) => f.id === feedbackId);
    if (!target) throw new Error('Không tìm thấy phản hồi.');
    if (user.role !== 'GVCN' || user.assignedClassId !== target.classId) {
      throw new Error('Chỉ GVCN phụ trách lớp mới được phản hồi phụ huynh.');
    }
    const now = new Date().toISOString();
    let updated!: ParentFeedback;
    demoStorageService.updateState((prev) => ({
      ...prev,
      feedbacks: prev.feedbacks.map((f) => {
        if (f.id !== feedbackId) return f;
        updated = {
          ...f,
          teacherReply: replyText.trim(),
          repliedAt: now,
          isResolved: true,
        };
        return updated;
      }),
    }));
    return updated;
  },
};
