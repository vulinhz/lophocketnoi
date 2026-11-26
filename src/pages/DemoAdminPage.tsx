import { useState } from 'react';
import { CheckCircle2, Database, RotateCcw, ShieldAlert } from 'lucide-react';
import { useDemo } from '../context/DemoContext';
import { useToast } from '../context/ToastContext';
import { demoStorageService } from '../services/demoStorageService';
import { DEMO_ACCOUNTS, ROLE_LABELS } from '../services/demoAuthService';
import { classService } from '../services/classService';

export function DemoAdminPage() {
  const { currentUser, db, aiStatus, resetDemoData } = useDemo();
  const { showToast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!currentUser) return null;

  if (currentUser.role !== 'ADMIN') {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
        <ShieldAlert className="mx-auto h-10 w-10 text-red-600" />
        <h1 className="mt-3 text-lg font-bold text-slate-900">
          Khu vực dành riêng cho Quản trị viên (Admin)
        </h1>
        <p className="mt-1.5 text-sm text-slate-600">
          Vui lòng đăng nhập bằng tài khoản admin@hpu2.it để quản lý và đặt lại toàn bộ dữ liệu demo.
        </p>
      </div>
    );
  }

  const storageStats = demoStorageService.getStorageStats();
  const classSummaries = classService.getAllClassSummaries();
  const uniqueCodes = new Set(db.students.map((s) => s.studentCode)).size;

  const handleConfirmReset = () => {
    resetDemoData();
    setConfirmOpen(false);
    showToast(
      'Đã khôi phục dữ liệu demo gốc thành công',
      '5 lớp (150 học sinh) và toàn bộ bảng dữ liệu đã trở về mặc định.',
      'success',
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
            Quản trị Dữ liệu Demo & Kiểm chứng Hệ thống
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            100% dữ liệu giả lập lưu trong LocalStorage trình duyệt. Không sử dụng cơ sở dữ liệu bên ngoài.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 whitespace-nowrap"
        >
          <RotateCcw className="h-4 w-4" />
          Reset toàn bộ dữ liệu Demo
        </button>
      </div>

      {/* Integrity Verification Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500">Tổng số lớp / Học sinh</p>
          <p className="mt-1 font-mono-tabular text-2xl font-bold text-slate-900">
            {db.classes.length} / {db.students.length}
          </p>
          <p className="mt-1 inline-flex items-center gap-1 text-xs text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {uniqueCodes} mã học sinh không trùng lặp
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500">Dung lượng LocalStorage</p>
          <p className="mt-1 font-mono-tabular text-2xl font-bold text-slate-900">
            {storageStats.approxKb} KB
          </p>
          <p className="mt-1 truncate font-mono-tabular text-xs text-slate-500">
            Key: {storageStats.storageKey}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500">Tổng bản ghi nghiệp vụ</p>
          <p className="mt-1 font-mono-tabular text-2xl font-bold text-slate-900">
            {db.observations.length + db.comments.length + db.announcements.length}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {db.observations.length} quan sát · {db.comments.length} nhận xét · {db.announcements.length} thông báo
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500">Cấu hình dịch vụ AI</p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {aiStatus.geminiAvailable ? 'Gemini API (Server)' : 'Mock AI (Local)'}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {aiStatus.geminiAvailable
              ? `Model: ${aiStatus.model}`
              : 'Đọc từ biến môi trường GEMINI_API_KEY'}
          </p>
        </div>
      </div>

      {/* Class Count Verification */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2 mb-3">
          <Database className="h-4 w-4 text-teal-700" />
          <h2 className="text-base font-bold text-slate-900">
            Kiểm tra sĩ số chuẩn 30 học sinh/lớp
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
          {classSummaries.map((c) => (
            <div key={c.classroom.id} className="rounded-lg border border-slate-200 p-3.5">
              <p className="text-sm font-bold text-slate-900">{c.classroom.name}</p>
              <p className="mt-1 font-mono-tabular text-xl font-bold text-teal-700">
                {c.studentCount} HS
              </p>
              <p className="mt-0.5 text-xs text-slate-500">{c.teacher?.fullName}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Demo Accounts Reference */}
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-bold text-slate-900">
            Danh sách 12 tài khoản Demo (Mật khẩu: 123456)
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                <th className="px-5 py-3">Vai trò</th>
                <th className="px-4 py-3">Email đăng nhập</th>
                <th className="px-4 py-3">Tên hiển thị</th>
                <th className="px-5 py-3">Phạm vi truy cập</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {DEMO_ACCOUNTS.map((acc) => (
                <tr key={acc.id}>
                  <td className="px-5 py-2.5 text-xs font-semibold text-teal-800">
                    {ROLE_LABELS[acc.role]}
                  </td>
                  <td className="px-4 py-2.5 font-mono-tabular text-xs text-slate-900">
                    {acc.email}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-slate-700">{acc.fullName}</td>
                  <td className="px-5 py-2.5 text-xs text-slate-500">{acc.title}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">
              Xác nhận Reset toàn bộ dữ liệu Demo?
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Toàn bộ nhận xét mới, thông báo mới, nhật ký và mục tiêu đã chỉnh sửa trong LocalStorage sẽ được đưa về dữ liệu gốc 150 học sinh ban đầu.
            </p>
            <div className="mt-5 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
              >
                Reset ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
