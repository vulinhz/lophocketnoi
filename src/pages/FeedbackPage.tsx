import React, { useState } from 'react';
import { Bot, CheckCircle2, MessageSquare, Send, ShieldAlert } from 'lucide-react';
import { useDemo } from '../context/DemoContext';
import { useToast } from '../context/ToastContext';
import { feedbackService } from '../services/feedbackService';
import { studentService } from '../services/studentService';
import { aiService, GeminiApiCallError } from '../services/aiService';
import type { ParentFeedback } from '../types/domain';

const TOPICS: ParentFeedback['topic'][] = [
  'Học tập',
  'Tâm lý - Nề nếp',
  'Sức khỏe',
  'Đề xuất lớp học',
];

export function FeedbackPage() {
  const { currentUser, db, aiStatus } = useDemo();
  const { showToast } = useToast();

  const [topic, setTopic] = useState<ParentFeedback['topic']>('Học tập');
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [summaryText, setSummaryText] = useState<string | null>(null);
  const [summaryNotice, setSummaryNotice] = useState<string | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  if (!currentUser) return null;

  if (currentUser.role === 'STUDENT') {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
        <ShieldAlert className="mx-auto h-10 w-10 text-amber-600" />
        <h1 className="mt-3 text-lg font-bold text-slate-900">
          Kênh trao đổi dành cho Phụ huynh & GVCN
        </h1>
        <p className="mt-1.5 text-sm text-slate-600">
          Học sinh vui lòng sử dụng mục Tự đánh giá & Mục tiêu để gửi chia sẻ tới GVCN.
        </p>
      </div>
    );
  }

  const isParent = currentUser.role === 'PARENT';
  const isTeacher = currentUser.role === 'GVCN';
  const feedbacks = feedbackService.getAccessibleFeedback(currentUser);

  const studentNameById = new Map(db.students.map((s) => [s.id, s.fullName]));

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (message.trim().length < 10) {
      setFormError('Vui lòng nhập nội dung phản hồi tối thiểu 10 ký tự.');
      return;
    }
    feedbackService.submitFeedback(currentUser, { topic, message });
    setMessage('');
    showToast('Đã gửi phản hồi tới GVCN', `Chủ đề: ${topic}`, 'success');
  };

  const handleSendReply = (fbId: string) => {
    const text = (replyDrafts[fbId] ?? '').trim();
    if (text.length < 5) {
      showToast('Nội dung trả lời quá ngắn', undefined, 'error');
      return;
    }
    feedbackService.replyFeedback(currentUser, fbId, text);
    setReplyDrafts((prev) => ({ ...prev, [fbId]: '' }));
    showToast('Đã gửi phản hồi tới phụ huynh', undefined, 'success');
  };

  const handleAiSummarize = async (forceMock = false) => {
    setSummaryLoading(true);
    setSummaryError(null);
    try {
      const label =
        currentUser.role === 'ADMIN'
          ? 'toàn trường (5 lớp)'
          : `lớp ${currentUser.assignedClassId}`;
      const res = await aiService.summarizeParentFeedback(feedbacks, label, {
        forceMock,
      });
      setSummaryText(res.data);
      setSummaryNotice(res.notice);
    } catch (err) {
      setSummaryError(
        err instanceof GeminiApiCallError ? err.message : 'Lỗi kết nối dịch vụ AI.',
      );
    } finally {
      setSummaryLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
            Phản hồi phụ huynh & Trao đổi 2 chiều
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {isParent
              ? 'Gửi trao đổi trực tiếp tới GVCN về tình hình học tập và sinh hoạt tại nhà của con.'
              : 'Lắng nghe, phản hồi phụ huynh và tóm tắt nhanh các nhóm ý kiến bằng AI.'}
          </p>
        </div>

        {(isTeacher || currentUser.role === 'ADMIN') && (
          <button
            type="button"
            disabled={summaryLoading}
            onClick={() => handleAiSummarize(false)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-800 disabled:opacity-50 whitespace-nowrap"
          >
            <Bot className="h-4 w-4" />
            {summaryLoading
              ? 'Đang tóm tắt...'
              : aiStatus.geminiAvailable
                ? 'AI Tóm tắt phản hồi'
                : 'AI mô phỏng tóm tắt phản hồi'}
          </button>
        )}
      </div>

      {/* AI Summary Panel */}
      {(summaryText || summaryError) && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              Bản tóm tắt phản hồi phụ huynh
            </h2>
            {summaryNotice && (
              <span className="text-xs text-sky-700 font-medium">{summaryNotice}</span>
            )}
          </div>
          {summaryError ? (
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-red-700">
              <span>{summaryError}</span>
              <button
                type="button"
                onClick={() => handleAiSummarize(true)}
                className="rounded border border-red-300 px-2.5 py-1 font-semibold"
              >
                Dùng AI mô phỏng cục bộ
              </button>
            </div>
          ) : (
            <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">
              {summaryText}
            </p>
          )}
        </div>
      )}

      {/* Parent Form */}
      {isParent && (
        <form
          onSubmit={handleSubmitFeedback}
          className="rounded-xl border border-slate-200 bg-white p-5 space-y-4"
        >
          <h2 className="text-base font-bold text-slate-900">
            Gửi phản hồi mới tới GVCN lớp {currentUser.assignedClassId}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Chủ đề trao đổi
              </label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value as ParentFeedback['topic'])}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-600"
              >
                {TOPICS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700">
                Học sinh liên kết
              </label>
              <input
                type="text"
                disabled
                value={
                  studentService.getStudentById(
                    currentUser,
                    currentUser.linkedStudentId ?? '',
                  )?.fullName ?? ''
                }
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Nội dung trao đổi với giáo viên
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Chia sẻ tình hình tự học, sức khỏe hoặc đề xuất phối hợp cùng lớp..."
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600"
            />
          </div>

          {formError && <p className="text-xs font-medium text-red-600">{formError}</p>}

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-800"
            >
              <Send className="h-3.5 w-3.5" />
              Gửi phản hồi
            </button>
          </div>
        </form>
      )}

      {/* Feedback Threads */}
      {feedbacks.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          Chưa có phản hồi nào trong phạm vi này.
        </div>
      ) : (
        <div className="space-y-4">
          {feedbacks.map((fb) => (
            <div
              key={fb.id}
              className="rounded-xl border border-slate-200 bg-white p-5 space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <MessageSquare className="h-4 w-4 text-teal-700" />
                  <span className="font-semibold text-slate-900">{fb.parentName}</span>
                  <span aria-hidden="true">·</span>
                  <span>PH em {studentNameById.get(fb.studentId) ?? fb.studentId}</span>
                  <span aria-hidden="true">·</span>
                  <span>Lớp {fb.classId}</span>
                  <span aria-hidden="true">·</span>
                  <span>{fb.topic}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-mono-tabular text-slate-500">
                    {fb.createdAt.slice(0, 10)}
                  </span>
                  {fb.isResolved ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Đã phản hồi
                    </span>
                  ) : (
                    <span className="font-semibold text-amber-700">Chờ trả lời</span>
                  )}
                </div>
              </div>

              <p className="text-sm leading-relaxed text-slate-800">{fb.message}</p>

              {fb.teacherReply ? (
                <div className="rounded-lg bg-slate-50 p-3.5 text-sm text-slate-700">
                  <p className="text-xs font-bold text-teal-800">
                    Phản hồi của GVCN ({fb.repliedAt?.slice(0, 10)})
                  </p>
                  <p className="mt-1 leading-relaxed">{fb.teacherReply}</p>
                </div>
              ) : (
                isTeacher &&
                fb.classId === currentUser.assignedClassId && (
                  <div className="flex flex-col gap-2 border-t border-slate-100 pt-3 sm:flex-row">
                    <input
                      type="text"
                      value={replyDrafts[fb.id] ?? ''}
                      onChange={(e) =>
                        setReplyDrafts((prev) => ({
                          ...prev,
                          [fb.id]: e.target.value,
                        }))
                      }
                      placeholder="Nhập câu trả lời gửi phụ huynh..."
                      className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600"
                    />
                    <button
                      type="button"
                      onClick={() => handleSendReply(fb.id)}
                      className="rounded-lg bg-teal-700 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-800 whitespace-nowrap"
                    >
                      Gửi trả lời
                    </button>
                  </div>
                )
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
