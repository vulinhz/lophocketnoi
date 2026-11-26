import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  Award,
  BookOpen,
  CheckCircle2,
  FileText,
  Pencil,
  Plus,
  ShieldAlert,
  Target,
} from 'lucide-react';
import { useDemo } from '../context/DemoContext';
import { useToast } from '../context/ToastContext';
import { studentService } from '../services/studentService';
import { classService } from '../services/classService';
import { observationService } from '../services/observationService';
import { commentService } from '../services/commentService';
import { StudentAvatar } from '../components/StudentAvatar';
import { AttentionStatusText, WorkflowStatusText } from '../components/StatusLabel';

export function StudentProfilePage() {
  const { studentId } = useParams<{ studentId: string }>();
  const { currentUser } = useDemo();
  const { showToast } = useToast();

  const [editingNote, setEditingNote] = useState(false);
  const [noteDraft, setNoteDraft] = useState('');
  const [attentionModalOpen, setAttentionModalOpen] = useState(false);
  const [attentionReasonDraft, setAttentionReasonDraft] = useState('');
  const [badgePickerOpen, setBadgePickerOpen] = useState(false);

  if (!currentUser || !studentId) return null;

  const student = studentService.getStudentById(currentUser, studentId);

  if (!student) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
        <ShieldAlert className="mx-auto h-10 w-10 text-red-600" />
        <h1 className="mt-3 text-lg font-bold text-slate-900">
          Không có quyền truy cập hồ sơ này
        </h1>
        <p className="mx-auto mt-1.5 max-w-md text-sm text-slate-600">
          Theo phân quyền demo, mỗi tài khoản chỉ được xem hồ sơ học sinh thuộc phạm vi phụ trách hoặc liên kết trực tiếp.
        </p>
        <Link
          to="/"
          className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Quay về trang chính
        </Link>
      </div>
    );
  }

  const isOwnClassTeacher =
    currentUser.role === 'GVCN' && currentUser.assignedClassId === student.classId;
  const classroom = classService.getClassById(student.classId);
  const teacher = classroom
    ? classService.getTeacherById(classroom.homeroomTeacherId)
    : undefined;
  const observations = observationService.getObservationsForStudent(
    currentUser,
    student.id,
  );
  const comments = commentService.getCommentsForStudent(currentUser, student.id);
  const assessments = studentService.getAssessmentsForStudent(student.id);
  const goals = studentService.getGoalsForStudent(student.id);
  const allBadges = studentService.getAllBadges();
  const earnedBadges = allBadges.filter((b) => student.badgeIds.includes(b.id));
  const unearnedBadges = allBadges.filter((b) => !student.badgeIds.includes(b.id));

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteDraft.trim()) return;
    studentService.updateStudentProfile(student.id, {
      personalityNote: noteDraft.trim(),
    });
    setEditingNote(false);
    showToast('Đã cập nhật ghi chú hồ sơ', student.fullName, 'success');
  };

  const handleToggleAttention = (e: React.FormEvent) => {
    e.preventDefault();
    const nextVal = !student.needsAttention;
    studentService.toggleNeedsAttention(
      student.id,
      nextVal,
      nextVal ? attentionReasonDraft : undefined,
    );
    setAttentionModalOpen(false);
    showToast(
      nextVal ? 'Đã gắn cờ Cần quan tâm' : 'Đã chuyển trạng thái Ổn định',
      student.fullName,
      'success',
    );
  };

  const handleAwardBadge = (badgeId: string) => {
    studentService.awardBadge(student.id, badgeId);
    setBadgePickerOpen(false);
    showToast('Đã trao huy hiệu nỗ lực (+15 điểm)', student.fullName, 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to={
            currentUser.role === 'ADMIN' || currentUser.role === 'GVCN'
              ? '/students'
              : '/'
          }
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-teal-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {currentUser.role === 'ADMIN' || currentUser.role === 'GVCN'
            ? 'Quay lại danh sách học sinh'
            : 'Quay lại trang tổng quan'}
        </Link>

        {isOwnClassTeacher && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setAttentionReasonDraft(student.attentionReason ?? '');
                setAttentionModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
              {student.needsAttention ? 'Bỏ cờ cần quan tâm' : 'Đánh dấu cần quan tâm'}
            </button>
            <Link
              to={`/comments?student=${student.id}`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-teal-800"
            >
              <FileText className="h-3.5 w-3.5" />
              Soạn nhận xét AI cho em
            </Link>
          </div>
        )}
      </div>

      {/* Header Profile Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <StudentAvatar
              fullName={student.fullName}
              palette={student.avatarPalette}
              size="lg"
            />
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-display text-2xl font-bold text-slate-900">
                  {student.fullName}
                </h1>
                <AttentionStatusText needsAttention={student.needsAttention} />
              </div>
              <p className="mt-1 font-mono-tabular text-xs text-slate-500">
                Mã HS: {student.studentCode} · Lớp {student.classId} · Giới tính: {student.gender} · Ngày sinh: {student.birthDate}
              </p>
              <p className="mt-2 text-xs text-slate-600">
                GVCN: <span className="font-semibold text-slate-800">{teacher?.fullName}</span> · Phụ huynh:{' '}
                <span className="font-semibold text-slate-800">{student.parentName}</span> ({student.parentPhone})
              </p>
              {student.needsAttention && student.attentionReason && (
                <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
                  <span className="font-semibold">Lý do cần lưu ý: </span>
                  {student.attentionReason}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 border-t border-slate-200 pt-4 md:border-t-0 md:pt-0">
            <div className="text-center">
              <p className="font-mono-tabular text-xl font-bold text-slate-900">
                {student.gpa.toFixed(1)}
              </p>
              <p className="text-xs text-slate-500">Điểm TB</p>
            </div>
            <div className="text-center">
              <p className="font-mono-tabular text-xl font-bold text-teal-700">
                {student.conduct}
              </p>
              <p className="text-xs text-slate-500">Rèn luyện</p>
            </div>
            <div className="text-center">
              <p className="font-mono-tabular text-xl font-bold text-slate-900">
                {student.attendanceRate}%
              </p>
              <p className="text-xs text-slate-500">Chuyên cần</p>
            </div>
            <div className="text-center">
              <p className="font-mono-tabular text-xl font-bold text-amber-700">
                {student.effortPoints}
              </p>
              <p className="text-xs text-slate-500">Điểm nỗ lực</p>
            </div>
          </div>
        </div>

        {/* Personality Note */}
        <div className="mt-6 border-t border-slate-200 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-slate-500">
              Đặc điểm tính cách & Tiến trình học tập
            </h2>
            {isOwnClassTeacher && !editingNote && (
              <button
                type="button"
                onClick={() => {
                  setNoteDraft(student.personalityNote);
                  setEditingNote(true);
                }}
                className="inline-flex items-center gap-1 text-xs font-medium text-teal-700 hover:underline"
              >
                <Pencil className="h-3.5 w-3.5" />
                Chỉnh sửa ghi chú
              </button>
            )}
          </div>
          {editingNote ? (
            <form onSubmit={handleSaveNote} className="mt-2 space-y-2">
              <textarea
                rows={2}
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="rounded-lg bg-teal-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-800"
                >
                  Lưu thay đổi
                </button>
                <button
                  type="button"
                  onClick={() => setEditingNote(false)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600"
                >
                  Hủy
                </button>
              </div>
            </form>
          ) : (
            <p className="mt-1 text-sm leading-relaxed text-slate-700">
              {student.personalityNote}
            </p>
          )}
        </div>

        {/* Strengths, Focus Areas, Interests */}
        <div className="mt-5 grid grid-cols-1 gap-4 border-t border-slate-200 pt-4 md:grid-cols-3">
          <div>
            <p className="text-xs font-semibold text-slate-500">Thế mạnh nổi bật</p>
            <ul className="mt-2 space-y-1.5 text-sm text-slate-800">
              {student.strengths.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Điểm cần rèn thêm</p>
            <ul className="mt-2 space-y-1.5 text-sm text-slate-800">
              {student.focusAreas.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Target className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Sở thích & CLB</p>
            <p className="mt-2 text-sm text-slate-800">
              {student.interests.join(' · ')}
            </p>
          </div>
        </div>
      </div>

      {/* Effort Badges */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-teal-700" />
            <h2 className="text-base font-bold text-slate-900">
              Huy hiệu nỗ lực ({earnedBadges.length})
            </h2>
          </div>
          {isOwnClassTeacher && unearnedBadges.length > 0 && (
            <button
              type="button"
              onClick={() => setBadgePickerOpen((v) => !v)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-teal-700 hover:bg-teal-50"
            >
              <Plus className="h-3.5 w-3.5" />
              Trao thêm huy hiệu
            </button>
          )}
        </div>

        {badgePickerOpen && (
          <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold text-slate-700">
              Chọn huy hiệu để ghi nhận nỗ lực của {student.fullName}:
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {unearnedBadges.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => handleAwardBadge(b.id)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 hover:border-teal-600 hover:text-teal-800"
                >
                  + {b.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {earnedBadges.map((b) => (
            <div key={b.id} className="rounded-lg border border-slate-200 p-3.5">
              <p className="text-sm font-bold text-teal-800">{b.name}</p>
              <p className="mt-1 text-xs text-slate-600">{b.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Periodic Comments + Observations (Admin/GVCN only for raw observations) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-base font-bold text-slate-900">
            Nhận xét định kỳ ({comments.length})
          </h2>
          <p className="mb-3 text-xs text-slate-500">
            {currentUser.role === 'PARENT' || currentUser.role === 'STUDENT'
              ? 'Chỉ hiển thị các nhận xét đã được GVCN duyệt và phát hành.'
              : 'Hiển thị cả bản nháp (DRAFT), đã duyệt (APPROVED) và đã phát hành (PUBLISHED).'}
          </p>
          {comments.length === 0 ? (
            <p className="rounded-lg bg-slate-50 p-5 text-center text-sm text-slate-500">
              Chưa có nhận xét nào trong phạm vi hiển thị.
            </p>
          ) : (
            <div className="space-y-3">
              {comments.map((cmt) => (
                <div key={cmt.id} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-700">
                      {cmt.periodLabel}
                    </span>
                    <WorkflowStatusText status={cmt.status} />
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-800">
                    {cmt.content}
                  </p>
                  {cmt.encouragementText && (
                    <p className="mt-2 text-xs text-teal-800">
                      <span className="font-semibold">Lời khích lệ: </span>
                      {cmt.encouragementText}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          {(currentUser.role === 'ADMIN' || currentUser.role === 'GVCN') && (
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-teal-700" />
                  <h2 className="text-base font-bold text-slate-900">
                    Nhật ký quan sát GVCN ({observations.length})
                  </h2>
                </div>
                {isOwnClassTeacher && (
                  <Link
                    to={`/observations?student=${student.id}`}
                    className="text-xs font-semibold text-teal-700 hover:underline"
                  >
                    + Thêm quan sát
                  </Link>
                )}
              </div>
              {observations.length === 0 ? (
                <p className="text-sm text-slate-500">Chưa có ghi chép quan sát nào.</p>
              ) : (
                <div className="divide-y divide-slate-200">
                  {observations.map((obs) => (
                    <div key={obs.id} className="py-3 first:pt-1 last:pb-1">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="font-semibold text-slate-700">{obs.category}</span>
                        <span className="font-mono-tabular">{obs.observedAt}</span>
                      </div>
                      <p className="mt-1 text-sm font-semibold text-slate-900">{obs.title}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
                        {obs.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Self Assessments & Goals */}
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-base font-bold text-slate-900">
              Tự đánh giá & Mục tiêu tuần
            </h2>
            {assessments.length > 0 ? (
              <div className="mt-3 rounded-lg bg-slate-50 p-3.5 text-xs text-slate-700 space-y-1.5">
                <p className="font-semibold text-slate-900">
                  {assessments[0].weekLabel} · Tâm trạng: {assessments[0].mood} · Tập trung:{' '}
                  {assessments[0].focusScore}/5
                </p>
                <p>
                  <span className="font-semibold">Điều tự hào:</span> {assessments[0].weeklyWin}
                </p>
                <p>
                  <span className="font-semibold">Khó khăn:</span> {assessments[0].challenge}
                </p>
              </div>
            ) : (
              <p className="mt-2 text-xs text-slate-500">
                Học sinh chưa nộp phiếu tự đánh giá tuần này.
              </p>
            )}

            <div className="mt-4 space-y-2">
              <p className="text-xs font-semibold text-slate-500">
                Mục tiêu tuần ({goals.length})
              </p>
              {goals.length === 0 ? (
                <p className="text-xs text-slate-500">Chưa đặt mục tiêu tuần.</p>
              ) : (
                goals.map((g) => (
                  <div key={g.id} className="rounded-lg border border-slate-200 p-3">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-semibold text-slate-800">{g.title}</span>
                      <span className="font-mono-tabular font-semibold text-teal-700">
                        {g.progress}%
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Attention Reason Modal */}
      {attentionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <form
            onSubmit={handleToggleAttention}
            className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl"
          >
            <h3 className="text-base font-bold text-slate-900">
              {student.needsAttention
                ? `Chuyển ${student.fullName} sang trạng thái Ổn định?`
                : `Đánh dấu ${student.fullName} cần quan tâm`}
            </h3>
            {!student.needsAttention && (
              <div className="mt-3">
                <label className="block text-xs font-semibold text-slate-700">
                  Ghi chú lý do cần theo dõi
                </label>
                <textarea
                  rows={3}
                  required
                  value={attentionReasonDraft}
                  onChange={(e) => setAttentionReasonDraft(e.target.value)}
                  placeholder="Ví dụ: Có dấu hiệu mệt mỏi buổi chiều hoặc điểm kiểm tra giảm nhẹ..."
                  className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600"
                />
              </div>
            )}
            <div className="mt-5 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setAttentionModalOpen(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="rounded-lg bg-teal-700 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-800"
              >
                Xác nhận
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
