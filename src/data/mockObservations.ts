import type { Observation, ObservationCategory } from '../types/domain';
import { MOCK_STUDENTS } from './mockStudents';

const CATEGORY_LIST: ObservationCategory[] = [
  'Học tập',
  'Kỷ luật & Nề nếp',
  'Kỹ năng xã hội',
  'Cảm xúc & Tâm lý',
  'Hoạt động phong trào',
];

const TEMPLATES: Array<{
  category: ObservationCategory;
  sentiment: 'positive' | 'neutral' | 'attention';
  title: string;
  buildContent: (name: string, classId: string) => string;
  tags: string[];
}> = [
  {
    category: 'Học tập',
    sentiment: 'positive',
    title: 'Chủ động trình bày lời giải trước nhóm',
    buildContent: (name, classId) =>
      `${name} (${classId}) đã chủ động giải thích cách tiếp cận bài tập mới cho 3 bạn cùng bàn, ghi chép sơ đồ ý mạch lạc.`,
    tags: ['Tự học', 'Tư duy'],
  },
  {
    category: 'Kỹ năng xã hội',
    sentiment: 'positive',
    title: 'Hỗ trợ bạn hoàn thành nhiệm vụ trực nhật và thảo luận',
    buildContent: (name) =>
      `${name} giữ thái độ hòa nhã khi làm việc nhóm, biết lắng nghe ý kiến khác biệt và phân công việc hợp lý.`,
    tags: ['Hợp tác', 'Lắng nghe'],
  },
  {
    category: 'Kỷ luật & Nề nếp',
    sentiment: 'neutral',
    title: 'Duy trì đi học đúng giờ, cần sắp xếp vở ghi gọn hơn',
    buildContent: (name) =>
      `${name} đi học chuyên cần suốt tuần nhưng cuối buổi còn vội khi chép dặn dò, GVCN đã nhắc dùng sổ tay ghi chú.`,
    tags: ['Nề nếp', 'Ghi chú'],
  },
  {
    category: 'Cảm xúc & Tâm lý',
    sentiment: 'attention',
    title: 'Có biểu hiện mệt mỏi vào các tiết cuối buổi chiều',
    buildContent: (name) =>
      `${name} có phần trầm lắng hơn thường lệ vào tiết 4–5. Khi trao đổi riêng, em chia sẻ tối qua thức khuya ôn bài.`,
    tags: ['Sức khỏe', 'Cần đồng hành'],
  },
  {
    category: 'Hoạt động phong trào',
    sentiment: 'positive',
    title: 'Tham gia tích cực chuẩn bị bảng tin tuần của lớp',
    buildContent: (name, classId) =>
      `${name} đóng góp 2 bài viết ngắn và trình bày góc đọc sách của lớp ${classId} rất gọn gàng, sáng tạo.`,
    tags: ['Phong trào', 'Sáng tạo'],
  },
  {
    category: 'Học tập',
    sentiment: 'attention',
    title: 'Cần rà soát lại phần bài tập về nhà bị sót',
    buildContent: (name) =>
      `${name} còn thiếu 2 bài luyện tập cuối chương. GVCN đã hẹn em ở lại 15 phút giờ ra chơi để hướng dẫn cách lập kế hoạch.`,
    tags: ['Bài tập', 'Theo dõi'],
  },
];

const FEATURED_OBSERVATIONS: Observation[] = [
  {
    id: 'OBS_FEAT_01',
    studentId: 'HS7A101',
    classId: '7A1',
    teacherId: 'GV_7A1',
    category: 'Học tập',
    sentiment: 'positive',
    title: 'Tự tin điều phối phần thảo luận Toán – Tin học',
    content:
      'Nguyễn Minh An chủ động lập bảng phân công cho nhóm 4 bạn và đặt 2 câu hỏi phản biện rất sát trọng tâm bài học.',
    observedAt: '2026-11-23',
    tags: ['Thảo luận', 'Tư duy logic'],
  },
  {
    id: 'OBS_FEAT_02',
    studentId: 'HS7A101',
    classId: '7A1',
    teacherId: 'GV_7A1',
    category: 'Kỹ năng xã hội',
    sentiment: 'neutral',
    title: 'Đang cải thiện tốc độ nói khi thuyết trình trước lớp',
    content:
      'Minh An chuẩn bị nội dung đầy đủ nhưng đoạn đầu còn hơi hồi hộp. Sau khi được lớp vỗ tay động viên, em trình bày rõ ràng hơn hẳn.',
    observedAt: '2026-11-18',
    tags: ['Thuyết trình', 'Tự tin'],
  },
  {
    id: 'OBS_FEAT_03',
    studentId: 'HS10A201',
    classId: '10A2',
    teacherId: 'GV_10A2',
    category: 'Hoạt động phong trào',
    sentiment: 'positive',
    title: 'Hoàn thành xuất sắc phần dẫn chương trình tiếng Anh đầu giờ',
    content:
      'Trần Bảo Ngọc phát âm tự nhiên, biết kết nối các bạn ít nói trong tổ cùng tham gia trò chơi khởi động 5 phút.',
    observedAt: '2026-11-22',
    tags: ['Tiếng Anh', 'Kết nối'],
  },
  {
    id: 'OBS_FEAT_04',
    studentId: 'HS11A101',
    classId: '11A1',
    teacherId: 'GV_11A1',
    category: 'Cảm xúc & Tâm lý',
    sentiment: 'attention',
    title: 'Tự đặt áp lực cao trước kỳ kiểm tra giữa học kỳ',
    content:
      'Lê Hoàng Phúc có điểm thực hành Vật lý tốt (8.5) nhưng lo lắng vì bài kiểm tra 15 phút chưa đạt mức em kỳ vọng. Thầy đã trao đổi riêng để em giảm bớt căng thẳng.',
    observedAt: '2026-11-24',
    tags: ['Tâm lý', 'Áp lực học tập'],
  },
  {
    id: 'OBS_FEAT_05',
    studentId: 'HS11A101',
    classId: '11A1',
    teacherId: 'GV_11A1',
    category: 'Học tập',
    sentiment: 'positive',
    title: 'Nhiệt tình hướng dẫn mô hình mạch điện cho tổ 2',
    content:
      'Trong tiết thực hành STEM, Hoàng Phúc kiên nhẫn kiểm tra lại từng mối nối giúp nhóm hoàn thành mô hình sớm nhất lớp.',
    observedAt: '2026-11-19',
    tags: ['STEM', 'Kiên trì'],
  },
];

const generatedObservations: Observation[] = [];
const DATES = ['2026-11-24', '2026-11-22', '2026-11-20', '2026-11-18', '2026-11-15', '2026-11-12'];

MOCK_STUDENTS.forEach((student, idx) => {
  // Give every student 1-2 varied observations (approx 210+ total)
  const tpl1 = student.needsAttention
    ? TEMPLATES[idx % 2 === 0 ? 3 : 5]
    : TEMPLATES[idx % 3 === 0 ? 0 : idx % 3 === 1 ? 1 : 4];

  generatedObservations.push({
    id: `OBS_${student.id}_1`,
    studentId: student.id,
    classId: student.classId,
    teacherId: `GV_${student.classId}`,
    category: tpl1.category,
    sentiment: tpl1.sentiment,
    title: tpl1.title,
    content: tpl1.buildContent(student.fullName, student.classId),
    observedAt: DATES[idx % DATES.length],
    tags: tpl1.tags,
  });

  if (idx % 2 === 0) {
    const tpl2 = TEMPLATES[(idx + 2) % TEMPLATES.length];
    generatedObservations.push({
      id: `OBS_${student.id}_2`,
      studentId: student.id,
      classId: student.classId,
      teacherId: `GV_${student.classId}`,
      category: CATEGORY_LIST[(idx + 1) % CATEGORY_LIST.length],
      sentiment: tpl2.sentiment,
      title: tpl2.title,
      content: tpl2.buildContent(student.fullName, student.classId),
      observedAt: DATES[(idx + 3) % DATES.length],
      tags: tpl2.tags,
    });
  }
});

export const MOCK_OBSERVATIONS: Observation[] = [
  ...FEATURED_OBSERVATIONS,
  ...generatedObservations,
];
