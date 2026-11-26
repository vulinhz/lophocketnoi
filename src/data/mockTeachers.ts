import type { Teacher } from '../types/domain';

export const FEMALE_TEACHER_AVATAR =
  '/src/assets/images/teacher_avatar_female_1795630135097.jpg';
export const MALE_TEACHER_AVATAR =
  '/src/assets/images/teacher_avatar_male_1795630135627.jpg';
export const CLASSROOM_BANNER_IMAGE =
  '/src/assets/images/classroom_hero_banner_1795630135281.jpg';
export const EFFORT_BADGE_IMAGE =
  '/src/assets/images/effort_badge_emblem_1795630135931.jpg';

export const MOCK_TEACHERS: Teacher[] = [
  {
    id: 'GV_7A1',
    fullName: 'Cô Nguyễn Thị Minh Thu',
    email: 'teacher7a1@hpu2.it',
    subject: 'Ngữ văn',
    phone: '0912 345 701',
    gender: 'female',
    avatarUrl: FEMALE_TEACHER_AVATAR,
    assignedClassId: '7A1',
    yearsExperience: 9,
    bio: 'Chú trọng nuôi dưỡng thói quen đọc hiểu và khả năng diễn đạt cảm xúc tích cực cho học sinh lớp 7.',
  },
  {
    id: 'GV_7A3',
    fullName: 'Thầy Trần Quốc Hùng',
    email: 'teacher7a3@dhpu2.it',
    subject: 'Toán học',
    phone: '0912 345 703',
    gender: 'male',
    avatarUrl: MALE_TEACHER_AVATAR,
    assignedClassId: '7A3',
    yearsExperience: 11,
    bio: 'Đồng hành sát sao từng nhóm học tập, giúp học sinh rèn tư duy logic và kỷ luật tự giác.',
  },
  {
    id: 'GV_10A2',
    fullName: 'Cô Phạm Lan Anh',
    email: 'teacher10a2@hpu2.it',
    subject: 'Tiếng Anh',
    phone: '0912 345 002',
    gender: 'female',
    avatarUrl: FEMALE_TEACHER_AVATAR,
    assignedClassId: '10A2',
    yearsExperience: 8,
    bio: 'Hỗ trợ học sinh chuyển cấp từ THCS lên THPT vững tâm lý và xây dựng kế hoạch tự học khoa học.',
  },
  {
    id: 'GV_11A1',
    fullName: 'Thầy Lê Đức Mạnh',
    email: 'teacher11a1@hpu2.it',
    subject: 'Vật lý',
    phone: '0912 345 101',
    gender: 'male',
    avatarUrl: MALE_TEACHER_AVATAR,
    assignedClassId: '11A1',
    yearsExperience: 13,
    bio: 'Định hướng học sinh lớp 11 phát triển năng lực nghiên cứu STEM và quản lý áp lực thi cử lành mạnh.',
  },
  {
    id: 'GV_11A2',
    fullName: 'Cô Vũ Thanh Hương',
    email: 'teacher11a2@hpu2.it',
    subject: 'Lịch sử & GDKT-PL',
    phone: '0912 345 102',
    gender: 'female',
    avatarUrl: FEMALE_TEACHER_AVATAR,
    assignedClassId: '11A2',
    yearsExperience: 10,
    bio: 'Tạo môi trường lớp học cởi mở, lắng nghe tiếng nói học sinh và phối hợp nhịp nhàng cùng gia đình.',
  },
];
