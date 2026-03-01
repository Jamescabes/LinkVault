import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import type { UpdateProfileRequest } from '../types/api';

export function useProfile() {
  const { user, updateProfile } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const save = async (data: UpdateProfileRequest) => {
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await updateProfile(data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return { user, isSaving, error, success, save };
}
