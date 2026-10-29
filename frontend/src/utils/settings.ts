import type { UserRole } from '@/types/auth';
import type { SettingsCopy } from '@/types/settings';

export const SETTINGS_COPY: Record<UserRole, SettingsCopy> = {
  SEEKER: {
    title: 'Seeker Settings',
    alerts: {
      pushEnabled: { title: 'Web & In-App Alerts', note: 'Display notifications while on Chakri dashboard.' },
      smsEnabled: { title: 'SMS Notifications', note: 'Receive urgent interview reminders via SMS.' },
      applicationUpdates: { title: 'Application Updates', note: 'Shortlists, review stages, and status changes.' },
      interviewReminders: { title: 'Interview Reminders', note: 'Upcoming interview sessions and schedules.' },
      jobMatches: { title: 'Job Matches', note: 'New jobs matching your saved search criteria.' },
    },
    deleteAccount: {
      description:
        'Permanently delete your Chakri.ai account, personal profile, CV, and all associated data. This action is irreversible and immediately revokes access to all Chakri.ai services.',
      consequences: [
        'All submitted job applications and candidate records will be erased.',
        'Active AI interview evaluations, sessions, and history will be cleared.',
        'Your profile username and resume files will be permanently removed.',
      ],
      accountLabel: 'your account',
    },
  },
  RECRUITER: {
    title: 'Recruiter Settings',
    alerts: {
      pushEnabled: { title: 'Web & In-App Alerts', note: 'Display notifications while on Chakri dashboard.' },
      smsEnabled: { title: 'SMS Notifications', note: 'Receive urgent candidate alerts and reminders via SMS.' },
      applicationUpdates: { title: 'Application Updates', note: 'Candidate applications, reviews, and status changes.' },
      interviewReminders: { title: 'Interview Reminders', note: 'Upcoming candidate interview sessions and schedules.' },
      jobMatches: { title: 'Candidate Matches', note: 'New candidate matches based on your job requirements.' },
    },
    deleteAccount: {
      description:
        'Permanently delete your Chakri.ai recruiter account, job postings, candidate messages, and all associated data. This action is irreversible and immediately revokes access to all Chakri.ai services.',
      consequences: [
        'All active job listings and candidate records will be erased.',
        'Hiring communications, interviews, and session history will be cleared.',
        'Your recruiter profile and company associations will be permanently removed.',
      ],
      accountLabel: 'your recruiter account',
    },
  },
};
