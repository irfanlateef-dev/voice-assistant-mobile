export function formatRelativeTime(dateString: string): string {
  if (!dateString) {
    return 'Recently';
  }

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return 'Recently';
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return 'Just now';
  }
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

export function formatStepProgress(
  currentStep: number,
  totalSteps: number,
): string {
  if (totalSteps <= 0) {
    return 'No steps yet';
  }
  return `Step ${Math.min(currentStep, totalSteps)} of ${totalSteps}`;
}

export function capitalizeStatus(status: string): string {
  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function getVoiceStatusLabel(status: string): string {
  switch (status) {
    case 'idle':
      return 'Ready';
    case 'connecting':
      return 'Connecting to Grace';
    case 'listening':
      return 'Listening';
    case 'speaking':
      return 'Grace is speaking';
    case 'thinking':
      return 'Grace is thinking';
    case 'interrupted':
      return 'Interrupted';
    case 'stalled':
      return 'Connection stalled';
    default:
      return status;
  }
}
