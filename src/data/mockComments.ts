import type { ContentStatus, PeriodicComment } from '../types/domain';
import { MOCK_STUDENTS } from './mockStudents';

const COMMENT_OPENERS = [
  'Trong tháng 11, em thể hiện tinh thần học tập ổn định và hợp tác tốt với bạn bè trong lớp.',
  'Tuần vừa qua ghi nhận sự tiến bộ rõ rệt ở thái độ chủ động và cách em chuẩn bị bài trước khi đến lớp.',
  'Em duy trì nề nếp nghiêm túc, biết lắng nghe góp ý của giáo viên bộ môn để điều chỉnh cách học.',
  'Em có nhiều cố gắng trong các hoạt động thảo luận nhóm, đặc biệt ở những nội dung thực hành.',
  'Kết quả rèn luyện tuần này phản ánh sự kiên trì của em, tuy nhiên cần giữ nhịp nghỉ ngơi điều độ hơn.',
];

const COMMENT_NEXT_STEPS = [
  'Thời gian tới, em nên dành thêm 15 phút mỗi tối để rà lại các bước giải trước khi chuyển sang bài mới.',
  'Cô khuyến khích em mạnh dạn đăng ký trình bày phần khởi đầu của nhóm để tăng sự tự tin trước đám đông.',
  'Gia đình và thầy cô sẽ cùng hỗ trợ em chia nhỏ mục tiêu ôn tập theo từng ngày để giảm áp lực cuối tuần.',
  'Em hãy tiếp tục duy trì thói quen ghi chú nhanh các ý chưa rõ ngay cuối tiết để hỏi lại giáo viên.',
  'Nếu giữ đều nhịp học hiện tại và ngủ đủ giấc, em sẽ phát huy rất tốt năng lực ở kỳ đánh giá sắp tới.',
];

const ENCOURAGEMENT_VARIANTS = [
  'Cô rất trân trọng sự bền bỉ của em trong tuần qua — mỗi bước tiến nhỏ đều đang giúp em vững vàng hơn từng ngày!',
  'Thầy ghi nhận tinh thần không ngại thử thách của em. Hãy tin vào quá trình mình đang đi và giữ sức khỏe nhé!',
  'Em đang làm rất tốt việc lắng nghe và hỗ trợ bạn bè. Cứ mạnh dạn thể hiện ý kiến riêng của mình nhiều hơn nữa nhé!',
  'Đừng quá lo lắng nếu có bài chưa như ý — điều tuyệt vời nhất là em luôn biết nhìn lại để cải thiện tốt hơn.',
];

const HOME_COMPANION_TIPS = [
  'Phụ huynh có thể hỏi con về một điều thú vị con học được hôm nay thay vì hỏi điểm số ngay khi con về nhà.',
  'Gợi ý cùng con lập khung giờ học 45 phút – nghỉ 10 phút vào buổi tối và cất điện thoại ra khỏi bàn học.',
  'Khuyến khích con đọc to phần dàn ý hoặc kể lại tóm tắt bài học trong 5 phút để tăng phản xạ diễn đạt.',
  'Đảm bảo con ngủ trước 22h30 ít nhất 5 ngày trong tuần để duy trì sự tỉnh táo vào các tiết học buổi chiều.',
];

const FEATURED_COMMENTS: PeriodicComment[] = [
  {
    id: 'CMT_FEAT_01',
    studentId: 'HS7A101',
    classId: '7A1',
    teacherId: 'GV_7A1',
    periodLabel: 'Đánh giá Tuần 12 - Tháng 11/2026',
    status: 'PUBLISHED',
    content:
      'Nguyễn Minh An có một tuần học tập tích cực, nổi bật ở khả năng lập luận Toán – Tin và điều phối nhóm thảo luận 4 bạn. Em hoàn thành đầy đủ bài tập đúng hạn, thái độ lễ phép. Điểm cần lưu ý thêm là em nên giữ tốc độ nói chậm rãi hơn khi thuyết trình trước cả lớp.',
    encouragementText:
      'Minh An ơi, cô rất vui khi thấy em chủ động điều phối nhóm rất chững chạc tuần này. Chỉ cần giữ nhịp thở bình tĩnh khi đứng trước lớp, bài nói của em sẽ còn cuốn hút hơn nữa!',
    homeCompanionTip:
      'Chị Mai có thể dành 10 phút cuối tuần để Minh An thuyết trình thử lại một chủ đề em yêu thích ở nhà nhằm tăng sự tự tin tự nhiên.',
    isAiGenerated: false,
    aiSource: 'manual',
    createdAt: '2026-11-23T15:00:00Z',
    updatedAt: '2026-11-24T08:30:00Z',
    approvedAt: '2026-11-24T08:15:00Z',
    publishedAt: '2026-11-24T08:30:00Z',
    approvalHistory: [
      {
        id: 'HIS_1',
        action: 'CREATED_DRAFT',
        actorName: 'Cô Nguyễn Thị Minh Thu',
        actorRole: 'GVCN',
        timestamp: '2026-11-23T15:00:00Z',
        note: 'Khởi tạo nhận xét định kỳ tuần 12',
      },
      {
        id: 'HIS_2',
        action: 'APPROVED',
        actorName: 'Cô Nguyễn Thị Minh Thu',
        actorRole: 'GVCN',
        timestamp: '2026-11-24T08:15:00Z',
        note: 'Đã rà soát đúng dữ liệu quan sát thực tế',
      },
      {
        id: 'HIS_3',
        action: 'PUBLISHED',
        actorName: 'Cô Nguyễn Thị Minh Thu',
        actorRole: 'GVCN',
        timestamp: '2026-11-24T08:30:00Z',
        note: 'Phát hành tới phụ huynh và học sinh',
      },
    ],
  },
  {
    id: 'CMT_FEAT_02',
    studentId: 'HS10A201',
    classId: '10A2',
    teacherId: 'GV_10A2',
    periodLabel: 'Đánh giá Tuần 12 - Tháng 11/2026',
    status: 'PUBLISHED',
    content:
      'Trần Bảo Ngọc thích nghi rất tốt với nhịp học THPT, chủ động dẫn hoạt động tiếng Anh đầu giờ và hỗ trợ bạn cùng tổ hoàn thành bài đúng tiến độ. Em nên phân bổ thời gian ôn tập cân bằng hơn giữa các môn xã hội và tự nhiên để tránh dồn việc vào cuối tuần.',
    encouragementText:
      'Bảo Ngọc giữ phong độ rất tuyệt vời! Sự nhiệt tình của em đang lan tỏa năng lượng tích cực cho cả tổ 1 đấy.',
    homeCompanionTip:
      'Anh Khánh có thể cùng con rà lại thời khóa biểu tự học buổi tối để ưu tiên giờ đi ngủ sớm trước 22h30.',
    isAiGenerated: true,
    aiSource: 'mock-ai',
    createdAt: '2026-11-22T14:00:00Z',
    updatedAt: '2026-11-23T09:10:00Z',
    approvedAt: '2026-11-23T09:00:00Z',
    publishedAt: '2026-11-23T09:10:00Z',
    approvalHistory: [
      {
        id: 'HIS_4',
        action: 'CREATED_DRAFT',
        actorName: 'Cô Phạm Lan Anh',
        actorRole: 'GVCN',
        timestamp: '2026-11-22T14:00:00Z',
        note: 'Tạo bản nháp từ nhật ký quan sát',
      },
      {
        id: 'HIS_5',
        action: 'APPROVED',
        actorName: 'Cô Phạm Lan Anh',
        actorRole: 'GVCN',
        timestamp: '2026-11-23T09:00:00Z',
      },
      {
        id: 'HIS_6',
        action: 'PUBLISHED',
        actorName: 'Cô Phạm Lan Anh',
        actorRole: 'GVCN',
        timestamp: '2026-11-23T09:10:00Z',
      },
    ],
  },
  {
    id: 'CMT_FEAT_03',
    studentId: 'HS11A101',
    classId: '11A1',
    teacherId: 'GV_11A1',
    periodLabel: 'Đánh giá Tuần 12 - Tháng 11/2026',
    status: 'PUBLISHED',
    content:
      'Lê Hoàng Phúc có điểm sáng rõ rệt ở giờ thực hành STEM Vật lý khi kiên nhẫn hỗ trợ nhóm hoàn thành mô hình sớm. Tuy nhiên em đang có tâm lý tự tạo áp lực trước kỳ kiểm tra giữa kỳ, dẫn đến mệt mỏi vào buổi chiều. Thầy và gia đình cần phối hợp động viên để em giảm tải tâm lý.',
    encouragementText:
      'Hoàng Phúc ạ, kết quả thực hành STEM tuần này chứng minh em có tư duy kỹ thuật rất tốt. Hãy cho bản thân thời gian nghỉ ngơi hợp lý để bước vào tuần mới thật nhẹ nhàng nhé!',
    homeCompanionTip:
      'Chị Hà lưu ý nhắc Hoàng Phúc tạm dừng ôn bài sau 22h15, ưu tiên giấc ngủ và động viên con nhìn vào những tiến bộ cụ thể hằng ngày.',
    isAiGenerated: false,
    aiSource: 'manual',
    createdAt: '2026-11-24T09:20:00Z',
    updatedAt: '2026-11-24T10:00:00Z',
    approvedAt: '2026-11-24T09:45:00Z',
    publishedAt: '2026-11-24T10:00:00Z',
    approvalHistory: [
      {
        id: 'HIS_7',
        action: 'CREATED_DRAFT',
        actorName: 'Thầy Lê Đức Mạnh',
        actorRole: 'GVCN',
        timestamp: '2026-11-24T09:20:00Z',
      },
      {
        id: 'HIS_8',
        action: 'APPROVED',
        actorName: 'Thầy Lê Đức Mạnh',
        actorRole: 'GVCN',
        timestamp: '2026-11-24T09:45:00Z',
      },
      {
        id: 'HIS_9',
        action: 'PUBLISHED',
        actorName: 'Thầy Lê Đức Mạnh',
        actorRole: 'GVCN',
        timestamp: '2026-11-24T10:00:00Z',
      },
    ],
  },
];

const generatedComments: PeriodicComment[] = MOCK_STUDENTS.filter(
  (s) => !['HS7A101', 'HS10A201', 'HS11A101'].includes(s.id),
)
  .slice(0, 95) // Cover ~98 comments across 5 classes with varied DRAFT / APPROVED / PUBLISHED states
  .map((student, idx) => {
    const statusCycle: ContentStatus[] = ['PUBLISHED', 'PUBLISHED', 'APPROVED', 'DRAFT'];
    const status = statusCycle[idx % statusCycle.length];
    const teacherId = `GV_${student.classId}`;
    const isAiGenerated = idx % 3 === 0;
    const createdAt = `2026-11-${18 + (idx % 6)}T08:30:00Z`;
    const opener = COMMENT_OPENERS[idx % COMMENT_OPENERS.length];
    const nextStep = COMMENT_NEXT_STEPS[(idx + 2) % COMMENT_NEXT_STEPS.length];

    const history: PeriodicComment['approvalHistory'] = [
      {
        id: `HIS_GEN_${student.id}_1`,
        action: 'CREATED_DRAFT',
        actorName: `GVCN lớp ${student.classId}`,
        actorRole: 'GVCN',
        timestamp: createdAt,
        note: isAiGenerated ? 'Soạn bản nháp hỗ trợ AI' : 'GVCN soạn trực tiếp',
      },
    ];

    if (status === 'APPROVED' || status === 'PUBLISHED') {
      history.push({
        id: `HIS_GEN_${student.id}_2`,
        action: 'APPROVED',
        actorName: `GVCN lớp ${student.classId}`,
        actorRole: 'GVCN',
        timestamp: `2026-11-${19 + (idx % 5)}T10:15:00Z`,
      });
    }
    if (status === 'PUBLISHED') {
      history.push({
        id: `HIS_GEN_${student.id}_3`,
        action: 'PUBLISHED',
        actorName: `GVCN lớp ${student.classId}`,
        actorRole: 'GVCN',
        timestamp: `2026-11-${20 + (idx % 4)}T14:00:00Z`,
      });
    }

    return {
      id: `CMT_${student.id}`,
      studentId: student.id,
      classId: student.classId,
      teacherId,
      periodLabel: 'Đánh giá Tuần 12 - Tháng 11/2026',
      status,
      content: `${student.fullName}: ${opener} Thế mạnh nổi bật của em là ${student.strengths[0].toLowerCase()}. ${nextStep}`,
      encouragementText: ENCOURAGEMENT_VARIANTS[idx % ENCOURAGEMENT_VARIANTS.length],
      homeCompanionTip: HOME_COMPANION_TIPS[idx % HOME_COMPANION_TIPS.length],
      isAiGenerated,
      aiSource: isAiGenerated ? 'mock-ai' : 'manual',
      createdAt,
      updatedAt: createdAt,
      approvedAt: status !== 'DRAFT' ? `2026-11-${19 + (idx % 5)}T10:15:00Z` : undefined,
      publishedAt: status === 'PUBLISHED' ? `2026-11-${20 + (idx % 4)}T14:00:00Z` : undefined,
      approvalHistory: history,
    };
  });

export const MOCK_COMMENTS: PeriodicComment[] = [
  ...FEATURED_COMMENTS,
  ...generatedComments,
];
