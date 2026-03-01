import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import type { LinkResponse } from '../../types/api';
import { copyToClipboard, timeAgo, truncateUrl } from '../../lib/utils';

interface LinkCardProps {
  link: LinkResponse;
  onDelete: (id: number) => Promise<void>;
  isFirst?: boolean;
}

export function LinkCard({ link, onDelete, isFirst }: LinkCardProps) {
  const [copied, setCopied] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(link.shortUrl);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(link.id);
    } finally {
      setIsDeleting(false);
      setShowDelete(false);
    }
  };

  return (
    <>
      <Card padding="none" className="overflow-hidden">
        <div className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <button
                  onClick={handleCopy}
                  className="text-accent font-medium text-sm hover:underline truncate cursor-pointer"
                  title="Click to copy"
                >
                  {link.shortUrl}
                </button>
                {copied && (
                  <span className="text-xs text-success font-medium shrink-0">
                    Copied!
                  </span>
                )}
              </div>
              <p className="text-sm text-text-tertiary truncate">
                {truncateUrl(link.originalUrl, 60)}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-1.5 text-text-secondary">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />
                </svg>
                <span className="text-sm font-medium">{link.clickCount}</span>
              </div>

              <span className="text-xs text-text-tertiary">
                {timeAgo(link.createdAt)}
              </span>

              <div className="flex items-center gap-1">
                <Link
                  to={`/links/${link.id}/stats`}
                  data-tour={isFirst ? 'link-stats' : undefined}
                  className="px-3 py-1.5 text-xs font-medium text-accent bg-accent/5 hover:bg-accent/10 rounded-lg transition-colors"
                >
                  Stats
                </Link>
                <button
                  onClick={() => setShowDelete(true)}
                  className="p-1.5 text-text-tertiary hover:text-danger hover:bg-danger/5 rounded-lg transition-colors cursor-pointer"
                  title="Delete"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Modal
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        title="Delete link"
      >
        <p className="text-sm text-text-secondary mb-6">
          Are you sure you want to delete this link? This action cannot be undone and all analytics data will be lost.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowDelete(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} isLoading={isDeleting}>
            Delete
          </Button>
        </div>
      </Modal>
    </>
  );
}
