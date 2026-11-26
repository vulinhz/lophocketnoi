import { AlertTriangle, CheckCircle2, Clock, Send } from 'lucide-react';
import type { ContentStatus } from '../types/domain';

export function WorkflowStatusText({ status }: { status: ContentStatus }) {
  if (status === 'PUBLISHED') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 whitespace-nowrap">
        <Send className="h-3.5 w-3.5 shrink-0" />
        Đã phát hành (PUBLISHED)
      </span>
    );
  }
  if (status === 'APPROVED') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-700 whitespace-nowrap">
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
        Đã duyệt (APPROVED)
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 whitespace-nowrap">
      <Clock className="h-3.5 w-3.5 shrink-0" />
      Bản nháp (DRAFT)
    </span>
  );
}

export function AttentionStatusText({ needsAttention }: { needsAttention: boolean }) {
  if (!needsAttention) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 whitespace-nowrap">
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
        Ổn định
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-700 whitespace-nowrap">
      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
      Cần quan tâm
    </span>
  );
}
