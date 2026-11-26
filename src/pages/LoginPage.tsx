import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  ClipboardCheck,
  GraduationCap,
  KeyRound,
  ShieldAlert,
  UserCheck,
  Users,
} from 'lucide-react';
import { useDemo } from '../context/DemoContext';
import { useToast } from '../context/ToastContext';
import { DEMO_ACCOUNTS, ROLE_LABELS } from '../services/demoAuthService';
import { CLASSROOM_BANNER_IMAGE } from '../data/mockTeachers';
import type { UserRole } from '../types/domain';

const ROLE_GROUPS: Array<{ role: UserRole; label: string; desc: string }> = [
  {
    role: 'ADMIN',
    label: 'Quản trị hệ thống (Admin)',
    desc: 'Xem toàn bộ 5 lớp, 150 học sinh, thống kê & reset demo',
  },
  {
    role: 'GVCN',
    label: 'Giáo viên chủ nhiệm (5 lớp)',
    desc: 'Chỉ xem lớp phụ trách, ghi nhật ký, duyệt nhận xét & AI',
  },
  {
    role: 'PARENT',
    label: 'Phụ huynh (3 tài khoản mẫu)',
    desc: 'Chỉ xem hồ sơ con liên kết, nhận xét đã phát hành & phản hồi',
  },
  {
    role: 'STUDENT',
    label: 'Học sinh (3 tài khoản mẫu)',
    desc: 'Xem hồ sơ cá nhân, tự đánh giá tuần, mục tiêu & huy hiệu',
  },
];

export function LoginPage() {
  const { loginWithCredentials, quickLogin } = useDemo();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('teacher7a1@hpu2.it');
  const [password, setPassword] = useState('123456');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeRoleTab, setActiveRoleTab] = useState<UserRole>('GVCN');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Vui lòng nhập đầy đủ email và mật khẩu demo.');
      return;
    }
    const result = loginWithCredentials(email, password);
    if (!result.ok) {
      setErrorMsg(result.error);
      return;
    }
    showToast(
      `Đăng nhập thành công: ${result.account.fullName}`,
      `${ROLE_LABELS[result.account.role]}`,
      'success',
    );
    navigate('/');
  };

  const handleQuickRoleLogin = (accountId: string) => {
    quickLogin(accountId);
    const acc = DEMO_ACCOUNTS.find((a) => a.id === accountId);
    if (acc) {
      showToast(
        `Vào phiên demo: ${acc.fullName}`,
        acc.title,
        'success',
      );
    }
    navigate('/');
  };

  const filteredAccounts = DEMO_ACCOUNTS.filter(
    (a) => a.role === activeRoleTab,
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top 3-zone header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5 font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-700 text-white">
              <ClipboardCheck className="h-4 w-4" />
            </span>
            <span>Lớp Học Kết Nối</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a href="#quick-login" className="hover:text-slate-900 whitespace-nowrap shrink-0">
              Chọn vai trò
            </a>
            <a href="#login-form" className="hover:text-slate-900 whitespace-nowrap shrink-0">
              Đăng nhập thủ công
            </a>
          </nav>
          <button
            type="button"
            onClick={() => handleQuickRoleLogin('ACC_ADMIN')}
            className="rounded-lg bg-teal-700 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-800 transition-colors whitespace-nowrap shrink-0"
          >
            Xem nhanh Admin
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-stretch">
          {/* Left column: Visual overview & Quick Demo Switcher */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div>
              <p className="text-xs font-semibold tracking-wide text-teal-700">
                Nền tảng EdTech Demo · 5 Lớp học · 150 Học sinh giả lập
              </p>
              <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl text-balance">
                Kết nối nhịp nhàng giữa Giáo viên, Học sinh và Gia đình
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600">
                Trải nghiệm đầy đủ quy trình ghi chép nhật ký quan sát, trợ lý AI soạn nhận xét ở trạng thái bản nháp, quy trình duyệt sư phạm của GVCN và cổng đồng hành của phụ huynh — học sinh.
              </p>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="relative h-52 sm:h-60 w-full overflow-hidden bg-slate-200">
                <img
                  src={CLASSROOM_BANNER_IMAGE}
                  alt="Không gian lớp học kết nối hiện đại"
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/75 via-slate-900/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <p className="text-xs font-medium text-teal-200">
                    Khối THCS & THPT · Dữ liệu lưu cục bộ trên trình duyệt
                  </p>
                  <p className="mt-0.5 text-sm font-semibold">
                    7A1 · 7A3 · 10A2 · 11A1 · 11A2 (30 học sinh/lớp)
                  </p>
                </div>
              </div>

              <div id="quick-login" className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-sm font-bold text-slate-900">
                    Chọn nhanh tài khoản trình diễn (1 chạm)
                  </h2>
                  <span className="font-mono-tabular text-xs text-slate-500">
                    Mật khẩu demo: 123456
                  </span>
                </div>

                {/* Role Segmented Filter */}
                <div className="mt-3 grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1 sm:grid-cols-4">
                  {ROLE_GROUPS.map((group) => (
                    <button
                      key={group.role}
                      type="button"
                      onClick={() => setActiveRoleTab(group.role)}
                      className={`rounded-md px-2.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
                        activeRoleTab === group.role
                          ? 'bg-white text-teal-800 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {group.role === 'ADMIN'
                        ? 'Admin'
                        : group.role === 'GVCN'
                          ? 'GVCN (5)'
                          : group.role === 'PARENT'
                            ? 'Phụ huynh (3)'
                            : 'Học sinh (3)'}
                    </button>
                  ))}
                </div>

                <p className="mt-2.5 text-xs text-slate-500">
                  {ROLE_GROUPS.find((g) => g.role === activeRoleTab)?.desc}
                </p>

                <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {filteredAccounts.map((acc) => (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => handleQuickRoleLogin(acc.id)}
                      className="group flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3 text-left hover:border-teal-600 hover:bg-teal-50/40 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {acc.fullName}
                        </p>
                        <p className="truncate font-mono-tabular text-xs text-slate-500">
                          {acc.email}
                        </p>
                        {acc.assignedClassId && (
                          <p className="mt-0.5 text-[11px] font-medium text-teal-700">
                            Lớp {acc.assignedClassId}
                          </p>
                        )}
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-teal-700" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right column: Manual Login Form & Demo Notice */}
          <div id="login-form" className="lg:col-span-5 flex flex-col justify-between">
            <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
              <div className="flex items-center gap-2.5 text-teal-700">
                <UserCheck className="h-5 w-5" />
                <h2 className="text-lg font-bold text-slate-900">
                  Đăng nhập tài khoản demo
                </h2>
              </div>
              <p className="mt-1.5 text-sm text-slate-600">
                Nhập email tài khoản mẫu bên cạnh hoặc điền trực tiếp để kiểm tra luồng xác thực mô phỏng.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label
                    htmlFor="demo-email"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Email tài khoản demo
                  </label>
                  <input
                    id="demo-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="teacher7a1@hpu2.it"
                    className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
                  />
                </div>

                <div>
                  <label
                    htmlFor="demo-password"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Mật khẩu demo
                  </label>
                  <div className="relative mt-1.5">
                    <input
                      id="demo-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="123456"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 pr-10 text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
                    />
                    <KeyRound className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
                  </div>
                </div>

                {errorMsg && (
                  <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 transition-colors"
                >
                  Đăng nhập vào hệ thống demo
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              <div className="mt-6 border-t border-slate-200 pt-5 space-y-3">
                <div className="flex items-start gap-2.5 text-xs text-slate-600">
                  <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  <p className="leading-relaxed">
                    <span className="font-semibold text-slate-800">
                      Lưu ý môi trường Demo:
                    </span>{' '}
                    Đây là hệ thống xác thực mô phỏng phục vụ trình diễn sản phẩm, không phải hệ thống bảo mật production và không kết nối cơ sở dữ liệu thật.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 rounded-lg bg-slate-50 p-3 text-center">
                  <div>
                    <p className="font-mono-tabular text-lg font-bold text-slate-900">5</p>
                    <p className="text-[11px] text-slate-500">Lớp học</p>
                  </div>
                  <div>
                    <p className="font-mono-tabular text-lg font-bold text-slate-900">150</p>
                    <p className="text-[11px] text-slate-500">Học sinh</p>
                  </div>
                  <div>
                    <p className="font-mono-tabular text-lg font-bold text-slate-900">12</p>
                    <p className="text-[11px] text-slate-500">Tài khoản mẫu</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Role Capability Quick Legend */}
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-3">
                <Users className="h-4 w-4 shrink-0 text-teal-700" />
                <span>Phân quyền tách biệt theo vai trò</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-3">
                <GraduationCap className="h-4 w-4 shrink-0 text-teal-700" />
                <span>Lưu thao tác trên LocalStorage</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
