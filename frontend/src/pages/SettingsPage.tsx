import { useState, type FormEvent } from 'react';
import { useProfile } from '../hooks/useProfile';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { formatDate } from '../lib/utils';

export function SettingsPage() {
  const { user, isSaving, error, success, save } = useProfile();

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    save({ firstName, lastName });
  };

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold text-text-primary mb-6">Settings</h1>

      <Card padding="lg" className="mb-6">
        <h2 className="text-base font-semibold text-text-primary mb-4">Profile</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <Input
              label="Last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          <Input
            label="Email"
            value={user?.email || ''}
            disabled
          />

          {error && (
            <p className="text-sm text-danger">{error}</p>
          )}
          {success && (
            <p className="text-sm text-success">Profile updated successfully.</p>
          )}

          <Button type="submit" isLoading={isSaving}>
            Save Changes
          </Button>
        </form>
      </Card>

      <Card padding="lg">
        <h2 className="text-base font-semibold text-text-primary mb-4">Account</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">Member since</span>
            <span className="text-sm text-text-primary">
              {user?.createdAt ? formatDate(user.createdAt) : '-'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">Role</span>
            <div className="flex gap-1.5">
              {user?.roles.map((role) => (
                <Badge key={role}>{role}</Badge>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
