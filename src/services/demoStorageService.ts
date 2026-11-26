import type { DemoDatabaseState } from '../types/domain';
import { MOCK_CLASSES } from '../data/mockClasses';
import { MOCK_TEACHERS } from '../data/mockTeachers';
import { MOCK_STUDENTS } from '../data/mockStudents';
import { MOCK_PARENTS } from '../data/mockParents';
import { MOCK_OBSERVATIONS } from '../data/mockObservations';
import { MOCK_ASSESSMENTS } from '../data/mockAssessments';
import { MOCK_COMMENTS } from '../data/mockComments';
import { MOCK_ANNOUNCEMENTS } from '../data/mockAnnouncements';
import { MOCK_FEEDBACK } from '../data/mockFeedback';
import { MOCK_GOALS } from '../data/mockGoals';
import { MOCK_BADGES, MOCK_TASKS } from '../data/mockTasks';

const STORAGE_KEY = 'lhk_connected_classroom_demo_v1';
const DB_VERSION = 1;

type Listener = () => void;
const listeners = new Set<Listener>();

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function buildInitialDemoState(): DemoDatabaseState {
  return {
    version: DB_VERSION,
    classes: deepClone(MOCK_CLASSES),
    teachers: deepClone(MOCK_TEACHERS),
    students: deepClone(MOCK_STUDENTS),
    parents: deepClone(MOCK_PARENTS),
    observations: deepClone(MOCK_OBSERVATIONS),
    assessments: deepClone(MOCK_ASSESSMENTS),
    comments: deepClone(MOCK_COMMENTS),
    announcements: deepClone(MOCK_ANNOUNCEMENTS),
    feedbacks: deepClone(MOCK_FEEDBACK),
    goals: deepClone(MOCK_GOALS),
    tasks: deepClone(MOCK_TASKS),
    badges: deepClone(MOCK_BADGES),
    lastUpdatedAt: new Date().toISOString(),
  };
}

function isValidState(parsed: unknown): parsed is DemoDatabaseState {
  if (!parsed || typeof parsed !== 'object') return false;
  const candidate = parsed as Partial<DemoDatabaseState>;
  return (
    candidate.version === DB_VERSION &&
    Array.isArray(candidate.classes) &&
    candidate.classes.length === 5 &&
    Array.isArray(candidate.students) &&
    candidate.students.length >= 150 &&
    Array.isArray(candidate.teachers) &&
    Array.isArray(candidate.comments) &&
    Array.isArray(candidate.announcements)
  );
}

let memoryFallback: DemoDatabaseState | null = null;

export const demoStorageService = {
  getState(): DemoDatabaseState {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (isValidState(parsed)) {
          return parsed;
        }
      }
      const initial = buildInitialDemoState();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    } catch {
      if (!memoryFallback) {
        memoryFallback = buildInitialDemoState();
      }
      return memoryFallback;
    }
  },

  saveState(nextState: DemoDatabaseState): DemoDatabaseState {
    const stamped: DemoDatabaseState = {
      ...nextState,
      lastUpdatedAt: new Date().toISOString(),
    };
    memoryFallback = stamped;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stamped));
    } catch {
      // Ignore quota errors in restricted environments
    }
    listeners.forEach((fn) => fn());
    return stamped;
  },

  updateState(updater: (prev: DemoDatabaseState) => DemoDatabaseState): DemoDatabaseState {
    const current = this.getState();
    const updated = updater(current);
    return this.saveState(updated);
  },

  resetDemoData(): DemoDatabaseState {
    const fresh = buildInitialDemoState();
    return this.saveState(fresh);
  },

  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  getStorageStats() {
    const state = this.getState();
    let approxBytes = 0;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY) || '';
      approxBytes = new Blob([raw]).size;
    } catch {
      approxBytes = 0;
    }
    return {
      storageKey: STORAGE_KEY,
      approxKb: Math.round((approxBytes / 1024) * 10) / 10,
      lastUpdatedAt: state.lastUpdatedAt,
      counts: {
        classes: state.classes.length,
        students: state.students.length,
        teachers: state.teachers.length,
        observations: state.observations.length,
        comments: state.comments.length,
        announcements: state.announcements.length,
        feedbacks: state.feedbacks.length,
      },
    };
  },
};
