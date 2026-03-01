import type { LinkResponse } from '../../types/api';
import { EmptyState } from '../ui/EmptyState';
import { Spinner } from '../ui/Spinner';
import { LinkCard } from './LinkCard';

interface LinkListProps {
  links: LinkResponse[];
  isLoading: boolean;
  error: string | null;
  onDelete: (id: number) => Promise<void>;
}

export function LinkList({ links, isLoading, error, onDelete }: LinkListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-danger">{error}</p>
      </div>
    );
  }

  if (links.length === 0) {
    return (
      <EmptyState
        icon={
          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.07-9.07a4.5 4.5 0 016.364 6.364l-4.5 4.5a4.5 4.5 0 01-7.244-1.242" />
          </svg>
        }
        title="No links yet"
        description="Paste a URL above to create your first shortened link and start tracking clicks."
      />
    );
  }

  return (
    <div className="space-y-3" data-tour="link-list">
      {links.map((link, index) => (
        <LinkCard
          key={link.id}
          link={link}
          onDelete={onDelete}
          isFirst={index === 0}
        />
      ))}
    </div>
  );
}
