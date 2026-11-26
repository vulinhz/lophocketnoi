import type { SelfAssessment } from '../types/domain';
import { MOCK_STUDENTS } from './mockStudents';

const MOODS: SelfAssessment['mood'][] = [
  'Hào hứng',
  'Ổn định',
  'Cần hỗ trợ',
  'Hơi căng thẳng',
];

const WINS = [
  'Hoàn thành toàn bộ bài tập Toán trước tối thứ Sáu.',
  'Đã chủ động giơ tay phát biểu 3 lần trong tuần.',
  'Ghi chép bài Ngữ văn bằng sơ đồ cây dễ ôn tập hơn.',
  'Phối hợp với nhóm hoàn thành poster dự án đúng hạn.',
  'Giữ được thói quen đi ngủ trước 22h30 trong 4 ngày liên tiếp.',
  'Ôn lại được 2 chuyên đề Tiếng Anh còn yếu.',
];

const CHALLENGES = [
  'Đôi lúc còn mất tập trung khi học bài buổi tối.',
  'Phần bài đọc hiểu dài mất nhiều thời gian xử lý.',
  'Còn hơi ngại khi phải nói trước đông bạn.',
  'Lịch học thêm và bài tập cuối tuần hơi dày.',
  'Thỉnh thoảng tính nhầm dấu ở bài biến đổi đại số.',
  'Chưa quen tự tóm tắt kiến thức sau mỗi tiết học.',
];

const SUPPORTS = [
  'Mong thầy cô gợi ý thêm 2 bài tập mẫu để tự luyện.',
  'Nhờ ba mẹ nhắc giờ nghỉ mắt và không xem điện thoại sau 21h30.',
  'Em muốn được ngồi cùng bạn có thế mạnh môn Tiếng Anh để trao đổi thêm.',
  'Hiện tại em thấy ổn, chỉ cần duy trì lịch học như tuần này.',
  'Em cần cô hướng dẫn lại phần lập dàn ý bài nghị luận.',
];

export const MOCK_ASSESSMENTS: SelfAssessment[] = MOCK_STUDENTS.filter(
  (_s, idx) => idx % 5 !== 4, // ~80% completion rate so dashboards show realistic completion metrics
).map((student, idx) => {
  const mood = student.needsAttention
    ? idx % 2 === 0
      ? 'Hơi căng thẳng'
      : 'Cần hỗ trợ'
    : MOODS[idx % 2];
  return {
    id: `ASM_${student.id}_W12`,
    studentId: student.id,
    classId: student.classId,
    weekLabel: 'Tuần 12 (18/11 - 24/11)',
    submittedAt: `2026-11-${22 + (idx % 3)}`,
    mood,
    focusScore: student.needsAttention ? 3 : 4 + (idx % 2),
    studyHoursPerDay: student.classId.startsWith('1') ? 2.5 + (idx % 3) * 0.5 : 1.5 + (idx % 3) * 0.5,
    weeklyWin: WINS[idx % WINS.length],
    challenge: CHALLENGES[idx % CHALLENGES.length],
    supportNeeded: SUPPORTS[idx % SUPPORTS.length],
  };
});
