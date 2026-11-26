import type {
  Classroom,
  Observation,
  ParentFeedback,
  PeriodicComment,
  SelfAssessment,
  Student,
} from '../types/domain';

export type AiSourceMode = 'gemini' | 'mock-ai';

export interface AiServiceStatus {
  geminiAvailable: boolean;
  checked: boolean;
  model: string;
}

export interface AiGenerationResult<T = string> {
  data: T;
  source: AiSourceMode;
  isSimulated: boolean;
  notice: string;
}

export interface QualityAuditReport {
  isGenericOrRepetitive: boolean;
  severity: 'good' | 'warning';
  findings: string[];
  suggestions: string[];
}

export class GeminiApiCallError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GeminiApiCallError';
  }
}

let cachedStatus: AiServiceStatus = {
  geminiAvailable: false,
  checked: false,
  model: 'gemini-4-hydrogen',
};

async function callServerGemini(
  prompt: string,
  systemInstruction: string,
): Promise<{ mode: 'gemini'; text: string } | { mode: 'unconfigured' }> {
  let response: Response;
  try {
    response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, systemInstruction }),
    });
  } catch {
    // Static hosting (e.g. Vercel without backend proxy) -> treat as unconfigured local demo
    return { mode: 'unconfigured' };
  }

  if (response.status === 404) {
    return { mode: 'unconfigured' };
  }

  const payload = (await response.json().catch(() => ({}))) as {
    mode?: string;
    text?: string;
    error?: string;
  };

  if (!response.ok) {
    throw new GeminiApiCallError(
      payload.error || `Lỗi Gemini API (HTTP ${response.status}).`,
    );
  }

  if (payload.mode === 'unconfigured') {
    return { mode: 'unconfigured' };
  }

  if (!payload.text) {
    throw new GeminiApiCallError('Gemini AI không trả về nội dung hợp lệ.');
  }

  return { mode: 'gemini', text: payload.text };
}

const MOCK_NOTICE =
  'Nội dung AI mô phỏng (Demo Mode) — Chưa cấu hình GEMINI_API_KEY. Giáo viên vui lòng kiểm tra và chỉnh sửa trước khi duyệt.';
const GEMINI_NOTICE =
  'Nội dung gợi ý từ Gemini AI (trạng thái DRAFT) — Chỉ GVCN mới có quyền duyệt và phát hành.';

function buildMockStudentComment(
  student: Student,
  observations: Observation[],
  assessment?: SelfAssessment,
): string {
  const recentObs = observations.slice(0, 2);
  const obsSummary =
    recentObs.length > 0
      ? recentObs.map((o) => o.content).join(' ')
      : `${student.fullName} giữ thái độ học tập ổn định và hòa đồng với tập thể lớp ${student.classId}.`;

  const strengthLine =
    student.strengths.length > 0
      ? `Điểm mạnh nổi bật của em là ${student.strengths.slice(0, 2).join(', ').toLowerCase()}.`
      : '';

  const assessmentLine = assessment
    ? `Theo tự đánh giá tuần (${assessment.mood.toLowerCase()}), em đã đạt tiến bộ: "${assessment.weeklyWin}".`
    : '';

  const nextFocus = student.needsAttention
    ? `Lưu ý cần quan tâm: ${student.attentionReason ?? student.focusAreas[0] ?? 'cần ổn định nhịp học'}. GVCN đề nghị em dành thêm 15 phút mỗi tối rà soát lại phần còn vướng và trao đổi trực tiếp với thầy/cô.`
    : `Định hướng tuần tới: ${student.focusAreas[0] ?? 'duy trì thói quen tự học đều đặn và mạnh dạn chia sẻ ý kiến trước lớp'}.`;

  return `${obsSummary} ${strengthLine} ${assessmentLine} ${nextFocus}`.replace(/\s+/g, ' ').trim();
}

function buildMockEncouragement(studentName: string, draftComment: string): string {
  const firstName = studentName.split(' ').slice(-1)[0] || studentName;
  if (draftComment.toLowerCase().includes('áp lực') || draftComment.toLowerCase().includes('mệt')) {
    return `${firstName} ơi, thầy cô luôn trân trọng những nỗ lực thầm lặng của em trong tuần qua. Đừng quá tạo áp lực cho mình nhé — hãy nghỉ ngơi hợp lý và chia sẻ với thầy cô bất cứ khi nào em cần hỗ trợ!`;
  }
  return `${firstName} thân mến, tuần qua em đã có những bước tiến rất đáng khen ở tinh thần chủ động và hợp tác cùng bạn bè. Hãy tiếp tục giữ sự tò mò học hỏi và tin tưởng vào nhịp độ tiến bộ của riêng mình nhé!`;
}

function buildMockAnnouncement(
  classroom: Classroom,
  topic: string,
  keyPoints: string,
): string {
  return `Kính gửi quý phụ huynh ${classroom.name},\n\nNhằm phối hợp đồng hành cùng các con trong ${classroom.academicYear}, giáo viên chủ nhiệm xin thông báo về nội dung: ${topic}.\n\nTrọng tâm tuần này của lớp là: ${classroom.weeklyFocus}\nCác điểm phụ huynh cần lưu ý:\n- ${keyPoints || 'Nhắc con chuẩn bị đầy đủ sách vở và hoàn thành phiếu tự học trước thứ Sáu.'}\n- Duy trì giờ đi ngủ hợp lý trước 22h30 để đảm bảo sức khỏe học tập.\n\nTrân trọng cảm ơn sự đồng hành của quý gia đình!\nGVCN ${classroom.name}`;
}

function buildMockHomeTip(student: Student, observations: Observation[]): string {
  const hasStress =
    student.needsAttention ||
    observations.some((o) => o.sentiment === 'attention');
  if (hasStress) {
    return `Gia đình nên bắt đầu buổi tối bằng 10 phút trò chuyện thư giãn, hỏi con xem hôm nay có khoảnh khắc nào vui ở lớp ${student.classId} trước khi nhắc đến bài vở. Tránh giao thêm bài ngoài lịch chính và giúp con tắt thiết bị điện tử lúc 22h15.`;
  }
  return `Phụ huynh có thể khích lệ ${student.fullName} chia sẻ lại một nội dung em vừa hướng dẫn bạn hoặc trình bày ở lớp tuần này. Sự lắng nghe ghi nhận từ gia đình sẽ giúp em phát huy thế mạnh "${student.strengths[0] ?? 'tự tin giao tiếp'}" tự nhiên hơn.`;
}

function buildMockFeedbackSummary(
  feedbacks: ParentFeedback[],
  classLabel: string,
): string {
  if (feedbacks.length === 0) {
    return `Hiện chưa có phản hồi nào từ phụ huynh ${classLabel} để tổng hợp.`;
  }
  const unresolved = feedbacks.filter((f) => !f.isResolved).length;
  const topics = Array.from(new Set(feedbacks.map((f) => f.topic))).join(', ');
  return `Tổng hợp ${feedbacks.length} phản hồi phụ huynh ${classLabel} (còn ${unresolved} phản hồi chưa trả lời):\n1. Chủ đề chính: ${topics}.\n2. Nhu cầu nổi bật: Phụ huynh mong muốn phối hợp rèn thói quen tự học buổi tối, cân bằng giấc ngủ trước kỳ kiểm tra và tăng gợi ý sách/tài liệu phù hợp lứa tuổi.\n3. Gợi ý hành động cho GVCN: Ưu tiên phản hồi các gia đình có học sinh đang căng thẳng tâm lý và lồng ghép hướng dẫn phân bổ thời gian trong bản tin tuần tới.`;
}

function runMockQualityAudit(
  draftText: string,
  existingComments: PeriodicComment[],
): QualityAuditReport {
  const normalized = draftText.trim().toLowerCase();
  const findings: string[] = [];
  const suggestions: string[] = [];

  if (normalized.length < 70) {
    findings.push('Nhận xét còn ngắn (< 70 ký tự), chưa thể hiện chi tiết tiến bộ hoặc điểm cần hỗ trợ cụ thể.');
    suggestions.push('Bổ sung ít nhất 1 dẫn chứng quan sát trên lớp và 1 gợi ý hành động cho tuần tới.');
  }

  const clichePhrases = [
    'chăm ngoan học giỏi',
    'cần cố gắng hơn',
    'tiếp thu bài tốt',
    'ngoan ngoãn lễ phép',
    'cần phát huy hơn nữa',
  ];
  const foundCliches = clichePhrases.filter((phrase) => normalized.includes(phrase));
  if (foundCliches.length > 0) {
    findings.push(`Phát hiện cụm từ còn chung chung: "${foundCliches.join('", "')}".`);
    suggestions.push('Thay cụm từ khái quát bằng hành vi cụ thể (ví dụ: "chủ động giải thích bài cho nhóm 4 bạn", "giảm sai sót dấu ở bài đại số").');
  }

  // Simple overlap check with existing comments in the class
  const similar = existingComments.find((c) => {
    const other = c.content.toLowerCase();
    const wordsA = new Set(normalized.split(/\s+/).filter((w) => w.length > 3));
    const wordsB = new Set(other.split(/\s+/).filter((w) => w.length > 3));
    if (wordsA.size === 0 || wordsB.size === 0) return false;
    let overlap = 0;
    wordsA.forEach((w) => {
      if (wordsB.has(w)) overlap++;
    });
    return overlap / Math.max(wordsA.size, 1) > 0.72;
  });

  if (similar) {
    findings.push('Cấu trúc câu có độ trùng lặp cao (>72%) với một nhận xét khác đã lưu trong lớp.');
    suggestions.push('Cá nhân hóa câu mở đầu theo sở thích, tâm lý hoặc nhật ký quan sát riêng của học sinh.');
  }

  if (findings.length === 0) {
    return {
      isGenericOrRepetitive: false,
      severity: 'good',
      findings: ['Nhận xét có dẫn chứng cụ thể, giọng văn mang tính khích lệ và không trùng lặp mẫu chung.'],
      suggestions: ['Có thể chuyển sang bước duyệt (APPROVED) khi GVCN đã kiểm tra thông tin.'],
    };
  }

  return {
    isGenericOrRepetitive: true,
    severity: 'warning',
    findings,
    suggestions,
  };
}

export const aiService = {
  async checkStatus(force = false): Promise<AiServiceStatus> {
    if (cachedStatus.checked && !force) return cachedStatus;
    try {
      const res = await fetch('/api/ai/status');
      if (res.ok) {
        const data = (await res.json()) as {
          geminiAvailable?: boolean;
          model?: string;
        };
        cachedStatus = {
          geminiAvailable: Boolean(data.geminiAvailable),
          checked: true,
          model: data.model || 'gemini-4-hydrogen',
        };
        return cachedStatus;
      }
    } catch {
      // ignore if static deployment
    }
    cachedStatus = {
      geminiAvailable: false,
      checked: true,
      model: 'gemini-4-hydrogen',
    };
    return cachedStatus;
  },

  async draftStudentComment(
    student: Student,
    observations: Observation[],
    assessment?: SelfAssessment,
    options?: { forceMock?: boolean },
  ): Promise<AiGenerationResult<string>> {
    if (!options?.forceMock) {
      const obsText = observations
        .slice(0, 4)
        .map((o) => `- [${o.observedAt} | ${o.category}] ${o.title}: ${o.content}`)
        .join('\n');
      const prompt = `Soạn 1 đoạn nhận xét định kỳ (khoảng 60-90 từ, tiếng Việt tự nhiên, chân thành, không sáo rỗng) cho học sinh:
Họ tên: ${student.fullName} (Lớp ${student.classId})
Thế mạnh: ${student.strengths.join(', ')}
Điểm cần rèn thêm: ${student.focusAreas.join(', ')}
Ghi chú tâm lý/tính cách: ${student.personalityNote}
Nhật ký quan sát GVCN:\n${obsText || '- Chưa có ghi chép mới.'}
Tự đánh giá tuần của học sinh: ${assessment ? `Tâm trạng: ${assessment.mood}, Điểm hay: ${assessment.weeklyWin}, Khó khăn: ${assessment.challenge}` : 'Chưa nộp.'}`;

      const res = await callServerGemini(
        prompt,
        'Bạn là giáo viên chủ nhiệm Việt Nam tận tâm. Viết nhận xét cụ thể dựa trên dữ liệu quan sát, tránh sáo rỗng.',
      );
      if (res.mode === 'gemini') {
        return {
          data: res.text,
          source: 'gemini',
          isSimulated: false,
          notice: GEMINI_NOTICE,
        };
      }
    }

    return {
      data: buildMockStudentComment(student, observations, assessment),
      source: 'mock-ai',
      isSimulated: true,
      notice: MOCK_NOTICE,
    };
  },

  async convertToEncouragement(
    studentName: string,
    commentText: string,
    options?: { forceMock?: boolean },
  ): Promise<AiGenerationResult<string>> {
    if (!options?.forceMock) {
      const prompt = `Chuyển đoạn nhận xét sư phạm sau thành lời khích lệ trực tiếp gửi tới học sinh ${studentName} (khoảng 35-55 từ, ấm áp, tôn trọng, tạo động lực, không phán xét):\n"${commentText}"`;
      const res = await callServerGemini(
        prompt,
        'Bạn là giáo viên chủ nhiệm gần gũi, viết lời nhắn động viên trực tiếp cho học sinh.',
      );
      if (res.mode === 'gemini') {
        return {
          data: res.text,
          source: 'gemini',
          isSimulated: false,
          notice: GEMINI_NOTICE,
        };
      }
    }

    return {
      data: buildMockEncouragement(studentName, commentText),
      source: 'mock-ai',
      isSimulated: true,
      notice: MOCK_NOTICE,
    };
  },

  async draftParentAnnouncement(
    classroom: Classroom,
    topic: string,
    keyPoints: string,
    options?: { forceMock?: boolean },
  ): Promise<AiGenerationResult<string>> {
    if (!options?.forceMock) {
      const prompt = `Soạn thông báo gửi phụ huynh ${classroom.name} (${classroom.academicYear}).
Chủ đề: ${topic}
Trọng tâm tuần của lớp: ${classroom.weeklyFocus}
Nội dung chính cần truyền đạt: ${keyPoints}
Yêu cầu: Lịch sự, súc tích, rõ việc cần phối hợp, dưới 140 từ.`;
      const res = await callServerGemini(
        prompt,
        'Bạn là giáo viên chủ nhiệm soạn thông báo gửi phụ huynh rõ ràng, chuẩn mực.',
      );
      if (res.mode === 'gemini') {
        return {
          data: res.text,
          source: 'gemini',
          isSimulated: false,
          notice: GEMINI_NOTICE,
        };
      }
    }

    return {
      data: buildMockAnnouncement(classroom, topic, keyPoints),
      source: 'mock-ai',
      isSimulated: true,
      notice: MOCK_NOTICE,
    };
  },

  async suggestHomeCompanion(
    student: Student,
    observations: Observation[],
    options?: { forceMock?: boolean },
  ): Promise<AiGenerationResult<string>> {
    if (!options?.forceMock) {
      const prompt = `Gợi ý 1 cách đồng hành thiết thực tại nhà (40-65 từ) cho phụ huynh của em ${student.fullName} (Lớp ${student.classId}).
Thế mạnh: ${student.strengths.join(', ')}
Lưu ý: ${student.attentionReason || student.focusAreas.join(', ')}
Quan sát gần đây: ${observations[0]?.content ?? 'Sinh hoạt học tập ổn định.'}`;
      const res = await callServerGemini(
        prompt,
        'Bạn là chuyên gia tâm lý học đường gợi ý cho phụ huynh cách đồng hành nhẹ nhàng, thực tế tại nhà.',
      );
      if (res.mode === 'gemini') {
        return {
          data: res.text,
          source: 'gemini',
          isSimulated: false,
          notice: GEMINI_NOTICE,
        };
      }
    }

    return {
      data: buildMockHomeTip(student, observations),
      source: 'mock-ai',
      isSimulated: true,
      notice: MOCK_NOTICE,
    };
  },

  async summarizeParentFeedback(
    feedbacks: ParentFeedback[],
    classLabel: string,
    options?: { forceMock?: boolean },
  ): Promise<AiGenerationResult<string>> {
    if (!options?.forceMock && feedbacks.length > 0) {
      const list = feedbacks
        .slice(0, 8)
        .map((f) => `- [${f.topic}] ${f.parentName}: ${f.message}`)
        .join('\n');
      const prompt = `Tóm tắt các phản hồi phụ huynh ${classLabel} thành 3 gạch đầu dòng ngắn gọn (chủ đề chính, mối quan tâm chung, hành động đề xuất cho GVCN):\n${list}`;
      const res = await callServerGemini(
        prompt,
        'Bạn là trợ lý phân tích thông tin lớp học cho GVCN.',
      );
      if (res.mode === 'gemini') {
        return {
          data: res.text,
          source: 'gemini',
          isSimulated: false,
          notice: GEMINI_NOTICE,
        };
      }
    }

    return {
      data: buildMockFeedbackSummary(feedbacks, classLabel),
      source: 'mock-ai',
      isSimulated: true,
      notice: MOCK_NOTICE,
    };
  },

  async auditCommentQuality(
    draftText: string,
    existingComments: PeriodicComment[],
    options?: { forceMock?: boolean },
  ): Promise<AiGenerationResult<QualityAuditReport>> {
    const localAudit = runMockQualityAudit(draftText, existingComments);

    if (!options?.forceMock) {
      const sampleOthers = existingComments
        .slice(0, 3)
        .map((c) => `- ${c.content.slice(0, 90)}`)
        .join('\n');
      const prompt = `Kiểm tra nhận xét học sinh sau có bị chung chung, sáo rỗng hay lặp ý với mẫu khác không. Trả lời bằng JSON thuần: {"isGenericOrRepetitive": boolean, "findings": string[], "suggestions": string[]}.\nNhận xét cần kiểm tra: "${draftText}"\nMột số nhận xét khác trong lớp:\n${sampleOthers}`;
      const res = await callServerGemini(
        prompt,
        'Bạn là chuyên gia sư phạm rà soát chất lượng nhận xét học sinh. Chỉ trả về JSON hợp lệ.',
      );
      if (res.mode === 'gemini') {
        try {
          const cleaned = res.text.replace(/```json|```/g, '').trim();
          const parsed = JSON.parse(cleaned) as {
            isGenericOrRepetitive?: boolean;
            findings?: string[];
            suggestions?: string[];
          };
          return {
            data: {
              isGenericOrRepetitive: Boolean(parsed.isGenericOrRepetitive),
              severity: parsed.isGenericOrRepetitive ? 'warning' : 'good',
              findings: parsed.findings?.length
                ? parsed.findings
                : localAudit.findings,
              suggestions: parsed.suggestions?.length
                ? parsed.suggestions
                : localAudit.suggestions,
            },
            source: 'gemini',
            isSimulated: false,
            notice: 'Đã kiểm tra chất lượng nhận xét bằng Gemini AI.',
          };
        } catch {
          // If Gemini text wasn't strict JSON, still return structured report with Gemini note
          return {
            data: {
              ...localAudit,
              findings: [res.text],
            },
            source: 'gemini',
            isSimulated: false,
            notice: 'Đã kiểm tra chất lượng nhận xét bằng Gemini AI.',
          };
        }
      }
    }

    return {
      data: localAudit,
      source: 'mock-ai',
      isSimulated: true,
      notice: 'Kiểm tra chất lượng bằng bộ quy tắc AI mô phỏng (Demo Mode).',
    };
  },
};
