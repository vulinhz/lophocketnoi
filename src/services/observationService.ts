import type {
  ClassId,
  DemoAccount,
  Observation,
  ObservationCategory,
} from '../types/domain';
import { demoStorageService } from './demoStorageService';

export const observationService = {
  getAccessibleObservations(user: DemoAccount): Observation[] {
    const { observations } = demoStorageService.getState();
    const sorted = [...observations].sort((a, b) =>
      b.observedAt.localeCompare(a.observedAt),
    );
    if (user.role === 'ADMIN') return sorted;
    if (user.role === 'GVCN') {
      return sorted.filter((o) => o.classId === user.assignedClassId);
    }
    if (user.role === 'PARENT' || user.role === 'STUDENT') {
      // Parents/students only see published comments, not private teacher raw notes
      return [];
    }
    return [];
  },

  getObservationsForStudent(user: DemoAccount, studentId: string): Observation[] {
    return this.getAccessibleObservations(user).filter(
      (o) => o.studentId === studentId,
    );
  },

  addObservation(
    user: DemoAccount,
    payload: {
      studentId: string;
      classId: ClassId;
      category: ObservationCategory;
      sentiment: 'positive' | 'neutral' | 'attention';
      title: string;
      content: string;
      observedAt: string;
      tags: string[];
    },
  ): Observation {
    if (user.role !== 'GVCN' || user.assignedClassId !== payload.classId) {
      throw new Error('Chỉ GVCN phụ trách lớp mới được thêm nhật ký quan sát.');
    }
    const created: Observation = {
      id: `OBS_${Date.now()}`,
      studentId: payload.studentId,
      classId: payload.classId,
      teacherId: user.teacherId ?? `GV_${payload.classId}`,
      category: payload.category,
      sentiment: payload.sentiment,
      title: payload.title.trim(),
      content: payload.content.trim(),
      observedAt: payload.observedAt,
      tags: payload.tags,
    };
    demoStorageService.updateState((prev) => ({
      ...prev,
      observations: [created, ...prev.observations],
    }));
    return created;
  },

  updateObservation(
    user: DemoAccount,
    observationId: string,
    patch: Partial<
      Pick<Observation, 'category' | 'sentiment' | 'title' | 'content' | 'observedAt' | 'tags'>
    >,
  ): Observation {
    const state = demoStorageService.getState();
    const target = state.observations.find((o) => o.id === observationId);
    if (!target) throw new Error('Không tìm thấy nhật ký quan sát.');
    if (user.role !== 'GVCN' || user.assignedClassId !== target.classId) {
      throw new Error('Bạn không có quyền chỉnh sửa nhật ký của lớp này.');
    }
    let updated!: Observation;
    demoStorageService.updateState((prev) => ({
      ...prev,
      observations: prev.observations.map((o) => {
        if (o.id !== observationId) return o;
        updated = { ...o, ...patch };
        return updated;
      }),
    }));
    return updated;
  },

  deleteObservation(user: DemoAccount, observationId: string): void {
    const state = demoStorageService.getState();
    const target = state.observations.find((o) => o.id === observationId);
    if (!target) return;
    if (user.role !== 'GVCN' || user.assignedClassId !== target.classId) {
      throw new Error('Bạn không có quyền xóa nhật ký của lớp này.');
    }
    demoStorageService.updateState((prev) => ({
      ...prev,
      observations: prev.observations.filter((o) => o.id !== observationId),
    }));
  },
};
