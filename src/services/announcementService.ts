import type { Announcement, ClassId, DemoAccount } from '../types/domain';
import { demoStorageService } from './demoStorageService';

export const announcementService = {
  getAccessibleAnnouncements(user: DemoAccount): Announcement[] {
    const { announcements } = demoStorageService.getState();
    const sorted = [...announcements].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
    switch (user.role) {
      case 'ADMIN':
        return sorted;
      case 'GVCN':
        return sorted.filter(
          (a) => a.classId === user.assignedClassId || a.classId === 'ALL',
        );
      case 'PARENT':
      case 'STUDENT':
        return sorted.filter(
          (a) =>
            a.status === 'PUBLISHED' &&
            (a.classId === user.assignedClassId || a.classId === 'ALL'),
        );
      default:
        return [];
    }
  },

  createDraftAnnouncement(
    user: DemoAccount,
    payload: {
      classId: ClassId;
      title: string;
      content: string;
      category: Announcement['category'];
      isAiGenerated: boolean;
      aiSource: 'gemini' | 'mock-ai' | 'manual';
    },
  ): Announcement {
    if (user.role !== 'GVCN' || user.assignedClassId !== payload.classId) {
      throw new Error('Chỉ GVCN phụ trách lớp mới được tạo thông báo.');
    }
    const now = new Date().toISOString();
    const created: Announcement = {
      id: `ANN_${payload.classId}_${Date.now()}`,
      classId: payload.classId,
      teacherId: user.teacherId ?? `GV_${payload.classId}`,
      title: payload.title.trim(),
      content: payload.content.trim(),
      category: payload.category,
      status: 'DRAFT',
      isAiGenerated: payload.isAiGenerated,
      aiSource: payload.aiSource,
      createdAt: now,
      readByParentIds: [],
      targetParentCount: 30,
    };
    demoStorageService.updateState((prev) => ({
      ...prev,
      announcements: [created, ...prev.announcements],
    }));
    return created;
  },

  publishAnnouncement(user: DemoAccount, announcementId: string): Announcement {
    const state = demoStorageService.getState();
    const target = state.announcements.find((a) => a.id === announcementId);
    if (!target) throw new Error('Không tìm thấy thông báo.');
    if (user.role !== 'GVCN' || user.assignedClassId !== target.classId) {
      throw new Error('Chỉ GVCN phụ trách lớp mới được phát hành thông báo.');
    }
    const now = new Date().toISOString();
    let updated!: Announcement;
    demoStorageService.updateState((prev) => ({
      ...prev,
      announcements: prev.announcements.map((a) => {
        if (a.id !== announcementId) return a;
        updated = {
          ...a,
          status: 'PUBLISHED',
          publishedAt: now,
        };
        return updated;
      }),
    }));
    return updated;
  },

  markAsReadByParent(user: DemoAccount, announcementId: string): void {
    if (user.role !== 'PARENT' || !user.parentId) return;
    const parentId = user.parentId;
    demoStorageService.updateState((prev) => ({
      ...prev,
      announcements: prev.announcements.map((a) => {
        if (a.id !== announcementId) return a;
        if (a.readByParentIds.includes(parentId)) return a;
        return {
          ...a,
          readByParentIds: [...a.readByParentIds, parentId],
        };
      }),
    }));
  },

  deleteAnnouncement(user: DemoAccount, announcementId: string): void {
    const state = demoStorageService.getState();
    const target = state.announcements.find((a) => a.id === announcementId);
    if (!target) return;
    if (user.role !== 'GVCN' || user.assignedClassId !== target.classId) {
      throw new Error('Không có quyền xóa thông báo này.');
    }
    demoStorageService.updateState((prev) => ({
      ...prev,
      announcements: prev.announcements.filter((a) => a.id !== announcementId),
    }));
  },
};
