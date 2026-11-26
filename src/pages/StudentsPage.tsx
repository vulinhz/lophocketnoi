import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Search, ShieldAlert } from 'lucide-react';
import { useDemo } from '../context/DemoContext';
import { studentService } from '../services/studentService';
import type { ClassId } from '../types/domain';
import { StudentAvatar } from '../components/StudentAvatar';
import { AttentionStatusText } from '../components/StatusLabel';

const PAGE_SIZE = 15;
const CLASS_IDS: Array<ClassId | 'ALL'> = ['ALL', '7A1', '7A3', '10A2', '11A1', '11A2'];

export function StudentsPage() {
  const { currentUser } = useDemo();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialClass = (searchParams.get('class') as ClassId | 'ALL') || 'ALL';

  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState<ClassId | 'ALL'>(initialClass);
  const [conductFilter, setConductFilter] = useState<'ALL' | 'Tốt' | 'Khá' | 'Đạt'>('ALL');
  const [attentionOnly, setAttentionOnly] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const paramClass = searchParams.get('class') as ClassId | null;
    if (paramClass && ['7A1', '7A3', '10A2', '11A1', '11A2'].includes(paramClass)) {
      setClassFilter(paramClass);
    }
  }, [searchParams]);

  if (!currentUser) return null;

  // Parent & Student are restricted from browsing class rosters
  if (currentUser.role === 'PARENT' || currentUser.role === 'STUDENT') {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
        <ShieldAlert className="mx-auto h-10 w-10 text-amber-600" />
        <h1 className="mt-3 text-lg font-bold text-slate-900">
          Giới hạn phạm vi truy cập theo vai trò
        </h1>
        <p className="mx-auto mt-1.5 max-w-md text-sm text-slate-600">
          Tài khoản {currentUser.role === 'PARENT' ? 'Phụ huynh' : 'Học sinh'} chỉ được phép xem hồ sơ cá nhân được liên kết, không xem danh sách học sinh toàn lớp.
        </p>
        <Link
          to={`/students/${currentUser.linkedStudentId}`}
          className="mt-5 inline-flex items-center rounded-lg bg-teal-700 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-800"
        >
          Mở hồ sơ được liên kết
        </Link>
      </div>
    );
  }

  const filtered = useMemo(
    () =>
      studentService.filterStudents(currentUser, {
        search,
        classId: currentUser.role === 'GVCN' ? currentUser.assignedClassId : classFilter,
        conduct: conductFilter,
        attentionOnly,
      }),
    [currentUser, search, classFilter, conductFilter, attentionOnly],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedStudents = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const handleClassChange = (val: ClassId | 'ALL') => {
    setClassFilter(val);
    setPage(1);
    if (val === 'ALL') {
      searchParams.delete('class');
    } else {
      searchParams.set('class', val);
    }
    setSearchParams(searchParams, { replace: true });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
            {currentUser.role === 'ADMIN'
              ? 'Danh sách 150 học sinh toàn trường'
              : `Danh sách học sinh lớp ${currentUser.assignedClassId}`}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {currentUser.role === 'ADMIN'
              ? 'Quản lý tập trung 5 lớp (30 học sinh/lớp). Bấm vào từng học sinh để xem hồ sơ chi tiết.'
              : `GVCN chỉ xem được 30 học sinh thuộc lớp ${currentUser.assignedClassId} được phân công.`}
          </p>
        </div>
        <p className="font-mono-tabular text-xs font-medium text-slate-600">
          Đang hiển thị {filtered.length} học sinh
        </p>
      </div>

      {/* Filters Toolbar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
          <div className="relative md:col-span-5">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Tìm theo tên học sinh, mã HS, phụ huynh..."
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-teal-600"
            />
          </div>

          <div className="md:col-span-3">
            <select
              aria-label="Lọc theo xếp loại rèn luyện"
              value={conductFilter}
              onChange={(e) => {
                setConductFilter(e.target.value as 'ALL' | 'Tốt' | 'Khá' | 'Đạt');
                setPage(1);
              }}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-600"
            >
              <option value="ALL">Rèn luyện: Tất cả</option>
              <option value="Tốt">Rèn luyện: Tốt</option>
              <option value="Khá">Rèn luyện: Khá</option>
              <option value="Đạt">Rèn luyện: Đạt</option>
            </select>
          </div>

          <div className="flex items-center md:col-span-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={attentionOnly}
                onChange={(e) => {
                  setAttentionOnly(e.target.checked);
                  setPage(1);
                }}
                className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-600"
              />
              <span>Chỉ hiện học sinh cần quan tâm</span>
            </label>
          </div>
        </div>

        {currentUser.role === 'ADMIN' && (
          <div className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1 w-fit">
            {CLASS_IDS.map((cid) => (
              <button
                key={cid}
                type="button"
                onClick={() => handleClassChange(cid)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                  classFilter === cid
                    ? 'bg-white text-teal-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cid === 'ALL' ? 'Tất cả 5 lớp (150)' : `Lớp ${cid} (30)`}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Data Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {pagedStudents.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm font-semibold text-slate-900">
              Không tìm thấy học sinh phù hợp bộ lọc
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Thử thay đổi từ khóa tìm kiếm hoặc đặt lại bộ lọc.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setConductFilter('ALL');
                setAttentionOnly(false);
                if (currentUser.role === 'ADMIN') handleClassChange('ALL');
              }}
              className="mt-4 rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Xóa bộ lọc
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                  <th className="px-4 py-3">Mã HS</th>
                  <th className="px-4 py-3">Học sinh</th>
                  <th className="px-4 py-3">Lớp</th>
                  <th className="px-4 py-3">Ngày sinh</th>
                  <th className="px-4 py-3">Phụ huynh</th>
                  <th className="px-4 py-3 text-right">ĐTB</th>
                  <th className="px-4 py-3 text-right">Chuyên cần</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Hồ sơ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {pagedStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-mono-tabular text-xs font-semibold text-slate-700">
                      {s.studentCode}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <StudentAvatar fullName={s.fullName} palette={s.avatarPalette} size="sm" />
                        <div className="min-w-0">
                          <Link
                            to={`/students/${s.id}`}
                            className="font-semibold text-slate-900 hover:text-teal-700"
                          >
                            {s.fullName}
                          </Link>
                          <p className="text-xs text-slate-500">
                            {s.gender} · Rèn luyện: {s.conduct}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono-tabular text-xs font-semibold text-slate-700">
                      {s.classId}
                    </td>
                    <td className="px-4 py-3 font-mono-tabular text-xs text-slate-600">
                      {s.birthDate}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-700">
                      <p className="font-medium text-slate-800">{s.parentName}</p>
                      <p className="font-mono-tabular text-slate-500">{s.parentPhone}</p>
                    </td>
                    <td className="px-4 py-3 text-right font-mono-tabular font-semibold text-slate-900">
                      {s.gpa.toFixed(1)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono-tabular text-slate-700">
                      {s.attendanceRate}%
                    </td>
                    <td className="px-4 py-3">
                      <AttentionStatusText needsAttention={s.needsAttention} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/students/${s.id}`}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-teal-700 hover:bg-teal-50 whitespace-nowrap"
                      >
                        Chi tiết
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
            <p className="font-mono-tabular text-xs text-slate-500">
              Trang {safePage} / {totalPages} · Tổng {filtered.length} học sinh
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Trước
              </button>
              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >
                Sau
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
