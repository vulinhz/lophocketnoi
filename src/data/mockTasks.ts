import type { EffortBadge, StudentTask } from '../types/domain';
import { MOCK_STUDENTS } from './mockStudents';

export const MOCK_BADGES: EffortBadge[] = [
  {
    id: 'BDG_STEADY',
    name: 'Nhịp học bền bỉ',
    description: 'Hoàn thành đủ nhiệm vụ học tập liên tiếp 2 tuần.',
    criteria: 'Chuyên cần ≥ 95% và không trễ hạn bài tập.',
    tone: 'teal',
  },
  {
    id: 'BDG_TEAMWORK',
    name: 'Bạn đồng hành tin cậy',
    description: 'Chủ động lắng nghe, chia sẻ và hỗ trợ bạn trong hoạt động nhóm.',
    criteria: 'Được GVCN ghi nhận tích cực ở kỹ năng xã hội.',
    tone: 'sky',
  },
  {
    id: 'BDG_READING',
    name: 'Người giữ lửa đọc sách',
    description: 'Duy trì thói quen đọc và tóm tắt ý chính mỗi tuần.',
    criteria: 'Hoàn thành nhật ký đọc tuần.',
    tone: 'emerald',
  },
  {
    id: 'BDG_CREATIVE',
    name: 'Tư duy sáng tạo',
    description: 'Đưa ra cách trình bày hoặc giải pháp mới mẻ trong bài học.',
    criteria: 'Có sản phẩm/bài thuyết trình nổi bật.',
    tone: 'amber',
  },
  {
    id: 'BDG_PERSIST',
    name: 'Vượt khó kiên trì',
    description: 'Nỗ lực tự cải thiện ở môn học hoặc kỹ năng còn bỡ ngỡ.',
    criteria: 'Tự đánh giá đều đặn và hoàn thành kế hoạch khắc phục.',
    tone: 'amber',
  },
  {
    id: 'BDG_SELF_REFLECT',
    name: 'Tự soi chiếu tích cực',
    description: 'Hoàn thành tự đánh giá tuần trung thực, rõ mục tiêu cải thiện.',
    criteria: 'Nộp phiếu tự đánh giá đúng hạn.',
    tone: 'teal',
  },
];

const FEATURED_TASKS: StudentTask[] = [
  {
    id: 'TSK_7A1_1',
    studentId: 'HS7A101',
    classId: '7A1',
    title: 'Hoàn thành sơ đồ tư duy bài "Văn bản nghị luận xã hội"',
    subjectOrArea: 'Ngữ văn',
    dueDate: '2026-11-26',
    isCompleted: true,
    points: 20,
  },
  {
    id: 'TSK_7A1_2',
    studentId: 'HS7A101',
    classId: '7A1',
    title: 'Tập nói 3 phút trước gương chủ đề sách yêu thích',
    subjectOrArea: 'Kỹ năng mềm',
    dueDate: '2026-11-27',
    isCompleted: false,
    points: 15,
  },
  {
    id: 'TSK_7A1_3',
    studentId: 'HS7A101',
    classId: '7A1',
    title: 'Rà soát 5 bài tập Hình học chương Tam giác',
    subjectOrArea: 'Toán học',
    dueDate: '2026-11-28',
    isCompleted: false,
    points: 20,
  },
  {
    id: 'TSK_10A2_1',
    studentId: 'HS10A201',
    classId: '10A2',
    title: 'Soạn 5 câu hỏi giao lưu bằng tiếng Anh cho buổi hướng nghiệp',
    subjectOrArea: 'Tiếng Anh',
    dueDate: '2026-11-27',
    isCompleted: true,
    points: 20,
  },
  {
    id: 'TSK_10A2_2',
    studentId: 'HS10A201',
    classId: '10A2',
    title: 'Lập thời khóa biểu tự học tuần 13 cân đối Toán – Văn – Anh',
    subjectOrArea: 'Tự học',
    dueDate: '2026-11-28',
    isCompleted: false,
    points: 15,
  },
  {
    id: 'TSK_11A1_1',
    studentId: 'HS11A101',
    classId: '11A1',
    title: 'Hoàn thiện phiếu báo cáo thực hành mạch điện STEM',
    subjectOrArea: 'Vật lý',
    dueDate: '2026-11-26',
    isCompleted: true,
    points: 25,
  },
  {
    id: 'TSK_11A1_2',
    studentId: 'HS11A101',
    classId: '11A1',
    title: 'Thực hành bài tập hít thở & tắt màn hình lúc 22h15 trong 3 ngày',
    subjectOrArea: 'Sức khỏe học đường',
    dueDate: '2026-11-28',
    isCompleted: false,
    points: 20,
  },
];

const EXTRA_TASKS: StudentTask[] = MOCK_STUDENTS.filter(
  (s) => !['HS7A101', 'HS10A201', 'HS11A101'].includes(s.id),
)
  .slice(0, 40)
  .map((s, idx) => ({
    id: `TSK_${s.id}`,
    studentId: s.id,
    classId: s.classId,
    title:
      idx % 2 === 0
        ? 'Hoàn thành phiếu bài tập củng cố cuối tuần'
        : 'Nộp phiếu tự đánh giá và đặt 1 mục tiêu tuần mới',
    subjectOrArea: idx % 2 === 0 ? 'Chuyên môn' : 'Kỹ năng tự học',
    dueDate: '2026-11-28',
    isCompleted: idx % 3 === 0,
    points: 15,
  }));

export const MOCK_TASKS: StudentTask[] = [...FEATURED_TASKS, ...EXTRA_TASKS];
