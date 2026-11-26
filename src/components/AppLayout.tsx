import React, { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeftRight,
  Award,
  BookOpen,
  ClipboardCheck,
  Database,
  FileText,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  MessageSquare,
  RotateCcw,
  Users,
  X,
} from 'lucide-react';
import { useDemo } from '../context/DemoContext';
import { useToast } from '../context/ToastContext';
import { DEMO_ACCOUNTS, ROLE_LABELS } from '../services/demoAuthService';
import { StudentAvatar } from './StudentAvatar';

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, quickLogin, logout, resetDemoData } = useDemo();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  if (!currentUser) return null;

  const getNavItems = (): NavItem[] => {
    if (currentUser.role === 'ADMIN') {
      return [
        { to: '/', label: 'Tổng quan trường', icon: LayoutDashboard },
        { to: '/students', label: 'Học sinh (150)', icon: Users },
        { to: '/observations', label: 'Nhật ký quan sát', icon: BookOpen },
        { to: '/comments', label: 'Nhận xét & AI', icon: FileText },
        { to: '/announcements', label: 'Thông báo lớp', icon: Megaphone },
        { to: '/feedback', label: 'Phản hồi phụ huynh', icon: MessageSquare },
        { to: '/demo-admin', label: 'Quản trị Demo', icon: Database },
      ];
    }
    if (currentUser.role === 'GVCN') {
      return [
        { to: '/', label: `Tổng quan ${currentUser.assignedClassId}`, icon: LayoutDashboard },
        { to: '/students', label: 'Học sinh lớp', icon: Users },
        { to: '/observations', label: 'Nhật ký quan sát', icon: BookOpen },
        { to: '/comments', label: 'Nhận xét & AI', icon: FileText },
        { to: '/announcements', label: 'Thông báo lớp', icon: Megaphone },
        { to: '/feedback', label: 'Phản hồi phụ huynh', icon: MessageSquare },
      ];
    }
    if (currentUser.role === 'PARENT') {
      return [
        { to: '/', label: 'Tổng quan đồng hành', icon: LayoutDashboard },
        {
          to: `/students/${currentUser.linkedStudentId}`,
          label: 'Hồ sơ của con',
          icon: Users,
        },
        { to: '/announcements', label: 'Thông báo lớp', icon: Megaphone },
        { to: '/feedback', label: 'Phản hồi GVCN', icon: MessageSquare },
      ];
    }
    return [
      { to: '/', label: 'Bảng học tập', icon: LayoutDashboard },
      {
        to: `/students/${currentUser.linkedStudentId}`,
        label: 'Hồ sơ cá nhân',
        icon: Users,
      },
      { to: '/student-hub', label: 'Mục tiêu & Tự đánh giá', icon: Award },
      { to: '/announcements', label: 'Thông báo lớp', icon: Megaphone },
    ];
  };

  const navItems = getNavItems();

  const currentScopeText =
    currentUser.role === 'ADMIN'
      ? 'Toàn trường · 5 lớp · 150 học sinh'
      : currentUser.assignedClassId
        ? `Lớp ${currentUser.assignedClassId}`
        : '';

  const handleSwitchAccount = (accountId: string) => {
    quickLogin(accountId);
    setSwitcherOpen(false);
    setMobileMenuOpen(false);
    const target = DEMO_ACCOUNTS.find((a) => a.id === accountId);
    if (target) {
      showToast(
        `Đã chuyển sang ${target.fullName}`,
        `${ROLE_LABELS[target.role]}${target.assignedClassId ? ` · Lớp ${target.assignedClassId}` : ''}`,
        'info',
      );
    }
    navigate('/');
  };

  const handleLogout = () => {
    logout();
    showToast('Đã đăng xuất phiên demo', undefined, 'info');
    navigate('/login');
  };

  const handleResetDemo = () => {
    resetDemoData();
    setConfirmResetOpen(false);
    showToast(
      'Đã khôi phục dữ liệu demo gốc',
      '5 lớp (150 học sinh), nhận xét, thông báo và nhật ký đã về trạng thái ban đầu.',
      'success',
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[264px] shrink-0 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 text-base font-bold tracking-tight text-slate-900 whitespace-nowrap"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-700 text-white">
              <ClipboardCheck className="h-4 w-4" />
            </span>
            <span>Lớp Học Kết Nối</span>
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="Đóng menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Active Role Context Box */}
        <div className="border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <StudentAvatar
              fullName={currentUser.fullName}
              avatarUrl={currentUser.avatarUrl}
              size="md"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">
                {currentUser.fullName}
              </p>
              <p className="truncate text-xs text-slate-500">
                {ROLE_LABELS[currentUser.role]}
              </p>
            </div>
          </div>
          <p className="mt-2.5 text-xs font-medium text-teal-700">
            {currentScopeText}
          </p>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Điều hướng chính">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-teal-50 text-teal-800'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${
                    isActive ? 'text-teal-700' : 'text-slate-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Demo Controls */}
        <div className="border-t border-slate-200 p-4 space-y-2">
          <button
            type="button"
            onClick={() => setSwitcherOpen(true)}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            <ArrowLeftRight className="h-3.5 w-3.5 text-teal-700" />
            Đổi tài khoản demo
          </button>
          <button
            type="button"
            onClick={() => setConfirmResetOpen(true)}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors whitespace-nowrap"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset dữ liệu demo
          </button>
          <p className="pt-1 text-center text-[11px] text-slate-400">
            Dữ liệu giả lập trên trình duyệt
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Bar Contract: 3 zones */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              aria-label="Mở menu điều hướng"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                {currentUser.title}
              </p>
              <p className="hidden truncate text-xs text-slate-500 sm:block">
                {currentUser.email} · {currentScopeText}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setSwitcherOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0"
            >
              <ArrowLeftRight className="h-3.5 w-3.5 text-teal-700" />
              Chuyển vai trò
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-medium text-white hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
            >
              <LogOut className="h-3.5 w-3.5" />
              Đăng xuất
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1200px]">{children}</div>
        </main>
      </div>

      {/* Quick Account Switcher Modal */}
      {switcherOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Chuyển đổi tài khoản trình diễn
                </h2>
                <p className="text-xs text-slate-500">
                  Chọn nhanh 1 trong 12 tài khoản mẫu để kiểm tra phân quyền theo vai trò
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSwitcherOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-y-auto p-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {DEMO_ACCOUNTS.map((acc) => {
                const isCurrent = acc.id === currentUser.id;
                return (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => handleSwitchAccount(acc.id)}
                    className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-colors ${
                      isCurrent
                        ? 'border-teal-600 bg-teal-50/70'
                        : 'border-slate-200 bg-white hover:border-teal-300 hover:bg-slate-50'
                    }`}
                  >
                    <StudentAvatar
                      fullName={acc.fullName}
                      avatarUrl={acc.avatarUrl}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {acc.fullName}
                      </p>
                      <p className="truncate text-xs text-teal-700 font-medium">
                        {ROLE_LABELS[acc.role]}
                        {acc.assignedClassId ? ` · ${acc.assignedClassId}` : ''}
                      </p>
                      <p className="mt-0.5 truncate font-mono-tabular text-[11px] text-slate-500">
                        {acc.email}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Confirm Reset Modal */}
      {confirmResetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <h2 className="text-base font-bold text-slate-900">
              Khôi phục dữ liệu demo gốc?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Thao tác này sẽ xóa toàn bộ thay đổi đã lưu trong LocalStorage và đưa 5 lớp (150 học sinh), nhận xét, thông báo, mục tiêu về trạng thái ban đầu.
            </p>
            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmResetOpen(false)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleResetDemo}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Xác nhận Reset Demo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
