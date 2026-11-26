import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  Bot,
  CheckCircle2,
  History,
  Pencil,
  RotateCcw,
  Search,
  Send,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react';
import { useDemo } from '../context/DemoContext';
import { useToast } from '../context/ToastContext';
import { commentService } from '../services/commentService';
import { studentService } from '../services/studentService';
import { observationService } from '../services/observationService';
import {
  aiService,
  GeminiApiCallError,
  type QualityAuditReport,
} from '../services/aiService';
import type { ContentStatus, PeriodicComment } from '../types/domain';
import { WorkflowStatusText } from '../components/StatusLabel';

export function CommentsPage() {
  const { currentUser, aiStatus } = useDemo();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const preselectedStudent = searchParams.get('student') ?? '';

  const [statusFilter, setStatusFilter] = useState<'ALL' | ContentStatus>('ALL');
  const [search, setSearch] = useState('');

  // Composer / AI Studio state
  const isTeacher = currentUser?.role === 'GVCN';
  const students = currentUser ? studentService.getAccessibleStudents(currentUser) : [];
  const comments = currentUser ? commentService.getAccessibleComments(currentUser) : [];

  const [composerOpen, setComposerOpen] = useState(Boolean(preselectedStudent && isTeacher));
  const [editingComment, setEditingComment] = useState<PeriodicComment | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState(
    preselectedStudent || students[0]?.id || '',
  );
  const [periodLabel, setPeriodLabel] = useState('Đánh giá Tuần 12 - Tháng 11/2026');
  const [contentDraft, setContentDraft] = useState('');
  const [encouragementDraft, setEncouragementDraft] = useState('');
  const [homeTipDraft, setHomeTipDraft] = useState('');
  const [isAiGenerated, setIsAiGenerated] = useState(false);
  const [aiSource, setAiSource] = useState<'gemini' | 'mock-ai' | 'manual'>('manual');
  const [aiNotice, setAiNotice] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [auditReport, setAuditReport] = useState<QualityAuditReport | null>(null);

  const [historyComment, setHistoryComment] = useState<PeriodicComment | null>(null);

  if (!currentUser) return null;

  const studentMap = useMemo(
    () => new Map(students.map((s) => [s.id, s])),
    [students],
  );

  const filteredComments = useMemo(() => {
    const q = search.trim().toLowerCase();
    return comments.filter((c) => {
      if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
      if (q) {
        const stu = studentMap.get(c.studentId);
        const hay = `${c.content} ${c.periodLabel} ${stu?.fullName ?? ''} ${stu?.studentCode ?? ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [comments, statusFilter, search, studentMap]);

  const openNewComposer = () => {
    setEditingComment(null);
    setSelectedStudentId(students[0]?.id || '');
    setPeriodLabel('Đánh giá Tuần 12 - Tháng 11/2026');
    setContentDraft('');
    setEncouragementDraft('');
    setHomeTipDraft('');
    setIsAiGenerated(false);
    setAiSource('manual');
    setAiNotice(null);
    setAiError(null);
    setAuditReport(null);
    setComposerOpen(true);
  };

  const openEditComposer = (cmt: PeriodicComment) => {
    setEditingComment(cmt);
    setSelectedStudentId(cmt.studentId);
    setPeriodLabel(cmt.periodLabel);
    setContentDraft(cmt.content);
    setEncouragementDraft(cmt.encouragementText);
    setHomeTipDraft(cmt.homeCompanionTip);
    setIsAiGenerated(cmt.isAiGenerated);
    setAiSource(cmt.aiSource);
    setAiNotice(null);
    setAiError(null);
    setAuditReport(null);
    setComposerOpen(true);
  };

  const runAiTask = async (
    task: 'comment' | 'encouragement' | 'homeTip' | 'audit',
    forceMock = false,
  ) => {
    const stu = studentMap.get(selectedStudentId);
    if (!stu) return;
    setAiLoading(true);
    setAiError(null);

    try {
      const obs = observationService.getObservationsForStudent(currentUser, stu.id);
      const assessments = studentService.getAssessmentsForStudent(stu.id);

      if (task === 'comment') {
        const res = await aiService.draftStudentComment(
          stu,
          obs,
          assessments[0],
          { forceMock },
        );
        setContentDraft(res.data);
        setIsAiGenerated(true);
        setAiSource(res.source);
        setAiNotice(res.notice);
        setAuditReport(null);
      } else if (task === 'encouragement') {
        const base =
          contentDraft.trim() ||
          `${stu.fullName} có nhiều nỗ lực trong tuần qua ở lớp ${stu.classId}.`;
        const res = await aiService.convertToEncouragement(stu.fullName, base, {
          forceMock,
        });
        setEncouragementDraft(res.data);
        setIsAiGenerated(true);
        setAiSource(res.source);
        setAiNotice(res.notice);
      } else if (task === 'homeTip') {
        const res = await aiService.suggestHomeCompanion(stu, obs, {
          forceMock,
        });
        setHomeTipDraft(res.data);
        setIsAiGenerated(true);
        setAiSource(res.source);
        setAiNotice(res.notice);
      } else if (task === 'audit') {
        if (!contentDraft.trim()) {
          setAiError('Vui lòng nhập hoặc tạo nhận xét trước khi kiểm tra chất lượng.');
          setAiLoading(false);
          return;
        }
        const classOthers = comments.filter(
          (c) => c.classId === stu.classId && c.id !== editingComment?.id,
        );
        const res = await aiService.auditCommentQuality(
          contentDraft,
          classOthers,
          { forceMock },
        );
        setAuditReport(res.data);
        setAiNotice(res.notice);
      }
    } catch (err) {
      if (err instanceof GeminiApiCallError) {
        setAiError(err.message);
      } else {
        setAiError('Không thể kết nối dịch vụ AI. Vui lòng thử lại.');
      }
    } finally {
      setAiLoading(false);
    }
  };

  const handleSaveDraft = (e: React.FormEvent) => {
    e.preventDefault();
    const stu = studentMap.get(selectedStudentId);
    if (!stu) return;
    if (contentDraft.trim().length < 15) {
      setAiError('Nội dung nhận xét cần tối thiểu 15 ký tự.');
      return;
    }

    try {
      if (editingComment) {
        commentService.updateDraftComment(currentUser, editingComment.id, {
          periodLabel,
          content: contentDraft,
          encouragementText: encouragementDraft,
          homeCompanionTip: homeTipDraft,
        });
        showToast(
          'Đã cập nhật bản nháp nhận xét',
          `${stu.fullName} · Trạng thái trở về Bản nháp (DRAFT)`,
          'success',
        );
      } else {
        commentService.createDraftComment(currentUser, {
          studentId: stu.id,
          classId: stu.classId,
          periodLabel,
          content: contentDraft,
          encouragementText:
            encouragementDraft.trim() ||
            `Cô ghi nhận cố gắng của ${stu.fullName} trong tuần học vừa qua!`,
          homeCompanionTip:
            homeTipDraft.trim() ||
            `Phụ huynh cùng con duy trì nhịp tự học và nghỉ ngơi điều độ vào buổi tối.`,
          isAiGenerated,
          aiSource,
        });
        showToast(
          'Đã lưu nhận xét ở trạng thái DRAFT',
          `${stu.fullName} · Cần GVCN duyệt trước khi phát hành`,
          'success',
        );
      }
      setComposerOpen(false);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Lỗi lưu nhận xét.');
    }
  };

  const handleApprove = (cmt: PeriodicComment) => {
    try {
      commentService.approveComment(currentUser, cmt.id);
      const stu = studentMap.get(cmt.studentId);
      showToast('Đã duyệt nhận xét (APPROVED)', stu?.fullName, 'success');
    } catch (err) {
      showToast('Không thể duyệt', err instanceof Error ? err.message : '', 'error');
    }
  };

  const handlePublish = (cmt: PeriodicComment) => {
    try {
      commentService.publishComment(currentUser, cmt.id);
      const stu = studentMap.get(cmt.studentId);
      showToast(
        'Đã phát hành nhận xét (PUBLISHED)',
        `${stu?.fullName ?? ''} · Phụ huynh và Học sinh đã xem được`,
        'success',
      );
    } catch (err) {
      showToast('Không thể phát hành', err instanceof Error ? err.message : '', 'error');
    }
  };

  const handleRevert = (cmt: PeriodicComment) => {
    commentService.revertToDraft(currentUser, cmt.id);
    showToast('Đã đưa nhận xét về Bản nháp (DRAFT)', undefined, 'info');
  };

  const handleDelete = (cmt: PeriodicComment) => {
    commentService.deleteComment(currentUser, cmt.id);
    showToast('Đã xóa bản nhận xét', undefined, 'info');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
            Nhận xét định kỳ & Trợ lý AI
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Mọi nội dung do AI tạo đều khởi đầu ở trạng thái Bản nháp (DRAFT). Chỉ GVCN mới có quyền duyệt và phát hành.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs text-slate-600">
            Trạng thái AI:{' '}
            <strong className="text-slate-900">
              {aiStatus.geminiAvailable
                ? `Gemini AI (${aiStatus.model})`
                : 'AI mô phỏng (Demo Mode)'}
            </strong>
          </span>
          {isTeacher && (
            <button
              type="button"
              onClick={openNewComposer}
              className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-800 whitespace-nowrap"
            >
              <Bot className="h-4 w-4" />
              Soạn nhận xét mới / AI
            </button>
          )}
        </div>
      </div>

      {/* AI Composer Drawer / Panel */}
      {composerOpen && isTeacher && (
        <form
          onSubmit={handleSaveDraft}
          className="rounded-xl border border-teal-200 bg-white p-5 sm:p-6 space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {editingComment
                  ? 'Chỉnh sửa nhận xét (lưu về Bản nháp DRAFT)'
                  : 'Soạn nhận xét định kỳ với Trợ lý AI'}
              </h2>
              <p className="text-xs text-slate-500">
                {aiStatus.geminiAvailable
                  ? 'Kết nối Gemini AI qua máy chủ (luôn ở trạng thái DRAFT cho tới khi GVCN duyệt).'
                  : 'Chưa cấu hình GEMINI_API_KEY — Hệ thống sử dụng AI mô phỏng theo nhật ký quan sát của học sinh.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setComposerOpen(false)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Chọn học sinh lớp {currentUser.assignedClassId}
              </label>
              <select
                disabled={Boolean(editingComment)}
                value={selectedStudentId}
                onChange={(e) => {
                  setSelectedStudentId(e.target.value);
                  setAuditReport(null);
                }}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-600 disabled:bg-slate-100"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.studentCode} - {s.fullName} {s.needsAttention ? '(Cần quan tâm)' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Kỳ đánh giá
              </label>
              <input
                type="text"
                value={periodLabel}
                onChange={(e) => setPeriodLabel(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600"
              />
            </div>
          </div>

          {/* AI Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 rounded-lg bg-slate-50 p-3">
            <span className="text-xs font-semibold text-slate-700 mr-1">
              Công cụ AI:
            </span>
            <button
              type="button"
              disabled={aiLoading}
              onClick={() => runAiTask('comment')}
              className="rounded-lg border border-teal-600 bg-white px-3 py-1.5 text-xs font-semibold text-teal-800 hover:bg-teal-50 disabled:opacity-50"
            >
              1. Soạn nhận xét từ quan sát
            </button>
            <button
              type="button"
              disabled={aiLoading}
              onClick={() => runAiTask('encouragement')}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            >
              2. Chuyển thành lời khích lệ
            </button>
            <button
              type="button"
              disabled={aiLoading}
              onClick={() => runAiTask('homeTip')}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            >
              3. Gợi ý đồng hành tại nhà
            </button>
            <button
              type="button"
              disabled={aiLoading}
              onClick={() => runAiTask('audit')}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            >
              4. Kiểm tra trùng lặp / chung chung
            </button>
          </div>

          {aiLoading && (
            <p className="text-xs font-medium text-teal-700">
              Đang xử lý yêu cầu AI...
            </p>
          )}

          {aiNotice && (
            <div className="rounded-lg border border-sky-200 bg-sky-50 px-3.5 py-2.5 text-xs text-sky-900">
              {aiNotice}
            </div>
          )}

          {aiError && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-800">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{aiError}</span>
              </div>
              <button
                type="button"
                onClick={() => runAiTask('comment', true)}
                className="rounded border border-red-300 bg-white px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"
              >
                Dùng AI mô phỏng cục bộ
              </button>
            </div>
          )}

          {auditReport && (
            <div
              className={`rounded-lg border p-3.5 text-xs ${
                auditReport.severity === 'warning'
                  ? 'border-amber-200 bg-amber-50 text-amber-900'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-900'
              }`}
            >
              <p className="font-bold">
                {auditReport.isGenericOrRepetitive
                  ? 'Cảnh báo chất lượng: Nhận xét có dấu hiệu chung chung hoặc lặp ý'
                  : 'Kiểm tra đạt: Nhận xét cụ thể, mang tính cá nhân hóa tốt'}
              </p>
              <ul className="mt-1.5 list-disc pl-4 space-y-1">
                {auditReport.findings.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
              <p className="mt-2 font-semibold">Gợi ý chỉnh sửa:</p>
              <ul className="mt-1 list-disc pl-4 space-y-1">
                {auditReport.suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Nội dung nhận xét sư phạm (gửi phụ huynh sau khi duyệt)
            </label>
            <textarea
              rows={4}
              value={contentDraft}
              onChange={(e) => setContentDraft(e.target.value)}
              placeholder="Nhập hoặc dùng AI soạn thảo nhận xét chi tiết dựa trên quan sát thực tế..."
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm leading-relaxed outline-none focus:border-teal-600"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Lời khích lệ gửi riêng tới học sinh
              </label>
              <textarea
                rows={3}
                value={encouragementDraft}
                onChange={(e) => setEncouragementDraft(e.target.value)}
                placeholder="Thông điệp ấm áp động viên học sinh..."
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Gợi ý đồng hành tại nhà cho phụ huynh
              </label>
              <textarea
                rows={3}
                value={homeTipDraft}
                onChange={(e) => setHomeTipDraft(e.target.value)}
                placeholder="Hành động cụ thể gia đình có thể phối hợp trong tuần..."
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-3">
            <span className="text-xs text-slate-500">
              Lưu ý: Mọi nhận xét mới đều lưu ở trạng thái Bản nháp (DRAFT).
            </span>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setComposerOpen(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Đóng
              </button>
              <button
                type="submit"
                className="rounded-lg bg-teal-700 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-800"
              >
                Lưu bản nháp (DRAFT)
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <div className="relative w-full sm:w-80">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo học sinh hoặc nội dung nhận xét..."
            className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-teal-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1">
          {(['ALL', 'DRAFT', 'APPROVED', 'PUBLISHED'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-white text-teal-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st === 'ALL'
                ? `Tất cả (${comments.length})`
                : st === 'DRAFT'
                  ? 'Bản nháp (DRAFT)'
                  : st === 'APPROVED'
                    ? 'Đã duyệt (APPROVED)'
                    : 'Đã phát hành'}
            </button>
          ))}
        </div>
      </div>

      {/* Comments List */}
      {filteredComments.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          Không có nhận xét nào phù hợp bộ lọc hiện tại.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredComments.slice(0, 60).map((cmt) => {
            const stu = studentMap.get(cmt.studentId);
            return (
              <div
                key={cmt.id}
                className="rounded-xl border border-slate-200 bg-white p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <Link
                        to={`/students/${cmt.studentId}`}
                        className="text-sm font-bold text-slate-900 hover:text-teal-700"
                      >
                        {stu?.fullName ?? cmt.studentId}
                      </Link>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono-tabular">Lớp {cmt.classId}</span>
                      <span aria-hidden="true">·</span>
                      <span>{cmt.periodLabel}</span>
                      {cmt.isAiGenerated && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-medium text-sky-700">
                            {cmt.aiSource === 'gemini' ? 'Gợi ý Gemini AI' : 'Gợi ý AI mô phỏng'}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <WorkflowStatusText status={cmt.status} />
                </div>

                <p className="mt-2.5 text-sm leading-relaxed text-slate-800">
                  {cmt.content}
                </p>

                <div className="mt-3 grid grid-cols-1 gap-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-700 sm:grid-cols-2">
                  <div>
                    <span className="font-semibold text-teal-800">Lời khích lệ HS: </span>
                    {cmt.encouragementText}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900">Đồng hành tại nhà: </span>
                    {cmt.homeCompanionTip}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
                  <button
                    type="button"
                    onClick={() => setHistoryComment(cmt)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-teal-700"
                  >
                    <History className="h-3.5 w-3.5" />
                    Lịch sử duyệt ({cmt.approvalHistory.length})
                  </button>

                  {isTeacher && (
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditComposer(cmt)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Sửa
                      </button>

                      {cmt.status === 'DRAFT' && (
                        <button
                          type="button"
                          onClick={() => handleApprove(cmt)}
                          className="inline-flex items-center gap-1 rounded-lg bg-teal-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-800"
                        >
                          <ShieldCheck className="h-3.5 w-3.5" />
                          Duyệt (Approve)
                        </button>
                      )}

                      {cmt.status === 'APPROVED' && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleRevert(cmt)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Về nháp
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePublish(cmt)}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800"
                          >
                            <Send className="h-3.5 w-3.5" />
                            Phát hành (Publish)
                          </button>
                        </>
                      )}

                      {cmt.status === 'PUBLISHED' && (
                        <button
                          type="button"
                          onClick={() => handleRevert(cmt)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          Thu hồi về nháp
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDelete(cmt)}
                        className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-700"
                        aria-label="Xóa nhận xét"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Approval History Modal */}
      {historyComment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Lịch sử duyệt nhận xét
                </h3>
                <p className="text-xs text-slate-500">
                  {studentMap.get(historyComment.studentId)?.fullName} · {historyComment.periodLabel}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setHistoryComment(null)}
                className="rounded p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 space-y-3 max-h-80 overflow-y-auto">
              {historyComment.approvalHistory.map((item) => (
                <div key={item.id} className="flex items-start gap-3 text-xs">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" />
                  <div>
                    <p className="font-semibold text-slate-900">
                      {item.action} · {item.actorName}
                    </p>
                    <p className="font-mono-tabular text-slate-500">
                      {item.timestamp.replace('T', ' ').slice(0, 16)}
                    </p>
                    {item.note && <p className="mt-0.5 text-slate-600">{item.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
