import type { Announcement } from '../types/domain';
import { MOCK_STUDENTS } from './mockStudents';

function getParentIdsForClass(classId: string, count: number): string[] {
  return MOCK_STUDENTS.filter((s) => s.classId === classId)
    .slice(0, count)
    .map((s) => s.parentId);
}

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ANN_7A1_01',
    classId: '7A1',
    teacherId: 'GV_7A1',
    title: 'Kế hoạch Tuần 13 & Chuyên đề Sơ đồ tư duy môn Ngữ văn',
    content:
      'Kính gửi quý phụ huynh lớp 7A1, tuần tới lớp triển khai hoạt động "15 phút đọc sách đầu giờ" và hướng dẫn học sinh lập sơ đồ tư duy ôn tập giữa kỳ. Kính nhờ phụ huynh nhắc con mang đủ sách đọc cá nhân vào sáng thứ Hai và duy trì giờ ngủ trước 22h30.',
    category: 'Học tập',
    status: 'PUBLISHED',
    isAiGenerated: false,
    aiSource: 'manual',
    createdAt: '2026-11-22T08:00:00Z',
    publishedAt: '2026-11-22T09:30:00Z',
    readByParentIds: getParentIdsForClass('7A1', 25),
    targetParentCount: 30,
  },
  {
    id: 'ANN_7A1_02',
    classId: '7A1',
    teacherId: 'GV_7A1',
    title: 'Lịch gặp gỡ trao đổi trực tuyến phụ huynh giữa học kỳ I',
    content:
      'Kính mời quý phụ huynh đăng ký khung giờ trao đổi 1-1 (10 phút/gia đình) vào tối thứ Sáu tuần sau để cùng GVCN nắm bắt tiến độ học tập và tâm lý của từng con.',
    category: 'Phối hợp phụ huynh',
    status: 'DRAFT',
    isAiGenerated: true,
    aiSource: 'mock-ai',
    createdAt: '2026-11-24T11:00:00Z',
    readByParentIds: [],
    targetParentCount: 30,
  },
  {
    id: 'ANN_7A3_01',
    classId: '7A3',
    teacherId: 'GV_7A3',
    title: 'Nhắc nhở hoàn thành phiếu ôn tập Hình học & Nề nếp đầu giờ',
    content:
      'Kính gửi phụ huynh lớp 7A3, thầy Hùng gửi thông báo lịch ôn tập nhóm vào tiết sinh hoạt thứ Sáu. Các con cần hoàn thành 5 bài tập cơ bản trong phiếu tự học để có thời gian chữa bài trực tiếp trên lớp.',
    category: 'Nhắc nhở tuần',
    status: 'PUBLISHED',
    isAiGenerated: false,
    aiSource: 'manual',
    createdAt: '2026-11-21T16:00:00Z',
    publishedAt: '2026-11-21T17:15:00Z',
    readByParentIds: getParentIdsForClass('7A3', 22),
    targetParentCount: 30,
  },
  {
    id: 'ANN_10A2_01',
    classId: '10A2',
    teacherId: 'GV_10A2',
    title: 'Tổng kết Tuần 12 & Lịch tham quan hướng nghiệp khối 10',
    content:
      'Chúc mừng tập thể 10A2 tuần vừa qua đạt tỷ lệ chuyên cần 97%. Sáng thứ Năm tuần tới, lớp tham gia buổi trải nghiệm hướng nghiệp tại hội trường lớn, đề nghị các em mặc đồng phục chỉnh tề và mang theo sổ ghi chép.',
    category: 'Sự kiện lớp',
    status: 'PUBLISHED',
    isAiGenerated: false,
    aiSource: 'manual',
    createdAt: '2026-11-22T10:00:00Z',
    publishedAt: '2026-11-22T10:45:00Z',
    readByParentIds: getParentIdsForClass('10A2', 27),
    targetParentCount: 30,
  },
  {
    id: 'ANN_11A1_01',
    classId: '11A1',
    teacherId: 'GV_11A1',
    title: 'Đồng hành cùng học sinh lớp 11 giữ cân bằng trước kỳ thi giữa kỳ',
    content:
      'Kính gửi quý phụ huynh lớp 11A1, tuần qua một số em có biểu hiện thức khuya ôn bài dẫn tới mệt mỏi vào tiết chiều. Thầy Mạnh kính mong gia đình phối hợp nhắc nhở các con nghỉ ngơi điều độ, tránh dồn lịch học quá muộn.',
    category: 'Phối hợp phụ huynh',
    status: 'PUBLISHED',
    isAiGenerated: true,
    aiSource: 'mock-ai',
    createdAt: '2026-11-23T19:00:00Z',
    publishedAt: '2026-11-23T20:00:00Z',
    readByParentIds: getParentIdsForClass('11A1', 24),
    targetParentCount: 30,
  },
  {
    id: 'ANN_11A2_01',
    classId: '11A2',
    teacherId: 'GV_11A2',
    title: 'Chuẩn bị chuyên đề Thuyết trình phản biện môn GDKT & PL',
    content:
      'Thông báo tới các em học sinh và phụ huynh lớp 11A2 về lịch bốc thăm chủ đề thuyết trình nhóm tuần 13. Các nhóm nộp đề cương tóm tắt chậm nhất vào tối thứ Tư.',
    category: 'Học tập',
    status: 'PUBLISHED',
    isAiGenerated: false,
    aiSource: 'manual',
    createdAt: '2026-11-22T15:00:00Z',
    publishedAt: '2026-11-22T16:10:00Z',
    readByParentIds: getParentIdsForClass('11A2', 26),
    targetParentCount: 30,
  },
];
