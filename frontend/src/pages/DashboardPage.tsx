import { useLinks } from '../hooks/useLinks';
import { CreateLinkForm } from '../components/links/CreateLinkForm';
import { LinkList } from '../components/links/LinkList';
import { Pagination } from '../components/links/Pagination';

export function DashboardPage() {
  const { links, page, totalPages, totalElements, isLoading, error, setPage, createLink, deleteLink } =
    useLinks();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-text-primary">My Links</h1>
        {totalElements > 0 && (
          <p className="text-sm text-text-secondary mt-1">
            {totalElements} link{totalElements !== 1 ? 's' : ''} total
          </p>
        )}
      </div>

      <CreateLinkForm onSubmit={createLink} />
      <LinkList links={links} isLoading={isLoading} error={error} onDelete={deleteLink} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
