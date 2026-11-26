import type { ParentProfile } from '../types/domain';
import { MOCK_STUDENTS } from './mockStudents';

const OCCUPATIONS = [
  'Kỹ sư phần mềm',
  'Nhân viên ngân hàng',
  'Bác sĩ nội khoa',
  'Giảng viên đại học',
  'Kế toán trưởng',
  'Kinh doanh tự do',
  'Kiến trúc sư',
  'Dược sĩ',
  'Chuyên viên nhân sự',
  'Biên tập viên',
];

const DEMO_PARENT_OVERRIDES: Record<
  string,
  { email: string; occupation: string; relationship: 'Mẹ' | 'Bố' }
> = {
  PH_01: {
    email: 'parent01@hpu2.it',
    occupation: 'Kế toán trưởng',
    relationship: 'Mẹ',
  },
  PH_02: {
    email: 'parent02@hpu2.it',
    occupation: 'Kiến trúc sư',
    relationship: 'Bố',
  },
  PH_03: {
    email: 'parent03@hpu2.it',
    occupation: 'Dược sĩ',
    relationship: 'Mẹ',
  },
};

export const MOCK_PARENTS: ParentProfile[] = MOCK_STUDENTS.map((student, idx) => {
  const demo = DEMO_PARENT_OVERRIDES[student.parentId];
  const isMother = student.parentName.startsWith('Chị');
  return {
    id: student.parentId,
    fullName: student.parentName,
    email: demo?.email,
    phone: student.parentPhone,
    relationship: demo?.relationship ?? (isMother ? 'Mẹ' : 'Bố'),
    occupation: demo?.occupation ?? OCCUPATIONS[idx % OCCUPATIONS.length],
    linkedStudentIds: [student.id],
    isDemoAccount: Boolean(demo),
  };
});
