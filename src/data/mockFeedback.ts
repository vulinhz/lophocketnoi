import type { ParentFeedback } from '../types/domain';

export const MOCK_FEEDBACK: ParentFeedback[] = [
  {
    id: 'FB_01',
    parentId: 'PH_01',
    parentName: 'Chị Lê Thị Thanh Mai',
    studentId: 'HS7A101',
    classId: '7A1',
    topic: 'Học tập',
    message:
      'Cảm ơn cô Thu đã cập nhật nhận xét rất sát sao. Ở nhà Minh An rất thích làm toán tư duy nhưng vẫn hơi rụt rè khi nói trước đông người, gia đình sẽ cùng con tập nói 10 phút mỗi tối.',
    createdAt: '2026-11-24T11:20:00Z',
    teacherReply:
      'Cảm ơn chị Mai đã đồng hành cùng lớp. Tuần tới cô sẽ giao Minh An dẫn phần khởi động nhỏ trong nhóm 4 bạn trước để con quen dần ạ.',
    repliedAt: '2026-11-24T13:40:00Z',
    isResolved: true,
  },
  {
    id: 'FB_02',
    parentId: 'PH_02',
    parentName: 'Anh Trần Văn Khánh',
    studentId: 'HS10A201',
    classId: '10A2',
    topic: 'Tâm lý - Nề nếp',
    message:
      'Gia đình đã nhận thông báo lịch hướng nghiệp. Cháu Bảo Ngọc dạo này học tiếng Anh rất hào hứng, nhờ cô nhắc thêm cháu ngủ đúng giờ vì hay đọc thêm tài liệu muộn.',
    createdAt: '2026-11-23T18:10:00Z',
    isResolved: false,
  },
  {
    id: 'FB_03',
    parentId: 'PH_03',
    parentName: 'Chị Phạm Thu Hà',
    studentId: 'HS11A101',
    classId: '11A1',
    topic: 'Sức khỏe',
    message:
      'Thầy Mạnh ơi, hai hôm nay Phúc có hơi lo lắng về bài kiểm tra giữa kỳ nên tối hay thức đến 23h30. Gia đình đã trao đổi nhẹ nhàng với con và nhờ thầy động viên thêm trên lớp giúp cháu đỡ áp lực ạ.',
    createdAt: '2026-11-24T12:05:00Z',
    isResolved: false,
  },
  {
    id: 'FB_04',
    parentId: 'PH_HS7A106',
    parentName: 'Anh Vũ Minh Tuấn',
    studentId: 'HS7A106',
    classId: '7A1',
    topic: 'Đề xuất lớp học',
    message:
      'Đề xuất lớp mình có thể chia sẻ thêm danh sách sách kỹ năng phù hợp lứa tuổi lớp 7 để phụ huynh mua cho con đọc dịp cuối tuần ạ.',
    createdAt: '2026-11-22T20:15:00Z',
    teacherReply: 'Cô đã tổng hợp 8 đầu sách gợi ý và sẽ gửi trong bản tin Tuần 13 tới phụ huynh nhé!',
    repliedAt: '2026-11-23T08:00:00Z',
    isResolved: true,
  },
  {
    id: 'FB_05',
    parentId: 'PH_HS7A304',
    parentName: 'Chị Đặng Thu Thủy',
    studentId: 'HS7A304',
    classId: '7A3',
    topic: 'Học tập',
    message:
      'Xin cảm ơn thầy Hùng đã kèm thêm phần Hình học giờ ra chơi, tuần này cháu về nhà tự giác làm phiếu ôn tập hơn trước nhiều.',
    createdAt: '2026-11-22T19:00:00Z',
    isResolved: false,
  },
  {
    id: 'FB_06',
    parentId: 'PH_HS11A205',
    parentName: 'Chị Bùi Ngọc Lan',
    studentId: 'HS11A205',
    classId: '11A2',
    topic: 'Tâm lý - Nề nếp',
    message:
      'Cháu chuẩn bị bài thuyết trình nhóm rất say sưa, nhờ cô Hương góp ý giúp con cách cân đối thời gian giữa hoạt động CLB và bài vở trên lớp.',
    createdAt: '2026-11-23T14:30:00Z',
    isResolved: false,
  },
];
