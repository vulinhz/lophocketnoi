import type { WeeklyGoal } from '../types/domain';
import { MOCK_STUDENTS } from './mockStudents';

const FEATURED_GOALS: WeeklyGoal[] = [
  {
    id: 'GOAL_7A1_1',
    studentId: 'HS7A101',
    classId: '7A1',
    weekLabel: 'Tuần 12',
    title: 'Giơ tay phát biểu hoặc trình bày ý kiến ít nhất 3 lần/tuần',
    category: 'Kỹ năng',
    progress: 70,
    isCompleted: false,
    updatedAt: '2026-11-24',
  },
  {
    id: 'GOAL_7A1_2',
    studentId: 'HS7A101',
    classId: '7A1',
    weekLabel: 'Tuần 12',
    title: 'Hoàn thành sơ đồ tư duy tổng kết 2 chương Ngữ văn',
    category: 'Học tập',
    progress: 100,
    isCompleted: true,
    updatedAt: '2026-11-23',
  },
  {
    id: 'GOAL_10A2_1',
    studentId: 'HS10A201',
    classId: '10A2',
    weekLabel: 'Tuần 12',
    title: 'Duy trì đi ngủ trước 22h30 ít nhất 5 buổi trong tuần',
    category: 'Thói quen',
    progress: 80,
    isCompleted: false,
    updatedAt: '2026-11-24',
  },
  {
    id: 'GOAL_11A1_1',
    studentId: 'HS11A101',
    classId: '11A1',
    weekLabel: 'Tuần 12',
    title: 'Ôn tập 30 phút mỗi tối thay vì dồn bài cuối tuần',
    category: 'Thói quen',
    progress: 60,
    isCompleted: false,
    updatedAt: '2026-11-24',
  },
];

const EXTRA_GOALS: WeeklyGoal[] = MOCK_STUDENTS.filter(
  (s) => !['HS7A101', 'HS10A201', 'HS11A101'].includes(s.id),
)
  .slice(0, 45)
  .map((s, idx) => ({
    id: `GOAL_${s.id}`,
    studentId: s.id,
    classId: s.classId,
    weekLabel: 'Tuần 12',
    title:
      idx % 3 === 0
        ? 'Hoàn thành 100% bài tập về nhà trước 21h00'
        : idx % 3 === 1
          ? 'Đọc sách 15 phút mỗi ngày và ghi lại 1 ý hay'
          : 'Tích cực trao đổi cùng bạn trong giờ học nhóm',
    category: idx % 3 === 0 ? 'Học tập' : idx % 3 === 1 ? 'Thói quen' : 'Kỹ năng',
    progress: idx % 2 === 0 ? 100 : 65,
    isCompleted: idx % 2 === 0,
    updatedAt: '2026-11-23',
  }));

export const MOCK_GOALS: WeeklyGoal[] = [...FEATURED_GOALS, ...EXTRA_GOALS];
