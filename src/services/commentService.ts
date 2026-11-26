import type {
  ClassId,
  DemoAccount,
  PeriodicComment,
} from '../types/domain';
import { demoStorageService } from './demoStorageService';

export const commentService = {
  getAccessibleComments(user: DemoAccount): PeriodicComment[] {
    const { comments } = demoStorageService.getState();
    const sorted = [...comments].sort((a, b) =>
      b.updatedAt.localeCompare(a.updatedAt),
    );
    switch (user.role) {
      case 'ADMIN':
        return sorted;
      case 'GVCN':
        return sorted.filter((c) => c.classId === user.assignedClassId);
      case 'PARENT':
      case 'STUDENT':
        return sorted.filter(
          (c) => c.studentId === user.linkedStudentId && c.status === 'PUBLISHED',
        );
      default:
        return [];
    }
  },

  getCommentsForStudent(user: DemoAccount, studentId: string): PeriodicComment[] {
    return this.getAccessibleComments(user).filter(
      (c) => c.studentId === studentId,
    );
  },

  createDraftComment(
    user: DemoAccount,
    payload: {
      studentId: string;
      classId: ClassId;
      periodLabel: string;
      content: string;
      encouragementText: string;
      homeCompanionTip: string;
      isAiGenerated: boolean;
      aiSource: 'gemini' | 'mock-ai' | 'manual';
    },
  ): PeriodicComment {
    if (user.role !== 'GVCN' || user.assignedClassId !== payload.classId) {
      throw new Error('Chỉ GVCN phụ trách lớp mới được tạo nhận xét.');
    }
    const now = new Date().toISOString();
    // Strict rule: Every newly created comment (especially AI-generated) ALWAYS starts as DRAFT
    const created: PeriodicComment = {
      id: `CMT_${payload.studentId}_${Date.now()}`,
      studentId: payload.studentId,
      classId: payload.classId,
      teacherId: user.teacherId ?? `GV_${payload.classId}`,
      periodLabel: payload.periodLabel.trim() || 'Đánh giá Tuần 12 - Tháng 11/2026',
      status: 'DRAFT',
      content: payload.content.trim(),
      encouragementText: payload.encouragementText.trim(),
      homeCompanionTip: payload.homeCompanionTip.trim(),
      isAiGenerated: payload.isAiGenerated,
      aiSource: payload.aiSource,
      createdAt: now,
      updatedAt: now,
      approvalHistory: [
        {
          id: `HIS_${Date.now()}`,
          action: 'CREATED_DRAFT',
          actorName: user.fullName,
          actorRole: user.role,
          timestamp: now,
          note: payload.isAiGenerated
            ? `Khởi tạo bản nháp từ ${payload.aiSource === 'gemini' ? 'Gemini AI' : 'AI mô phỏng'}`
            : 'GVCN soạn bản nháp thủ công',
        },
      ],
    };

    demoStorageService.updateState((prev) => ({
      ...prev,
      comments: [created, ...prev.comments],
    }));
    return created;
  },

  updateDraftComment(
    user: DemoAccount,
    commentId: string,
    patch: Partial<
      Pick<
        PeriodicComment,
        'content' | 'encouragementText' | 'homeCompanionTip' | 'periodLabel'
      >
    >,
  ): PeriodicComment {
    const state = demoStorageService.getState();
    const target = state.comments.find((c) => c.id === commentId);
    if (!target) throw new Error('Không tìm thấy nhận xét.');
    if (user.role !== 'GVCN' || user.assignedClassId !== target.classId) {
      throw new Error('Chỉ GVCN phụ trách lớp mới được chỉnh sửa nhận xét.');
    }
    const now = new Date().toISOString();
    let updated!: PeriodicComment;
    demoStorageService.updateState((prev) => ({
      ...prev,
      comments: prev.comments.map((c) => {
        if (c.id !== commentId) return c;
        updated = {
          ...c,
          ...patch,
          status: 'DRAFT',
          updatedAt: now,
          approvalHistory: [
            ...c.approvalHistory,
            {
              id: `HIS_${Date.now()}`,
              action: 'EDITED',
              actorName: user.fullName,
              actorRole: user.role,
              timestamp: now,
              note: 'Chỉnh sửa nội dung (trở về trạng thái Bản nháp)',
            },
          ],
        };
        return updated;
      }),
    }));
    return updated;
  },

  approveComment(user: DemoAccount, commentId: string, note?: string): PeriodicComment {
    const state = demoStorageService.getState();
    const target = state.comments.find((c) => c.id === commentId);
    if (!target) throw new Error('Không tìm thấy nhận xét.');
    if (user.role !== 'GVCN' || user.assignedClassId !== target.classId) {
      throw new Error('Chỉ GVCN của lớp mới được quyền duyệt nhận xét.');
    }
    const now = new Date().toISOString();
    let updated!: PeriodicComment;
    demoStorageService.updateState((prev) => ({
      ...prev,
      comments: prev.comments.map((c) => {
        if (c.id !== commentId) return c;
        updated = {
          ...c,
          status: 'APPROVED',
          approvedAt: now,
          updatedAt: now,
          approvalHistory: [
            ...c.approvalHistory,
            {
              id: `HIS_${Date.now()}`,
              action: 'APPROVED',
              actorName: user.fullName,
              actorRole: user.role,
              timestamp: now,
              note: note?.trim() || 'GVCN xác nhận nội dung phù hợp',
            },
          ],
        };
        return updated;
      }),
    }));
    return updated;
  },

  publishComment(user: DemoAccount, commentId: string, note?: string): PeriodicComment {
    const state = demoStorageService.getState();
    const target = state.comments.find((c) => c.id === commentId);
    if (!target) throw new Error('Không tìm thấy nhận xét.');
    if (user.role !== 'GVCN' || user.assignedClassId !== target.classId) {
      throw new Error('Chỉ GVCN của lớp mới được quyền phát hành nhận xét.');
    }
    if (target.status === 'DRAFT') {
      throw new Error('Cần duyệt nhận xét (APPROVED) trước khi phát hành tới phụ huynh.');
    }
    const now = new Date().toISOString();
    let updated!: PeriodicComment;
    demoStorageService.updateState((prev) => ({
      ...prev,
      comments: prev.comments.map((c) => {
        if (c.id !== commentId) return c;
        updated = {
          ...c,
          status: 'PUBLISHED',
          publishedAt: now,
          updatedAt: now,
          approvalHistory: [
            ...c.approvalHistory,
            {
              id: `HIS_${Date.now()}`,
              action: 'PUBLISHED',
              actorName: user.fullName,
              actorRole: user.role,
              timestamp: now,
              note: note?.trim() || 'Phát hành cho Phụ huynh và Học sinh xem',
            },
          ],
        };
        return updated;
      }),
    }));
    return updated;
  },

  revertToDraft(user: DemoAccount, commentId: string): PeriodicComment {
    const state = demoStorageService.getState();
    const target = state.comments.find((c) => c.id === commentId);
    if (!target) throw new Error('Không tìm thấy nhận xét.');
    if (user.role !== 'GVCN' || user.assignedClassId !== target.classId) {
      throw new Error('Không có quyền thao tác.');
    }
    const now = new Date().toISOString();
    let updated!: PeriodicComment;
    demoStorageService.updateState((prev) => ({
      ...prev,
      comments: prev.comments.map((c) => {
        if (c.id !== commentId) return c;
        updated = {
          ...c,
          status: 'DRAFT',
          updatedAt: now,
          approvalHistory: [
            ...c.approvalHistory,
            {
              id: `HIS_${Date.now()}`,
              action: 'REVERTED_TO_DRAFT',
              actorName: user.fullName,
              actorRole: user.role,
              timestamp: now,
              note: 'Đưa về bản nháp để hiệu chỉnh lại',
            },
          ],
        };
        return updated;
      }),
    }));
    return updated;
  },

  deleteComment(user: DemoAccount, commentId: string): void {
    const state = demoStorageService.getState();
    const target = state.comments.find((c) => c.id === commentId);
    if (!target) return;
    if (user.role !== 'GVCN' || user.assignedClassId !== target.classId) {
      throw new Error('Không có quyền xóa nhận xét này.');
    }
    demoStorageService.updateState((prev) => ({
      ...prev,
      comments: prev.comments.filter((c) => c.id !== commentId),
    }));
  },
};
