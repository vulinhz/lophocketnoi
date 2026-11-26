import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  FileText,
  GraduationCap,
  HeartHandshake,
  Megaphone,
  MessageSquare,
  Pencil,
  Send,
  Target,
  Users,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useDemo } from '../context/DemoContext';
import { useToast } from '../context/ToastContext';
import { classService } from '../services/classService';
import { studentService } from '../services/studentService';
import { observationService } from '../services/observationService';
import { commentService } from '../services/commentService';
import { announcementService } from '../services/announcementService';
import { feedbackService } from '../services/feedbackService';
import { parentService } from '../services/parentService';
import { StudentAvatar } from '../components/StudentAvatar';
import { AttentionStatusText, WorkflowStatusText } from '../components/StatusLabel';
import { EFFORT_BADGE_IMAGE } from '../data/mockTeachers';

export function DashboardPage() {
  const { currentUser, db } = useDemo();
  if (!currentUser) return null;

  if (currentUser.role === 'ADMIN') {
    return <AdminDashboard />;
  }
  if (currentUser.role === 'GVCN') {
    return <TeacherDashboard />;
  }
  if (currentUser.role === 'PARENT') {
    return <ParentDashboard />;
  }
  return <StudentDashboard key={db.lastUpdatedAt} />;
}

function AdminDashboard() {
  const { db } = useDemo();
  const classSummaries = classService.getAllClassSummaries();
  const totalStudents = db.students.length;
  const totalClasses = db.classes.length;
  const totalTeachers = db.teachers.length;
  const totalParents = db.parents.length;

  const approvedOrPublished = db.comments.filter(
    (c) => c.status === 'APPROVED' || c.status === 'PUBLISHED',
  ).length;
  const draftComments = db.comments.filter((c) => c.status === 'DRAFT').length;

  const publishedAnnouncements = db.announcements.filter(
    (a) => a.status === 'PUBLISHED',
  );
  const avgReadRate =
    publishedAnnouncements.length > 0
      ? Math.round(
          (publishedAnnouncements.reduce(
            (sum, a) =>
              sum + a.readByParentIds.length / Math.max(1, a.targetParentCount),
            0,
          ) /
            publishedAnnouncements.length) *
            100,
        )
      : 0;

  const chartData = classSummaries.map((s) => ({
    name: s.classroom.id,
    'Đã phát hành': s.publishedCommentsCount,
    'Chờ duyệt': s.pendingCommentsCount,
    'Cần quan tâm': s.attentionCount,
    'Tự đánh giá (%)': s.selfAssessmentRate,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
            Tổng quan toàn trường (Demo)
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Theo dõi đồng bộ 5 lớp học, 150 học sinh, quy trình nhận xét và mức độ tương tác phụ huynh.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            to="/students"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap"
          >
            Xem 150 học sinh
          </Link>
          <Link
            to="/demo-admin"
            className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-800 whitespace-nowrap"
          >
            Quản trị dữ liệu Demo
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Số lớp học"
          value={String(totalClasses)}
          subtext="7A1, 7A3, 10A2, 11A1, 11A2"
          icon={GraduationCap}
        />
        <StatCard
          label="Tổng học sinh"
          value={String(totalStudents)}
          subtext="Đủ 30 học sinh mỗi lớp"
          icon={Users}
        />
        <StatCard
          label="GVCN & Phụ huynh"
          value={`${totalTeachers} / ${totalParents}`}
          subtext="5 GVCN · 150 hồ sơ phụ huynh"
          icon={HeartHandshake}
        />
        <StatCard
          label="Tỷ lệ đọc thông báo"
          value={`${avgReadRate}%`}
          subtext={`${publishedAnnouncements.length} thông báo đã phát hành`}
          icon={Megaphone}
        />
      </div>

      {/* Comment Workflow Summary Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500">
            Nhận xét đã duyệt / phát hành
          </p>
          <p className="mt-1 font-mono-tabular text-2xl font-bold text-emerald-700">
            {approvedOrPublished}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Bao gồm trạng thái APPROVED và PUBLISHED
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500">
            Nhận xét đang chờ duyệt (DRAFT)
          </p>
          <p className="mt-1 font-mono-tabular text-2xl font-bold text-amber-700">
            {draftComments}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Chờ GVCN rà soát trước khi công bố
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500">
            Nhật ký & Phản hồi phụ huynh
          </p>
          <p className="mt-1 font-mono-tabular text-2xl font-bold text-slate-900">
            {db.observations.length} / {db.feedbacks.length}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Ghi chú quan sát GVCN / Phản hồi gia đình
          </p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-7">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Thống kê nhận xét và học sinh cần quan tâm theo lớp
              </h2>
              <p className="text-xs text-slate-500">
                So sánh số lượng nhận xét đã phát hành, chờ duyệt và học sinh cần theo dõi
              </p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#475569' }} />
                <YAxis tick={{ fontSize: 12, fill: '#475569' }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    borderColor: '#E2E8F0',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="Đã phát hành" fill="#0F766E" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Chờ duyệt" fill="#D97706" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Cần quan tâm" fill="#DC2626" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-5">
          <h2 className="text-base font-bold text-slate-900">
            Tỷ lệ tự đánh giá tuần theo lớp (%)
          </h2>
          <p className="mb-4 text-xs text-slate-500">
            Mức độ học sinh chủ động nộp phiếu tự soi chiếu tuần 12
          </p>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 8, right: 18, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12, fill: '#475569' }} />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={48}
                  tick={{ fontSize: 12, fill: '#0F172A', fontWeight: 600 }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    borderColor: '#E2E8F0',
                    fontSize: '12px',
                  }}
                />
                <Bar
                  dataKey="Tự đánh giá (%)"
                  fill="#0284C7"
                  radius={[0, 4, 4, 0]}
                  barSize={22}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 5 Classes Summary Table */}
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-bold text-slate-900">
            Bảng tổng hợp 5 lớp học
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                <th className="px-5 py-3">Lớp</th>
                <th className="px-4 py-3">GVCN phụ trách</th>
                <th className="px-4 py-3 text-right">Sĩ số</th>
                <th className="px-4 py-3 text-right">ĐTB trung bình</th>
                <th className="px-4 py-3 text-right">Cần quan tâm</th>
                <th className="px-4 py-3 text-right">Đã phát hành</th>
                <th className="px-4 py-3 text-right">Đọc thông báo</th>
                <th className="px-5 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {classSummaries.map((item) => (
                <tr key={item.classroom.id} className="hover:bg-slate-50/70">
                  <td className="px-5 py-3.5 font-semibold text-slate-900">
                    {item.classroom.id}{' '}
                    <span className="ml-1 text-xs font-normal text-slate-500">
                      · {item.classroom.room}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-700">
                    {item.teacher?.fullName ?? '—'}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono-tabular text-slate-900">
                    {item.studentCount}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono-tabular text-slate-900">
                    {item.averageGpa.toFixed(2)}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono-tabular font-semibold text-red-700">
                    {item.attentionCount}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono-tabular text-emerald-700">
                    {item.publishedCommentsCount}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono-tabular text-slate-700">
                    {item.announcementReadRate}%
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link
                      to={`/students?class=${item.classroom.id}`}
                      className="text-xs font-semibold text-teal-700 hover:underline whitespace-nowrap"
                    >
                      Xem danh sách
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function TeacherDashboard() {
  const { currentUser } = useDemo();
  const { showToast } = useToast();
  const classId = currentUser?.assignedClassId ?? '7A1';
  const summary = classService.getClassSummaryStats(classId);
  const students = currentUser ? studentService.getAccessibleStudents(currentUser) : [];
  const attentionStudents = students.filter((s) => s.needsAttention);
  const recentObservations = currentUser
    ? observationService.getAccessibleObservations(currentUser).slice(0, 4)
    : [];
  const comments = currentUser ? commentService.getAccessibleComments(currentUser) : [];
  const pendingComments = comments.filter((c) => c.status !== 'PUBLISHED');

  const [editingFocus, setEditingFocus] = useState(false);
  const [focusInput, setFocusInput] = useState(
    summary?.classroom.weeklyFocus ?? '',
  );

  if (!currentUser || !summary) return null;

  const handleSaveFocus = () => {
    if (!focusInput.trim()) return;
    classService.updateWeeklyFocus(classId, focusInput);
    setEditingFocus(false);
    showToast('Đã cập nhật trọng tâm tuần', `Lớp ${classId}`, 'success');
  };

  const conductChartData = [
    {
      name: 'Tốt',
      'Số học sinh': students.filter((s) => s.conduct === 'Tốt').length,
    },
    {
      name: 'Khá',
      'Số học sinh': students.filter((s) => s.conduct === 'Khá').length,
    },
    {
      name: 'Đạt',
      'Số học sinh': students.filter((s) => s.conduct === 'Đạt').length,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-teal-700">
            {summary.classroom.schoolLevel} · {summary.classroom.room} · Năm học {summary.classroom.academicYear}
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-900">
            Bảng điều hành {summary.classroom.name}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {summary.classroom.motto}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/observations"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap"
          >
            <BookOpen className="h-3.5 w-3.5 text-teal-700" />
            Ghi nhật ký
          </Link>
          <Link
            to="/comments"
            className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-3.5 py-2 text-xs font-semibold text-white hover:bg-teal-800 whitespace-nowrap"
          >
            <FileText className="h-3.5 w-3.5" />
            Soạn & Duyệt nhận xét ({pendingComments.length})
          </Link>
        </div>
      </div>

      {/* Weekly Focus Banner */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold text-teal-700">
            Trọng tâm tuần của lớp {classId}
          </p>
          {!editingFocus && (
            <button
              type="button"
              onClick={() => {
                setFocusInput(summary.classroom.weeklyFocus);
                setEditingFocus(true);
              }}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-teal-700"
            >
              <Pencil className="h-3.5 w-3.5" />
              Chỉnh sửa
            </button>
          )}
        </div>
        {editingFocus ? (
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={focusInput}
              onChange={(e) => setFocusInput(e.target.value)}
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveFocus}
                className="rounded-lg bg-teal-700 px-3.5 py-2 text-xs font-semibold text-white hover:bg-teal-800"
              >
                Lưu
              </button>
              <button
                type="button"
                onClick={() => setEditingFocus(false)}
                className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                Hủy
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-1 text-sm text-slate-800">{summary.classroom.weeklyFocus}</p>
        )}
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Sĩ số lớp"
          value={`${summary.studentCount} HS`}
          subtext={`Chuyên cần TB ${summary.attendanceAvg}%`}
          icon={Users}
        />
        <StatCard
          label="Học sinh cần quan tâm"
          value={String(attentionStudents.length)}
          subtext="Ưu tiên trao đổi & đồng hành"
          icon={AlertTriangle}
        />
        <StatCard
          label="Nhận xét chờ xử lý"
          value={String(pendingComments.length)}
          subtext={`${summary.publishedCommentsCount} đã phát hành`}
          icon={Clock}
        />
        <StatCard
          label="Tình trạng tự đánh giá"
          value={`${summary.selfAssessmentRate}%`}
          subtext="Học sinh đã nộp phiếu Tuần 12"
          icon={ClipboardCheck}
        />
      </div>

      {/* Attention Students + Chart */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-7">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Học sinh cần quan tâm trong lớp
              </h2>
              <p className="text-xs text-slate-500">
                Danh sách được đánh dấu cần hỗ trợ thêm về học tập hoặc tâm lý
              </p>
            </div>
            <Link
              to="/students"
              className="text-xs font-semibold text-teal-700 hover:underline whitespace-nowrap"
            >
              Xem cả {summary.studentCount} HS
            </Link>
          </div>
          {attentionStudents.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-600">
              Hiện chưa có học sinh nào được gắn cờ cần quan tâm đặc biệt.
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {attentionStudents.map((s) => (
                <div
                  key={s.id}
                  className="flex items-start justify-between gap-3 py-3 first:pt-1 last:pb-1"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <StudentAvatar fullName={s.fullName} palette={s.avatarPalette} size="sm" />
                    <div className="min-w-0">
                      <Link
                        to={`/students/${s.id}`}
                        className="text-sm font-semibold text-slate-900 hover:text-teal-700"
                      >
                        {s.fullName}
                      </Link>
                      <p className="font-mono-tabular text-xs text-slate-500">
                        {s.studentCode} · ĐTB {s.gpa.toFixed(1)} · Chuyên cần {s.attendanceRate}%
                      </p>
                      <p className="mt-1 text-xs text-red-700">
                        {s.attentionReason || 'Cần theo dõi thêm'}
                      </p>
                    </div>
                  </div>
                  <Link
                    to={`/students/${s.id}`}
                    className="shrink-0 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap"
                  >
                    Mở hồ sơ
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-5">
          <h2 className="text-base font-bold text-slate-900">
            Phân bổ xếp loại rèn luyện
          </h2>
          <p className="mb-4 text-xs text-slate-500">
            Thống kê trực tiếp từ 30 hồ sơ học sinh lớp {classId}
          </p>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={conductChartData} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#475569' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#475569' }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    borderColor: '#E2E8F0',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="Số học sinh" fill="#0F766E" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Observations & Pending Comments */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Nhật ký quan sát gần đây</h2>
            <Link to="/observations" className="text-xs font-semibold text-teal-700 hover:underline">
              Quản lý nhật ký
            </Link>
          </div>
          <div className="divide-y divide-slate-200">
            {recentObservations.map((obs) => {
              const stu = students.find((s) => s.id === obs.studentId);
              return (
                <div key={obs.id} className="py-3 first:pt-1 last:pb-1">
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-slate-800">
                      {stu?.fullName ?? obs.studentId} · {obs.category}
                    </span>
                    <span className="font-mono-tabular">{obs.observedAt}</span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-slate-900">{obs.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-slate-600">{obs.content}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Nhận xét chờ duyệt / phát hành</h2>
            <Link to="/comments" className="text-xs font-semibold text-teal-700 hover:underline">
              Mở trang duyệt
            </Link>
          </div>
          {pendingComments.length === 0 ? (
            <div className="rounded-lg bg-slate-50 p-6 text-center text-sm text-slate-600">
              Tất cả nhận xét của lớp đã được phát hành.
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {pendingComments.slice(0, 4).map((cmt) => {
                const stu = students.find((s) => s.id === cmt.studentId);
                return (
                  <div key={cmt.id} className="py-3 first:pt-1 last:pb-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-slate-900">
                        {stu?.fullName ?? cmt.studentId}
                      </span>
                      <WorkflowStatusText status={cmt.status} />
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-600">{cmt.content}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ParentDashboard() {
  const { currentUser } = useDemo();
  const { showToast } = useToast();
  if (!currentUser) return null;

  const student = parentService.getLinkedStudentForParent(currentUser);
  if (!student) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-base font-semibold text-slate-900">
          Chưa liên kết hồ sơ học sinh cho tài khoản phụ huynh này.
        </p>
      </div>
    );
  }

  const publishedComments = commentService.getCommentsForStudent(currentUser, student.id);
  const announcements = announcementService.getAccessibleAnnouncements(currentUser);
  const feedbacks = feedbackService.getAccessibleFeedback(currentUser);
  const homeTips = parentService.getHomeCompanionSuggestions(student);
  const classroom = classService.getClassById(student.classId);
  const teacher = classroom ? classService.getTeacherById(classroom.homeroomTeacherId) : undefined;

  const handleMarkRead = (announcementId: string) => {
    announcementService.markAsReadByParent(currentUser, announcementId);
    showToast('Đã xác nhận đã đọc thông báo', undefined, 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-teal-700">
            Cổng Phụ huynh · Chỉ hiển thị dữ liệu của học sinh liên kết
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-900">
            Đồng hành cùng {student.fullName}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Lớp {student.classId} · GVCN: {teacher?.fullName ?? 'Đang cập nhật'} ({teacher?.phone})
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            to={`/students/${student.id}`}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap"
          >
            Xem đầy đủ hồ sơ con
          </Link>
          <Link
            to="/feedback"
            className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-800 whitespace-nowrap"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Gửi phản hồi tới GVCN
          </Link>
        </div>
      </div>

      {/* Child Overview Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <StudentAvatar
              fullName={student.fullName}
              palette={student.avatarPalette}
              size="lg"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-lg font-bold text-slate-900">{student.fullName}</h2>
                <AttentionStatusText needsAttention={student.needsAttention} />
              </div>
              <p className="mt-0.5 font-mono-tabular text-xs text-slate-500">
                Mã HS: {student.studentCode} · Lớp {student.classId} · Ngày sinh {student.birthDate}
              </p>
              <p className="mt-1.5 text-sm text-slate-700">{student.personalityNote}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-3 sm:border-t-0 sm:pt-0">
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
          </div>
        </div>
      </div>

      {/* Published Comments + Home Tips */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-7">
          <h2 className="text-base font-bold text-slate-900">
            Nhận xét định kỳ đã phát hành
          </h2>
          <p className="mb-4 text-xs text-slate-500">
            Chỉ hiển thị các nhận xét đã được GVCN rà soát và phát hành chính thức
          </p>
          {publishedComments.length === 0 ? (
            <div className="rounded-lg bg-slate-50 p-6 text-center text-sm text-slate-600">
              Chưa có nhận xét nào được phát hành trong kỳ này.
            </div>
          ) : (
            <div className="space-y-4">
              {publishedComments.map((cmt) => (
                <div key={cmt.id} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-slate-800">{cmt.periodLabel}</span>
                    <span className="font-mono-tabular">
                      Phát hành: {(cmt.publishedAt ?? cmt.updatedAt).slice(0, 10)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-800">{cmt.content}</p>
                  {cmt.homeCompanionTip && (
                    <div className="mt-3 rounded-lg bg-teal-50/70 p-3 text-xs text-teal-900">
                      <span className="font-semibold">Gợi ý đồng hành tại nhà: </span>
                      {cmt.homeCompanionTip}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-5">
          <h2 className="text-base font-bold text-slate-900">
            Gợi ý đồng hành tại nhà
          </h2>
          <p className="mb-3 text-xs text-slate-500">
            Khuyến nghị thiết thực dựa trên đặc điểm học tập của {student.fullName}
          </p>
          <ul className="space-y-3">
            {homeTips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" />
                <span className="leading-relaxed">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Announcements + Feedback History */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Thông báo mới từ lớp</h2>
            <Link to="/announcements" className="text-xs font-semibold text-teal-700 hover:underline">
              Xem tất cả
            </Link>
          </div>
          {announcements.length === 0 ? (
            <p className="text-sm text-slate-500">Chưa có thông báo mới.</p>
          ) : (
            <div className="divide-y divide-slate-200">
              {announcements.map((ann) => {
                const isRead = Boolean(
                  currentUser.parentId && ann.readByParentIds.includes(currentUser.parentId),
                );
                return (
                  <div key={ann.id} className="py-3 first:pt-1 last:pb-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{ann.title}</p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {ann.category} · {(ann.publishedAt ?? ann.createdAt).slice(0, 10)}
                        </p>
                      </div>
                      {isRead ? (
                        <span className="shrink-0 text-xs font-medium text-emerald-700">
                          Đã đọc
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleMarkRead(ann.id)}
                          className="shrink-0 rounded-lg bg-teal-700 px-2.5 py-1 text-xs font-semibold text-white hover:bg-teal-800 whitespace-nowrap"
                        >
                          Xác nhận đã đọc
                        </button>
                      )}
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{ann.content}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Lịch sử phản hồi của gia đình</h2>
            <Link to="/feedback" className="text-xs font-semibold text-teal-700 hover:underline">
              Gửi phản hồi mới
            </Link>
          </div>
          {feedbacks.length === 0 ? (
            <p className="text-sm text-slate-500">Gia đình chưa gửi phản hồi nào.</p>
          ) : (
            <div className="divide-y divide-slate-200">
              {feedbacks.map((fb) => (
                <div key={fb.id} className="py-3 first:pt-1 last:pb-1">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-semibold text-slate-800">{fb.topic}</span>
                    <span className="font-mono-tabular">{fb.createdAt.slice(0, 10)}</span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-slate-700">{fb.message}</p>
                  {fb.teacherReply ? (
                    <div className="mt-2 rounded-lg bg-slate-50 p-2.5 text-xs text-slate-700">
                      <span className="font-semibold text-teal-800">GVCN trả lời: </span>
                      {fb.teacherReply}
                    </div>
                  ) : (
                    <p className="mt-1.5 text-[11px] text-amber-700">Đang chờ GVCN phản hồi</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StudentDashboard() {
  const { currentUser } = useDemo();
  const { showToast } = useToast();
  if (!currentUser || !currentUser.linkedStudentId) return null;

  const student = studentService.getStudentById(currentUser, currentUser.linkedStudentId);
  if (!student) return null;

  const goals = studentService.getGoalsForStudent(student.id);
  const tasks = studentService.getTasksForStudent(student.id);
  const allBadges = studentService.getAllBadges();
  const earnedBadges = allBadges.filter((b) => student.badgeIds.includes(b.id));
  const publishedComments = commentService.getCommentsForStudent(currentUser, student.id);
  const assessments = studentService.getAssessmentsForStudent(student.id);

  const completedTasks = tasks.filter((t) => t.isCompleted).length;

  const handleToggleTask = (taskId: string) => {
    studentService.toggleTaskComplete(taskId);
    showToast('Đã cập nhật tiến độ nhiệm vụ', undefined, 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-teal-700">
            Góc Học sinh · Lớp {student.classId} · Mã {student.studentCode}
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-900">
            Chào {student.fullName}!
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Theo dõi mục tiêu tuần, hoàn thành nhiệm vụ rèn luyện và xem lời khích lệ từ thầy cô.
          </p>
        </div>
        <Link
          to="/student-hub"
          className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-800 whitespace-nowrap"
        >
          Tự đánh giá tuần & Đặt mục tiêu
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Điểm nỗ lực"
          value={String(student.effortPoints)}
          subtext="Tích lũy từ nhiệm vụ & tự đánh giá"
          icon={Award}
        />
        <StatCard
          label="Nhiệm vụ tuần"
          value={`${completedTasks} / ${tasks.length}`}
          subtext="Đánh dấu hoàn thành bên dưới"
          icon={ClipboardCheck}
        />
        <StatCard
          label="Mục tiêu tuần"
          value={String(goals.length)}
          subtext={`${goals.filter((g) => g.isCompleted).length} mục tiêu đã đạt 100%`}
          icon={Target}
        />
        <StatCard
          label="Huy hiệu đạt được"
          value={`${earnedBadges.length} / ${allBadges.length}`}
          subtext={assessments.length > 0 ? 'Đã nộp tự đánh giá Tuần 12' : 'Chưa nộp tự đánh giá'}
          icon={Send}
        />
      </div>

      {/* Encouragement from Teacher */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-base font-bold text-slate-900">Lời khích lệ từ GVCN</h2>
        {publishedComments.length === 0 ? (
          <p className="mt-2 text-sm text-slate-600">
            Chưa có lời nhắn mới được phát hành trong tuần này.
          </p>
        ) : (
          <div className="mt-3 space-y-3">
            {publishedComments.slice(0, 2).map((cmt) => (
              <div key={cmt.id} className="rounded-lg bg-teal-50/70 p-4">
                <p className="text-xs font-semibold text-teal-800">{cmt.periodLabel}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-800">
                  “{cmt.encouragementText}”
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tasks + Goals */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Nhiệm vụ tuần của em</h2>
            <Link to="/student-hub" className="text-xs font-semibold text-teal-700 hover:underline">
              Xem chi tiết
            </Link>
          </div>
          {tasks.length === 0 ? (
            <p className="text-sm text-slate-500">Chưa có nhiệm vụ được giao.</p>
          ) : (
            <div className="space-y-2.5">
              {tasks.map((task) => (
                <label
                  key={task.id}
                  className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    checked={task.isCompleted}
                    onChange={() => handleToggleTask(task.id)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-600"
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm font-medium ${
                        task.isCompleted ? 'text-slate-400 line-through' : 'text-slate-900'
                      }`}
                    >
                      {task.title}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {task.subjectOrArea} · Hạn {task.dueDate} · +{task.points} điểm nỗ lực
                    </p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Huy hiệu nỗ lực</h2>
            <Link to="/student-hub" className="text-xs font-semibold text-teal-700 hover:underline">
              Quản lý mục tiêu
            </Link>
          </div>
          <div className="flex items-center gap-4 rounded-lg border border-slate-200 bg-slate-50/70 p-3.5 mb-3">
            <img
              src={EFFORT_BADGE_IMAGE}
              alt="Biểu trưng huy hiệu nỗ lực"
              referrerPolicy="no-referrer"
              className="h-14 w-14 shrink-0 rounded-lg border border-slate-200 object-cover"
            />
            <div>
              <p className="text-sm font-bold text-slate-900">
                Đã đạt {earnedBadges.length} huy hiệu rèn luyện
              </p>
              <p className="text-xs text-slate-600">
                Hoàn thành nhiệm vụ và tự đánh giá tuần để mở khóa thêm huy hiệu.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {earnedBadges.map((b) => (
              <div key={b.id} className="rounded-lg border border-slate-200 p-3">
                <p className="text-xs font-bold text-teal-800">{b.name}</p>
                <p className="mt-0.5 text-xs text-slate-600">{b.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  subtext,
  icon: Icon,
}: {
  label: string;
  value: string;
  subtext: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <Icon className="h-4 w-4 text-teal-700 shrink-0" />
      </div>
      <p className="mt-2 font-mono-tabular text-2xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 truncate text-xs text-slate-500">{subtext}</p>
    </div>
  );
}
