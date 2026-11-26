import React, { useState } from 'react';
import {
  AlertCircle,
  Bot,
  CheckCircle2,
  Megaphone,
  Plus,
  Send,
  Trash2,
  X,
} from 'lucide-react';
import { useDemo } from '../context/DemoContext';
import { useToast } from '../context/ToastContext';
import { announcementService } from '../services/announcementService';
import { classService } from '../services/classService';
import { aiService, GeminiApiCallError } from '../services/aiService';
import type { Announcement } from '../types/domain';

const ANN_CATEGORIES: Announcement['category'][] = [
  'Học tập',
  'Sự kiện lớp',
  'Phối hợp phụ huynh',
  'Nhắc nhở tuần',
];

export function AnnouncementsPage() {
  const { currentUser, aiStatus } = useDemo();
  const { showToast } = useToast();

  const [composerOpen, setComposerOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Announcement['category']>('Học tập');
  const [keyPoints, setKeyPoints] = useState('');
  const [content, setContent] = useState('');
  const [isAiGenerated, setIsAiGenerated] = useState(false);
  const [aiSource, setAiSource] = useState<'gemini' | 'mock-ai' | 'manual'>('manual');
  const [aiNotice, setAiNotice] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  if (!currentUser) return null;

  const isTeacher = currentUser.role === 'GVCN';
  const isParent = currentUser.role === 'PARENT';
  const announcements = announcementService.getAccessibleAnnouncements(currentUser);

  const handleDraftWithAi = async (forceMock = false) => {
    if (!currentUser.assignedClassId) return;
    const classroom = classService.getClassById(currentUser.assignedClassId);
    if (!classroom) return;
    if (!title.trim()) {
      setAiError('Vui lòng nhập tiêu đề thông báo trước khi gọi AI.');
      return;
    }

    setAiLoading(true);
    setAiError(null);
    try {
      const res = await aiService.draftParentAnnouncement(
        classroom,
        title.trim(),
        keyPoints.trim(),
        { forceMock },
      );
      setContent(res.data);
      setIsAiGenerated(true);
      setAiSource(res.source);
      setAiNotice(res.notice);
    } catch (err) {
      setAiError(
        err instanceof GeminiApiCallError
          ? err.message
          : 'Lỗi kết nối dịch vụ AI.',
      );
    } finally {
      setAiLoading(false);
    }
  };

  const handleCreateDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser.assignedClassId) return;
    if (!title.trim() || content.trim().length < 15) {
      setAiError('Vui lòng nhập tiêu đề và nội dung tối thiểu 15 ký tự.');
      return;
    }

    announcementService.createDraftAnnouncement(currentUser, {
      classId: currentUser.assignedClassId,
      title,
      content,
      category,
      isAiGenerated,
      aiSource,
    });
    showToast(
      'Đã lưu thông báo ở trạng thái DRAFT',
      'GVCN cần nhấn Phát hành để phụ huynh nhận được.',
      'success',
    );
    setComposerOpen(false);
    setTitle('');
    setKeyPoints('');
    setContent('');
    setAiNotice(null);
    setAiError(null);
  };

  const handlePublish = (ann: Announcement) => {
    announcementService.publishAnnouncement(currentUser, ann.id);
    showToast('Đã phát hành thông báo tới phụ huynh lớp ' + ann.classId, ann.title, 'success');
  };

  const handleDelete = (ann: Announcement) => {
    announcementService.deleteAnnouncement(currentUser, ann.id);
    showToast('Đã xóa thông báo', ann.title, 'info');
  };

  const handleMarkRead = (annId: string) => {
    announcementService.markAsReadByParent(currentUser, annId);
    showToast('Đã đánh dấu đã đọc thông báo', undefined, 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
            Thông báo lớp học
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {isTeacher
              ? `Soạn thảo bản nháp, kiểm tra nội dung và phát hành tới 30 phụ huynh lớp ${currentUser.assignedClassId}.`
              : 'Theo dõi các thông báo chính thức đã được GVCN phát hành.'}
          </p>
        </div>

        {isTeacher && (
          <button
            type="button"
            onClick={() => {
              setComposerOpen(true);
              setAiError(null);
              setAiNotice(null);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-800 whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            Soạn thông báo mới
          </button>
        )}
      </div>

      {/* Composer */}
      {composerOpen && isTeacher && (
        <form
          onSubmit={handleCreateDraft}
          className="rounded-xl border border-teal-200 bg-white p-5 sm:p-6 space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="text-base font-bold text-slate-900">
              Soạn thông báo gửi phụ huynh lớp {currentUser.assignedClassId}
            </h2>
            <button
              type="button"
              onClick={() => setComposerOpen(false)}
              className="rounded p-1 text-slate-400 hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700">
                Tiêu đề thông báo
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Lịch ôn tập giữa học kỳ & nhắc nhở chuẩn bị đồ dùng"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Phân loại
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Announcement['category'])}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-600"
              >
                {ANN_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Ý chính cần truyền đạt (để AI soạn nhanh)
            </label>
            <div className="mt-1 flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                value={keyPoints}
                onChange={(e) => setKeyPoints(e.target.value)}
                placeholder="Ví dụ: Thứ Năm mặc đồng phục, mang vở ghi, nghỉ ngơi sớm trước 22h30..."
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600"
              />
              <button
                type="button"
                disabled={aiLoading}
                onClick={() => handleDraftWithAi(false)}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-teal-600 bg-white px-3.5 py-2 text-xs font-semibold text-teal-800 hover:bg-teal-50 disabled:opacity-50 whitespace-nowrap"
              >
                <Bot className="h-4 w-4" />
                {aiLoading
                  ? 'Đang soạn...'
                  : aiStatus.geminiAvailable
                    ? 'AI soạn thông báo'
                    : 'AI mô phỏng soạn tin'}
              </button>
            </div>
          </div>

          {aiNotice && (
            <div className="rounded-lg border border-sky-200 bg-sky-50 px-3.5 py-2 text-xs text-sky-900">
              {aiNotice}
            </div>
          )}

          {aiError && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2 text-xs text-red-800">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{aiError}</span>
              </div>
              <button
                type="button"
                onClick={() => handleDraftWithAi(true)}
                className="rounded border border-red-300 bg-white px-2.5 py-1 text-xs font-semibold text-red-700"
              >
                Dùng AI mô phỏng cục bộ
              </button>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Nội dung thông báo
            </label>
            <textarea
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Nội dung chi tiết gửi quý phụ huynh..."
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm leading-relaxed outline-none focus:border-teal-600"
            />
          </div>

          <div className="flex justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setComposerOpen(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="rounded-lg bg-teal-700 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-800"
            >
              Lưu bản nháp (DRAFT)
            </button>
          </div>
        </form>
      )}

      {/* List */}
      {announcements.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          Chưa có thông báo nào trong phạm vi hiển thị.
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((ann) => {
            const readCount = ann.readByParentIds.length;
            const readRate = Math.round(
              (readCount / Math.max(1, ann.targetParentCount)) * 100,
            );
            const readByCurrentParent = Boolean(
              currentUser.parentId && ann.readByParentIds.includes(currentUser.parentId),
            );

            return (
              <div
                key={ann.id}
                className="rounded-xl border border-slate-200 bg-white p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <Megaphone className="h-3.5 w-3.5 text-teal-700" />
                      <span className="font-semibold text-slate-700">
                        Lớp {ann.classId}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{ann.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono-tabular">
                        {(ann.publishedAt ?? ann.createdAt).slice(0, 10)}
                      </span>
                    </div>
                    <h2 className="mt-1.5 text-lg font-bold text-slate-900">
                      {ann.title}
                    </h2>
                  </div>

                  <div className="text-right">
                    {ann.status === 'PUBLISHED' ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Đã phát hành
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-amber-700">
                        Bản nháp (DRAFT)
                      </span>
                    )}
                    {ann.status === 'PUBLISHED' && (
                      <p className="mt-0.5 font-mono-tabular text-xs text-slate-500">
                        {readCount}/{ann.targetParentCount} phụ huynh đã đọc ({readRate}%)
                      </p>
                    )}
                  </div>
                </div>

                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-700">
                  {ann.content}
                </p>

                <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-3">
                  {isParent && ann.status === 'PUBLISHED' && (
                    readByCurrentParent ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                        <CheckCircle2 className="h-4 w-4" />
                        Gia đình đã xác nhận đọc tin
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleMarkRead(ann.id)}
                        className="rounded-lg bg-teal-700 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-teal-800"
                      >
                        Xác nhận đã đọc
                      </button>
                    )
                  )}

                  {isTeacher && ann.classId === currentUser.assignedClassId && (
                    <>
                      {ann.status === 'DRAFT' && (
                        <button
                          type="button"
                          onClick={() => handlePublish(ann)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800"
                        >
                          <Send className="h-3.5 w-3.5" />
                          Phát hành tới phụ huynh
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDelete(ann)}
                        className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-700"
                        aria-label="Xóa thông báo"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
