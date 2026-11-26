import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Pencil, Plus, Search, ShieldAlert, Trash2, X } from 'lucide-react';
import { useDemo } from '../context/DemoContext';
import { useToast } from '../context/ToastContext';
import { observationService } from '../services/observationService';
import { studentService } from '../services/studentService';
import type { Observation, ObservationCategory } from '../types/domain';

const CATEGORIES: ObservationCategory[] = [
  'Học tập',
  'Kỷ luật & Nề nếp',
  'Kỹ năng xã hội',
  'Cảm xúc & Tâm lý',
  'Hoạt động phong trào',
];

export function ObservationsPage() {
  const { currentUser } = useDemo();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const preselectedStudent = searchParams.get('student') ?? '';

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ObservationCategory | 'ALL'>('ALL');
  const [sentimentFilter, setSentimentFilter] = useState<'ALL' | 'positive' | 'neutral' | 'attention'>('ALL');

  const [modalOpen, setModalOpen] = useState(Boolean(preselectedStudent));
  const [editingObs, setEditingObs] = useState<Observation | null>(null);
  const [formStudentId, setFormStudentId] = useState(preselectedStudent);
  const [formCategory, setFormCategory] = useState<ObservationCategory>('Học tập');
  const [formSentiment, setFormSentiment] = useState<'positive' | 'neutral' | 'attention'>('positive');
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formDate, setFormDate] = useState('2026-11-25');
  const [formError, setFormError] = useState<string | null>(null);

  if (!currentUser) return null;

  if (currentUser.role === 'PARENT' || currentUser.role === 'STUDENT') {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
        <ShieldAlert className="mx-auto h-10 w-10 text-amber-600" />
        <h1 className="mt-3 text-lg font-bold text-slate-900">
          Nhật ký quan sát nội bộ của GVCN
        </h1>
        <p className="mt-1.5 text-sm text-slate-600">
          Ghi chép quan sát thô chỉ dành cho GVCN và Ban Giám hiệu. Phụ huynh và học sinh xem nội dung đã tổng hợp ở mục Nhận xét định kỳ.
        </p>
      </div>
    );
  }

  const canEdit = currentUser.role === 'GVCN';
  const students = studentService.getAccessibleStudents(currentUser);
  const observations = observationService.getAccessibleObservations(currentUser);

  const studentMap = useMemo(() => {
    const map = new Map(students.map((s) => [s.id, s]));
    return map;
  }, [students]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return observations.filter((obs) => {
      if (categoryFilter !== 'ALL' && obs.category !== categoryFilter) return false;
      if (sentimentFilter !== 'ALL' && obs.sentiment !== sentimentFilter) return false;
      if (q) {
        const stu = studentMap.get(obs.studentId);
        const hay = `${obs.title} ${obs.content} ${stu?.fullName ?? ''} ${stu?.studentCode ?? ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [observations, categoryFilter, sentimentFilter, search, studentMap]);

  const openCreateModal = () => {
    setEditingObs(null);
    setFormStudentId(students[0]?.id ?? '');
    setFormCategory('Học tập');
    setFormSentiment('positive');
    setFormTitle('');
    setFormContent('');
    setFormDate('2026-11-25');
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (obs: Observation) => {
    setEditingObs(obs);
    setFormStudentId(obs.studentId);
    setFormCategory(obs.category);
    setFormSentiment(obs.sentiment);
    setFormTitle(obs.title);
    setFormContent(obs.content);
    setFormDate(obs.observedAt);
    setFormError(null);
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!formStudentId || !formTitle.trim() || formContent.trim().length < 10) {
      setFormError('Vui lòng chọn học sinh, nhập tiêu đề và nội dung tối thiểu 10 ký tự.');
      return;
    }

    try {
      if (editingObs) {
        observationService.updateObservation(currentUser, editingObs.id, {
          category: formCategory,
          sentiment: formSentiment,
          title: formTitle,
          content: formContent,
          observedAt: formDate,
        });
        showToast('Đã cập nhật nhật ký quan sát', formTitle, 'success');
      } else {
        const stu = studentMap.get(formStudentId);
        if (!stu) return;
        observationService.addObservation(currentUser, {
          studentId: stu.id,
          classId: stu.classId,
          category: formCategory,
          sentiment: formSentiment,
          title: formTitle,
          content: formContent,
          observedAt: formDate,
          tags: [formCategory],
        });
        showToast('Đã thêm nhật ký quan sát mới', stu.fullName, 'success');
      }
      setModalOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Không thể lưu nhật ký.');
    }
  };

  const handleDelete = (obs: Observation) => {
    observationService.deleteObservation(currentUser, obs.id);
    showToast('Đã xóa ghi chép quan sát', obs.title, 'info');
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
            Nhật ký quan sát GVCN
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {canEdit
              ? `Ghi nhận biểu hiện hằng ngày của học sinh lớp ${currentUser.assignedClassId} làm căn cứ soạn nhận xét.`
              : 'Chế độ xem tổng hợp nhật ký quan sát của 5 lớp.'}
          </p>
        </div>
        {canEdit && (
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-800 whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            Thêm nhật ký quan sát
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-12">
        <div className="relative md:col-span-5">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo học sinh, tiêu đề hoặc nội dung..."
            className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-teal-600"
          />
        </div>
        <div className="md:col-span-4">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as ObservationCategory | 'ALL')}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-600"
          >
            <option value="ALL">Lĩnh vực: Tất cả</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-3">
          <select
            value={sentimentFilter}
            onChange={(e) =>
              setSentimentFilter(
                e.target.value as 'ALL' | 'positive' | 'neutral' | 'attention',
              )
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-600"
          >
            <option value="ALL">Mức độ: Tất cả</option>
            <option value="positive">Tích cực</option>
            <option value="neutral">Bình thường</option>
            <option value="attention">Cần chú ý</option>
          </select>
        </div>
      </div>

      {/* Observations List */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
          <p className="text-sm font-semibold text-slate-900">
            Chưa có nhật ký quan sát nào phù hợp bộ lọc
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.slice(0, 60).map((obs) => {
            const stu = studentMap.get(obs.studentId);
            const sentimentLabel =
              obs.sentiment === 'positive'
                ? 'Tích cực'
                : obs.sentiment === 'attention'
                  ? 'Cần chú ý'
                  : 'Theo dõi';
            const sentimentColor =
              obs.sentiment === 'positive'
                ? 'text-emerald-700'
                : obs.sentiment === 'attention'
                  ? 'text-red-700'
                  : 'text-slate-600';

            return (
              <div
                key={obs.id}
                className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <Link
                        to={`/students/${obs.studentId}`}
                        className="font-semibold text-teal-800 hover:underline"
                      >
                        {stu?.fullName ?? obs.studentId}
                      </Link>
                      <span aria-hidden="true">·</span>
                      <span>Lớp {obs.classId}</span>
                      <span aria-hidden="true">·</span>
                      <span>{obs.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className={`font-semibold ${sentimentColor}`}>
                        {sentimentLabel}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono-tabular">{obs.observedAt}</span>
                    </div>
                    <h2 className="mt-1.5 text-base font-bold text-slate-900">
                      {obs.title}
                    </h2>
                    <p className="mt-1 text-sm leading-relaxed text-slate-700">
                      {obs.content}
                    </p>
                  </div>

                  {canEdit && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => openEditModal(obs)}
                        className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 hover:text-teal-700"
                        aria-label="Chỉnh sửa nhật ký"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(obs)}
                        className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-red-50 hover:text-red-700"
                        aria-label="Xóa nhật ký"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <form
            onSubmit={handleSave}
            className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {editingObs ? 'Chỉnh sửa nhật ký quan sát' : 'Thêm nhật ký quan sát mới'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {!editingObs && (
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Học sinh lớp {currentUser.assignedClassId}
                </label>
                <select
                  value={formStudentId}
                  onChange={(e) => setFormStudentId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-600"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.studentCode} - {s.fullName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Lĩnh vực</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as ObservationCategory)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm outline-none focus:border-teal-600"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">Mức độ</label>
                <select
                  value={formSentiment}
                  onChange={(e) =>
                    setFormSentiment(
                      e.target.value as 'positive' | 'neutral' | 'attention',
                    )
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm outline-none focus:border-teal-600"
                >
                  <option value="positive">Tích cực</option>
                  <option value="neutral">Theo dõi</option>
                  <option value="attention">Cần chú ý</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">Ngày ghi</label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-2.5 py-2 text-sm outline-none focus:border-teal-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Tiêu đề ngắn</label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Ví dụ: Chủ động hỗ trợ bạn làm bài tập nhóm"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Nội dung quan sát chi tiết
              </label>
              <textarea
                rows={3}
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                placeholder="Ghi nhận hành vi cụ thể trong tiết học hoặc giờ sinh hoạt..."
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600"
              />
            </div>

            {formError && (
              <p className="text-xs font-medium text-red-600">{formError}</p>
            )}

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="rounded-lg bg-teal-700 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-800"
              >
                {editingObs ? 'Lưu cập nhật' : 'Lưu nhật ký'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
