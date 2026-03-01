export interface TourStep {
  id: string;
  targetSelector: string;
  title: string;
  description: string;
  placement: 'top' | 'bottom' | 'left' | 'right';
}

export const DASHBOARD_TOUR_STEPS: TourStep[] = [
  {
    id: 'create-link',
    targetSelector: '[data-tour="create-link"]',
    title: 'Create your first link',
    description:
      'Paste any URL here and click Shorten to create a trackable short link.',
    placement: 'bottom',
  },
  {
    id: 'link-list',
    targetSelector: '[data-tour="link-list"]',
    title: 'Your links appear here',
    description:
      'Each link shows its click count and creation date. Click the short URL to copy it to your clipboard.',
    placement: 'top',
  },
  {
    id: 'link-stats',
    targetSelector: '[data-tour="link-stats"]',
    title: 'View detailed analytics',
    description:
      'Click Stats to see click geography, recent visitors, and more.',
    placement: 'left',
  },
  {
    id: 'settings',
    targetSelector: '[data-tour="settings"]',
    title: 'Manage your profile',
    description: 'Update your name and view your account details in Settings.',
    placement: 'bottom',
  },
];
