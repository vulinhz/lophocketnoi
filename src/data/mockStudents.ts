import type { AvatarPalette, ClassId, Student } from '../types/domain';

const CLASS_ORDER: ClassId[] = ['7A1', '7A3', '10A2', '11A1', '11A2'];

const BIRTH_YEAR_BY_CLASS: Record<ClassId, number> = {
  '7A1': 2014,
  '7A3': 2014,
  '10A2': 2011,
  '11A1': 2010,
  '11A2': 2010,
};

const LAST_NAMES = [
  'Nguyễn',
  'Trần',
  'Lê',
  'Phạm',
  'Hoàng',
  'Huỳnh',
  'Phan',
  'Vũ',
  'Võ',
  'Đặng',
  'Bùi',
  'Đỗ',
  'Hồ',
  'Ngô',
  'Dương',
  'Lý',
  'Đinh',
  'Trịnh',
  'Tạ',
  'Lương',
];

const MALE_MIDDLES = [
  'Minh',
  'Hoàng',
  'Gia',
  'Đức',
  'Quốc',
  'Anh',
  'Tuấn',
  'Bảo',
  'Hải',
  'Nhật',
  'Khánh',
  'Trung',
  'Thanh',
  'Văn',
  'Thành',
];

const MALE_FIRSTS = [
  'An',
  'Khang',
  'Phúc',
  'Long',
  'Huy',
  'Duy',
  'Khoa',
  'Nam',
  'Quân',
  'Tùng',
  'Đạt',
  'Hưng',
  'Bình',
  'Cường',
  'Kiên',
  'Vinh',
  'Sơn',
  'Thịnh',
  'Phong',
  'Lâm',
];

const FEMALE_MIDDLES = [
  'Ngọc',
  'Bảo',
  'Minh',
  'Phương',
  'Thảo',
  'Khánh',
  'Gia',
  'Thanh',
  'Quỳnh',
  'Thu',
  'Hà',
  'Tú',
  'Yến',
  'Lan',
  'Mai',
];

const FEMALE_FIRSTS = [
  'Anh',
  'Ngọc',
  'Linh',
  'Vy',
  'Chi',
  'Nhi',
  'My',
  'Trang',
  'Hân',
  'Giang',
  'Tiên',
  'Quỳnh',
  'Thư',
  'Châu',
  'Diệp',
  'Hà',
  'Hương',
  'Ngân',
  'Uyên',
  'Băng',
];

const AVATAR_PALETTES: AvatarPalette[] = [
  { bg: '#CCFBF1', fg: '#0F766E', accent: '#14B8A6' },
  { bg: '#E0F2FE', fg: '#0369A1', accent: '#0EA5E9' },
  { bg: '#FEF3C7', fg: '#B45309', accent: '#F59E0B' },
  { bg: '#EDE9FE', fg: '#6D28D9', accent: '#8B5CF6' },
  { bg: '#DCFCE7', fg: '#15803D', accent: '#22C55E' },
  { bg: '#FFE4E6', fg: '#BE123C', accent: '#F43F5E' },
  { bg: '#F1F5F9', fg: '#334155', accent: '#64748B' },
];

const STRENGTH_POOL = [
  'Tư duy logic rõ ràng',
  'Chủ động phát biểu xây dựng bài',
  'Hợp tác nhóm hiệu quả',
  'Ghi chép bài khoa học',
  'Biết lắng nghe và hỗ trợ bạn',
  'Sáng tạo trong bài thuyết trình',
  'Hoàn thành nhiệm vụ đúng hạn',
  'Tinh thần cầu thị cao',
  'Khả năng tự đọc hiểu tài liệu tốt',
  'Giữ gìn nề nếp lớp nghiêm túc',
  'Kiên trì khi gặp bài tập khó',
  'Giao tiếp lễ phép, chừng mực',
];

const FOCUS_POOL = [
  'Tăng tốc độ làm bài kiểm tra viết',
  'Mạnh dạn hơn khi trình bày trước lớp',
  'Kiểm tra kỹ bước tính trước khi nộp bài',
  'Duy trì lịch ôn tập đều đặn cuối tuần',
  'Giảm sao nhãng bởi thiết bị điện tử buổi tối',
  'Chủ động đặt câu hỏi khi chưa hiểu bài',
  'Phân bổ thời gian đều giữa các môn',
  'Tăng cường luyện viết đoạn văn lập luận',
  'Giữ nhịp nghỉ ngơi và ngủ đủ giấc',
  'Tham gia thêm hoạt động trao đổi nhóm nhỏ',
];

const INTEREST_POOL = [
  'Cờ vua',
  'Bóng đá',
  'Cầu lông',
  'Vẽ minh họa',
  'Đọc sách khoa học',
  'Lập trình Scratch/Python',
  'Âm nhạc acoustic',
  'Nhiếp ảnh',
  'CLB Tiếng Anh',
  'Bơi lội',
  'Thuyết trình',
  'Nghiên cứu STEM',
];

const PERSONALITY_NOTES = [
  'Điềm đạm, tiếp thu chắc chắn và thường kiểm tra kỹ bài trước khi phát biểu.',
  'Nhiệt tình trong hoạt động tập thể, dễ kết nối bạn mới và giàu năng lượng tích cực.',
  'Tỉ mỉ, yêu thích tự tìm tòi sâu các chủ đề khoa học tự nhiên và công nghệ.',
  'Nhạy cảm với góp ý, tiến bộ rất nhanh khi được khích lệ đúng lúc và ghi nhận cụ thể.',
  'Có tố chất điều phối nhóm, biết phân chia công việc công bằng cho các thành viên.',
  'Trầm tính nhưng quan sát tinh tế, thường đưa ra góc nhìn sâu sắc trong giờ thảo luận.',
  'Ham học hỏi, thích đặt câu hỏi mở rộng và kết nối kiến thức với thực tiễn đời sống.',
  'Nề nếp ổn định, biết giữ lời hứa và có ý thức tự giác hoàn thành kế hoạch tuần.',
];

const ATTENTION_REASONS = [
  'Chưa hoàn thành đủ bài tập về nhà 2 tuần gần đây',
  'Giảm tập trung vào tiết cuối buổi chiều, cần theo dõi giấc ngủ',
  'Còn rụt rè khi trao đổi nhóm, ít tương tác trên lớp',
  'Điểm kiểm tra giữa kỳ môn Toán giảm nhẹ so với đầu học kỳ',
  'Nghỉ 2 buổi vì ốm, cần hỗ trợ củng cố phần kiến thức đã qua',
  'Có dấu hiệu căng thẳng trước kỳ kiểm tra định kỳ',
];

const FEATURED_DEMO_STUDENTS: Record<
  string,
  {
    fullName: string;
    gender: 'Nam' | 'Nữ';
    birthDate: string;
    parentId: string;
    parentName: string;
    parentPhone: string;
    gpa: number;
    conduct: 'Tốt' | 'Khá' | 'Đạt';
    attendanceRate: number;
    needsAttention: boolean;
    attentionReason?: string;
    strengths: string[];
    focusAreas: string[];
    interests: string[];
    personalityNote: string;
    badgeIds: string[];
    effortPoints: number;
  }
> = {
  HS7A101: {
    fullName: 'Nguyễn Minh An',
    gender: 'Nam',
    birthDate: '2014-05-14',
    parentId: 'PH_01',
    parentName: 'Chị Lê Thị Thanh Mai',
    parentPhone: '0904 118 201',
    gpa: 8.6,
    conduct: 'Tốt',
    attendanceRate: 98,
    needsAttention: false,
    strengths: ['Tư duy logic rõ ràng', 'Hợp tác nhóm hiệu quả', 'Hoàn thành nhiệm vụ đúng hạn'],
    focusAreas: ['Mạnh dạn hơn khi trình bày trước lớp', 'Kiểm tra kỹ bước tính trước khi nộp bài'],
    interests: ['Cờ vua', 'Lập trình Scratch/Python', 'Cầu lông'],
    personalityNote:
      'Chăm chỉ, tiếp thu nhanh môn Toán và Tin học; gần đây bắt đầu tự tin hơn khi nhận vai trò thư ký nhóm.',
    badgeIds: ['BDG_STEADY', 'BDG_TEAMWORK', 'BDG_READING'],
    effortPoints: 145,
  },
  HS10A201: {
    fullName: 'Trần Bảo Ngọc',
    gender: 'Nữ',
    birthDate: '2011-08-22',
    parentId: 'PH_02',
    parentName: 'Anh Trần Văn Khánh',
    parentPhone: '0904 228 302',
    gpa: 8.9,
    conduct: 'Tốt',
    attendanceRate: 97,
    needsAttention: false,
    strengths: ['Sáng tạo trong bài thuyết trình', 'Khả năng tự đọc hiểu tài liệu tốt', 'Biết lắng nghe và hỗ trợ bạn'],
    focusAreas: ['Phân bổ thời gian đều giữa các môn', 'Giữ nhịp nghỉ ngơi và ngủ đủ giấc'],
    interests: ['CLB Tiếng Anh', 'Vẽ minh họa', 'Thuyết trình'],
    personalityNote:
      'Thích nghi nhanh với môi trường THPT, nổi bật ở các bài thuyết trình song ngữ và tích cực hỗ trợ bạn cùng bàn.',
    badgeIds: ['BDG_CREATIVE', 'BDG_STEADY', 'BDG_SELF_REFLECT'],
    effortPoints: 160,
  },
  HS11A101: {
    fullName: 'Lê Hoàng Phúc',
    gender: 'Nam',
    birthDate: '2010-03-09',
    parentId: 'PH_03',
    parentName: 'Chị Phạm Thu Hà',
    parentPhone: '0904 338 401',
    gpa: 7.4,
    conduct: 'Khá',
    attendanceRate: 92,
    needsAttention: true,
    attentionReason: 'Có dấu hiệu căng thẳng trước kỳ kiểm tra định kỳ và thiếu ngủ nhẹ',
    strengths: ['Kiên trì khi gặp bài tập khó', 'Tinh thần cầu thị cao'],
    focusAreas: ['Giữ nhịp nghỉ ngơi và ngủ đủ giấc', 'Chủ động đặt câu hỏi khi chưa hiểu bài'],
    interests: ['Nghiên cứu STEM', 'Bóng đá', 'Đọc sách khoa học'],
    personalityNote:
      'Có năng lực thực hành Vật lý tốt nhưng đôi lúc tự tạo áp lực cao về điểm số; cần được đồng hành để cân bằng lịch học.',
    badgeIds: ['BDG_PERSIST'],
    effortPoints: 112,
  },
};

function padTwo(num: number): string {
  return num < 10 ? `0${num}` : `${num}`;
}

function generateStudentsForClass(classId: ClassId, classIdx: number): Student[] {
  const result: Student[] = [];
  const usedNames = new Set<string>();
  const birthYear = BIRTH_YEAR_BY_CLASS[classId];

  for (let i = 1; i <= 30; i++) {
    const studentCode = `HS${classId}${padTwo(i)}`;
    const id = studentCode;
    const featured = FEATURED_DEMO_STUDENTS[studentCode];

    if (featured) {
      usedNames.add(featured.fullName);
      result.push({
        id,
        studentCode,
        fullName: featured.fullName,
        gender: featured.gender,
        birthDate: featured.birthDate,
        classId,
        parentId: featured.parentId,
        parentName: featured.parentName,
        parentPhone: featured.parentPhone,
        gpa: featured.gpa,
        conduct: featured.conduct,
        attendanceRate: featured.attendanceRate,
        needsAttention: featured.needsAttention,
        attentionReason: featured.attentionReason,
        strengths: featured.strengths,
        focusAreas: featured.focusAreas,
        interests: featured.interests,
        personalityNote: featured.personalityNote,
        avatarPalette: AVATAR_PALETTES[(classIdx + i) % AVATAR_PALETTES.length],
        effortPoints: featured.effortPoints,
        badgeIds: featured.badgeIds,
      });
      continue;
    }

    const seed = classIdx * 97 + i * 13;
    const gender: 'Nam' | 'Nữ' = (i + classIdx) % 2 === 0 ? 'Nữ' : 'Nam';

    let fullName = '';
    let attempt = 0;
    while (!fullName || usedNames.has(fullName)) {
      const ln = LAST_NAMES[(seed + attempt * 3) % LAST_NAMES.length];
      const mn =
        gender === 'Nam'
          ? MALE_MIDDLES[(seed + attempt * 5 + i) % MALE_MIDDLES.length]
          : FEMALE_MIDDLES[(seed + attempt * 5 + i) % FEMALE_MIDDLES.length];
      const fn =
        gender === 'Nam'
          ? MALE_FIRSTS[(seed * 2 + attempt * 7 + i) % MALE_FIRSTS.length]
          : FEMALE_FIRSTS[(seed * 2 + attempt * 7 + i) % FEMALE_FIRSTS.length];
      fullName = `${ln} ${mn} ${fn}`;
      attempt++;
    }
    usedNames.add(fullName);

    const month = ((seed + i) % 12) + 1;
    const day = ((seed * 3 + i * 2) % 28) + 1;
    const birthDate = `${birthYear}-${padTwo(month)}-${padTwo(day)}`;

    const parentLast = fullName.split(' ')[0];
    const parentMid = gender === 'Nam' ? 'Văn' : 'Thị';
    const parentFirst =
      MALE_FIRSTS[(seed + i * 4) % MALE_FIRSTS.length];
    const isMother = (i + classIdx) % 2 === 1;
    const parentName = isMother
      ? `Chị ${LAST_NAMES[(seed + 5) % LAST_NAMES.length]} Thị ${FEMALE_FIRSTS[(seed + i) % FEMALE_FIRSTS.length]}`
      : `Anh ${parentLast} ${parentMid} ${parentFirst}`;

    const needsAttention = i % 6 === 0 || i === 17;
    const rawGpa = needsAttention
      ? 6.2 + ((seed % 14) / 10)
      : 7.4 + ((seed % 23) / 10);
    const gpa = Math.min(9.7, Math.round(rawGpa * 10) / 10);
    const conduct: 'Tốt' | 'Khá' | 'Đạt' = needsAttention
      ? i % 12 === 0
        ? 'Đạt'
        : 'Khá'
      : gpa >= 8.0
        ? 'Tốt'
        : 'Khá';

    const attendanceRate = needsAttention
      ? 89 + (seed % 6)
      : 95 + (seed % 6);

    const strengths = [
      STRENGTH_POOL[(seed + 1) % STRENGTH_POOL.length],
      STRENGTH_POOL[(seed + 5) % STRENGTH_POOL.length],
    ];
    if (gpa >= 8.5) {
      strengths.push(STRENGTH_POOL[(seed + 9) % STRENGTH_POOL.length]);
    }

    const focusAreas = [
      FOCUS_POOL[(seed + 2) % FOCUS_POOL.length],
      FOCUS_POOL[(seed + 7) % FOCUS_POOL.length],
    ];

    const interests = [
      INTEREST_POOL[(seed + 3) % INTEREST_POOL.length],
      INTEREST_POOL[(seed + 8) % INTEREST_POOL.length],
    ];

    const badgePool = ['BDG_STEADY', 'BDG_TEAMWORK', 'BDG_READING', 'BDG_CREATIVE', 'BDG_PERSIST', 'BDG_SELF_REFLECT'];
    const badgeIds = needsAttention
      ? [badgePool[seed % badgePool.length]]
      : [
          badgePool[seed % badgePool.length],
          badgePool[(seed + 2) % badgePool.length],
        ];

    result.push({
      id,
      studentCode,
      fullName,
      gender,
      birthDate,
      classId,
      parentId: `PH_${studentCode}`,
      parentName,
      parentPhone: `09${(classIdx + 1)}${padTwo((i * 3) % 99)} ${padTwo((seed + 11) % 99)}${padTwo((seed + 29) % 99)}`,
      gpa,
      conduct,
      attendanceRate,
      needsAttention,
      attentionReason: needsAttention
        ? ATTENTION_REASONS[(seed + i) % ATTENTION_REASONS.length]
        : undefined,
      strengths,
      focusAreas,
      interests,
      personalityNote: PERSONALITY_NOTES[(seed + i) % PERSONALITY_NOTES.length],
      avatarPalette: AVATAR_PALETTES[(seed + i) % AVATAR_PALETTES.length],
      effortPoints: 85 + (seed % 80),
      badgeIds,
    });
  }

  return result;
}

export const MOCK_STUDENTS: Student[] = CLASS_ORDER.flatMap((classId, idx) =>
  generateStudentsForClass(classId, idx),
);
