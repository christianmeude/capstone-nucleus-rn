import { PaperStatus } from '../types/domain';
import { Chip, ChipTone } from './ui/Chip';
import { statusToLabel } from '../utils/format';

export const ACTIVE_STATUSES = new Set<PaperStatus>([
  'pending',
  'pending_faculty',
  'pending_dean',
  'pending_program_chair',
  'pending_editor',
  'pending_admin',
]);

export const ACTION_STATUSES = new Set<PaperStatus>(['revision_required', 'rejected']);
export const PUBLISHED_STATUSES = new Set<PaperStatus>(['approved', 'published']);

const statusToTone = (status?: PaperStatus): ChipTone => {
  if (!status) return 'neutral';
  if (status === 'revision_required') return 'warning';
  if (status === 'rejected') return 'danger';
  if (PUBLISHED_STATUSES.has(status)) return 'success';
  if (ACTIVE_STATUSES.has(status)) return 'info';
  return 'neutral';
};

interface PaperStatusChipProps {
  status?: PaperStatus;
}

export const PaperStatusChip = ({ status }: PaperStatusChipProps) => {
  return <Chip variant="status" tone={statusToTone(status)} label={statusToLabel(status)} />;
};
