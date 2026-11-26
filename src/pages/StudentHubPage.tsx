import React, { useState } from 'react';
import { Award, CheckCircle2, Plus, ShieldAlert, Target, Trash2 } from 'lucide-react';
import { useDemo } from '../context/DemoContext';
import { useToast } from '../context/ToastContext';
import { studentService } from '../services/studentService';
import type { SelfAssessment, WeeklyGoal } from '../types/domain';
import { EFFORT_BADGE_IMAGE } from '../data/mockTeachers';

export function StudentHubPage() {
  const { currentUser } = useDemo();
  const { showToast } = useToast();

  const [goalTitle, setGoalTitle] = useState('');
  const [goalCategory, setGoalCategory] = useState<WeeklyGoal['category']>('Học tập');

  const [mood, setMood] = useState<SelfAssessment['mood']>('Ổn định');
  const [focusScore, setFocusScore] = useState(4);
  const [studyHours, setStudyHours] = useState(2);
  const [weeklyWin, setWeeklyWin] = useState('');
  const [challenge, setChallenge] = useState('');
  const [supportNeeded, setSupportNeeded] = useState('');

  if (!currentUser || !currentUser.linkedStudentId) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
        <ShieldAlert className="mx-auto h-10 w-10 text-amber-600" />
        <h1 className="mt-3 text-lg font-bold text-slate-900">
          Khu vực dành riêng cho tài khoản Học sinh
        </h1>
        <p className="mt-1.5 text-sm text-slate-600">
          Hãy chuyển sang một trong các tài khoản học sinh (student01@hpu2.it, student02@hpu2.it, student03@hpu2.it) để trải nghiệm đầy đủ.
        </p>
      </div>
    );
  }

  const student = studentService.getStudentById(currentUser, currentUser.linkedStudentId);
  if (!student) return null;

  const isStudentRole = currentUser.role === 'STUDENT';
  const goals = studentService.getGoalsForStudent(student.id);
  const tasks = studentService.getTasksForStudent(student.id);
  const assessments = studentService.getAssessmentsForStudent(student.id);
  const allBadges = studentService.getAllBadges();

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (goalTitle.trim().length < 5) {
      showToast('Vui lòng nhập tên mục tiêu rõ ràng hơn', undefined, 'error');
      return;
    }
    studentService.createGoal(student.id, {
      title: goalTitle,
      category: goalCategory,
      weekLabel: 'Tuần 13',
    });
    setGoalTitle('');
    showToast('Đã thêm mục tiêu tuần mới', undefined, 'success');
  };

  const handleSubmitAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    if (weeklyWin.trim().length < 6) {
      showToast('Hãy chia sẻ ít nhất 1 điều em làm tốt trong tuần', undefined, 'error');
      return;
    }
    studentService.submitSelfAssessment(student.id, {
      weekLabel: 'Tuần 13 (25/11 - 01/12)',
      mood,
      focusScore,
      studyHoursPerDay: studyHours,
      weeklyWin: weeklyWin.trim(),
      challenge: challenge.trim() || 'Không có trở ngại lớn.',
      supportNeeded: supportNeeded.trim() || 'Tiếp tục duy trì nhịp học hiện tại.',
    });
    setWeeklyWin('');
    setChallenge('');
    setSupportNeeded('');
    showToast(
      'Đã nộp phiếu tự đánh giá tuần (+10 điểm nỗ lực)',
      'Huy hiệu "Tự soi chiếu tích cực" đã được ghi nhận!',
      'success',
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
          Tự đánh giá tuần, Mục tiêu & Huy hiệu
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          {student.fullName} · Lớp {student.classId} · Điểm nỗ lực hiện tại:{' '}
          <span className="font-mono-tabular font-bold text-teal-700">
            {student.effortPoints} điểm
          </span>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Weekly Self Assessment Form */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900">
            Phiếu tự đánh giá tuần của học sinh
          </h2>

          {isStudentRole && (
            <form onSubmit={handleSubmitAssessment} className="space-y-3.5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Tâm trạng tuần này
                  </label>
                  <select
                    value={mood}
                    onChange={(e) => setMood(e.target.value as SelfAssessment['mood'])}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm outline-none focus:border-teal-600"
                  >
                    <option value="Hào hứng">Hào hứng</option>
                    <option value="Ổn định">Ổn định</option>
                    <option value="Cần hỗ trợ">Cần hỗ trợ</option>
                    <option value="Hơi căng thẳng">Hơi căng thẳng</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Mức độ tập trung (1-5)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={focusScore}
                    onChange={(e) => setFocusScore(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono-tabular outline-none focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Giờ tự học/ngày
                  </label>
                  <input
                    type="number"
                    step={0.5}
                    min={0.5}
                    max={8}
                    value={studyHours}
                    onChange={(e) => setStudyHours(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono-tabular outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  1 điều em tự hào đã làm tốt trong tuần
                </label>
                <input
                  type="text"
                  value={weeklyWin}
                  onChange={(e) => setWeeklyWin(e.target.value)}
                  placeholder="Ví dụ: Em đã hoàn thành hết phiếu bài tập trước thứ Sáu..."
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Khó khăn em gặp phải
                </label>
                <input
                  type="text"
                  value={challenge}
                  onChange={(e) => setChallenge(e.target.value)}
                  placeholder="Ví dụ: Phần đọc hiểu Ngữ văn còn hơi chậm..."
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Em mong muốn thầy cô / ba mẹ hỗ trợ điều gì?
                </label>
                <input
                  type="text"
                  value={supportNeeded}
                  onChange={(e) => setSupportNeeded(e.target.value)}
                  placeholder="Ví dụ: Gợi ý thêm 2 bài mẫu để em tự luyện..."
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-teal-700 px-4 py-2.5 text-xs font-semibold text-white hover:bg-teal-800"
              >
                Gửi phiếu tự đánh giá tuần (+10 điểm)
              </button>
            </form>
          )}

          <div className="border-t border-slate-200 pt-4 space-y-2.5">
            <p className="text-xs font-semibold text-slate-500">
              Lịch sử tự đánh giá ({assessments.length})
            </p>
            {assessments.map((a) => (
              <div key={a.id} className="rounded-lg bg-slate-50 p-3 text-xs space-y-1">
                <div className="flex justify-between font-semibold text-slate-900">
                  <span>{a.weekLabel}</span>
                  <span className="font-mono-tabular text-teal-700">
                    {a.mood} · Tập trung {a.focusScore}/5
                  </span>
                </div>
                <p className="text-slate-700">
                  <strong>Làm tốt:</strong> {a.weeklyWin}
                </p>
                <p className="text-slate-600">
                  <strong>Khó khăn:</strong> {a.challenge}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Goals + Tasks */}
        <div className="space-y-6 lg:col-span-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-teal-700" />
              <h2 className="text-base font-bold text-slate-900">
                Mục tiêu tuần ({goals.length})
              </h2>
            </div>

            {isStudentRole && (
              <form onSubmit={handleAddGoal} className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  placeholder="Đặt mục tiêu mới (vd: Đọc 20 trang sách/ngày)..."
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600"
                />
                <select
                  value={goalCategory}
                  onChange={(e) => setGoalCategory(e.target.value as WeeklyGoal['category'])}
                  className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm"
                >
                  <option value="Học tập">Học tập</option>
                  <option value="Thói quen">Thói quen</option>
                  <option value="Kỹ năng">Kỹ năng</option>
                </select>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-1 rounded-lg bg-teal-700 px-3.5 py-2 text-xs font-semibold text-white hover:bg-teal-800 whitespace-nowrap"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Thêm
                </button>
              </form>
            )}

            <div className="space-y-3">
              {goals.map((g) => (
                <div key={g.id} className="rounded-lg border border-slate-200 p-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{g.title}</p>
                      <p className="text-xs text-slate-500">
                        {g.category} · {g.weekLabel}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono-tabular text-xs font-bold text-teal-700">
                        {g.progress}%
                      </span>
                      {isStudentRole && (
                        <button
                          type="button"
                          onClick={() => {
                            studentService.deleteGoal(g.id);
                            showToast('Đã xóa mục tiêu', undefined, 'info');
                          }}
                          className="text-slate-400 hover:text-red-600"
                          aria-label="Xóa mục tiêu"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  {isStudentRole && (
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={10}
                      value={g.progress}
                      onChange={(e) =>
                        studentService.updateGoalProgress(g.id, Number(e.target.value))
                      }
                      aria-label={`Tiến độ ${g.title}`}
                      className="mt-2 w-full accent-teal-700"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Tasks */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
            <h2 className="text-base font-bold text-slate-900">
              Nhiệm vụ tuần ({tasks.filter((t) => t.isCompleted).length}/{tasks.length})
            </h2>
            {tasks.map((task) => (
              <label
                key={task.id}
                className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  disabled={!isStudentRole}
                  checked={task.isCompleted}
                  onChange={() => {
                    studentService.toggleTaskComplete(task.id);
                    showToast('Đã cập nhật nhiệm vụ', task.title, 'success');
                  }}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-700"
                />
                <div className="flex-1">
                  <p
                    className={`text-sm font-medium ${
                      task.isCompleted ? 'text-slate-400 line-through' : 'text-slate-900'
                    }`}
                  >
                    {task.title}
                  </p>
                  <p className="text-xs text-slate-500">
                    {task.subjectOrArea} · Hạn {task.dueDate} · +{task.points} điểm
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Effort Badges Catalog */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-3 mb-4">
          <img
            src={EFFORT_BADGE_IMAGE}
            alt="Biểu trưng huy hiệu nỗ lực"
            referrerPolicy="no-referrer"
            className="h-12 w-12 rounded-lg border border-slate-200 object-cover"
          />
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Bộ sưu tập Huy hiệu Nỗ lực
            </h2>
            <p className="text-xs text-slate-500">
              Đã đạt {student.badgeIds.length} / {allBadges.length} huy hiệu
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {allBadges.map((b) => {
            const earned = student.badgeIds.includes(b.id);
            return (
              <div
                key={b.id}
                className={`rounded-lg border p-4 ${
                  earned
                    ? 'border-teal-300 bg-teal-50/40'
                    : 'border-slate-200 bg-slate-50/50 opacity-75'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-900">
                    <Award className={`h-4 w-4 ${earned ? 'text-teal-700' : 'text-slate-400'}`} />
                    {b.name}
                  </span>
                  {earned && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Đã đạt
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-xs text-slate-600">{b.description}</p>
                <p className="mt-1 text-[11px] text-slate-500">Tiêu chí: {b.criteria}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
