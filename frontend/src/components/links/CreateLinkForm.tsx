import { useState, type FormEvent } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import type { CreateLinkRequest } from '../../types/api';
import { ApiError } from '../../lib/api-client';

interface CreateLinkFormProps {
  onSubmit: (data: CreateLinkRequest) => Promise<unknown>;
}

export function CreateLinkForm({ onSubmit }: CreateLinkFormProps) {
  const [url, setUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      await onSubmit({
        originalUrl: url.trim(),
        ...(customCode.trim() ? { customCode: customCode.trim() } : {}),
      });
      setUrl('');
      setCustomCode('');
      setShowCustom(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create link');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card padding="lg" className="mb-6" data-tour="create-link">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Paste your long URL here..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              type="url"
              required
            />
          </div>
          <Button type="submit" isLoading={isLoading} size="md" className="shrink-0">
            Shorten
          </Button>
        </div>

        <div className="mt-3">
          {!showCustom ? (
            <button
              type="button"
              onClick={() => setShowCustom(true)}
              className="text-xs text-text-tertiary hover:text-accent transition-colors cursor-pointer"
            >
              + Custom short code
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <Input
                placeholder="my-custom-code"
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value)}
                className="max-w-xs text-sm"
              />
              <button
                type="button"
                onClick={() => {
                  setShowCustom(false);
                  setCustomCode('');
                }}
                className="text-xs text-text-tertiary hover:text-danger transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {error && (
          <p className="mt-3 text-sm text-danger">{error}</p>
        )}
      </form>
    </Card>
  );
}
