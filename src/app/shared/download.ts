import { PROFILE } from '../data/portfolio.data';

/** Triggers a download of the resume PDF served from /public. */
export function downloadResume(): void {
  const link = document.createElement('a');
  link.href = PROFILE.resume;
  link.download = PROFILE.resume;
  link.click();
}
