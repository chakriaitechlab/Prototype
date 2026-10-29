import type { Metadata } from 'next';
import { JobForm } from '@/components/dashboard/recruiter/job-form/JobForm';

export const metadata: Metadata = {
  title: 'Post a Job | Recruiter Dashboard | Chakri.ai',
  description: 'Create and publish a job vacancy on Chakri.ai with AI-powered auto-pilot screening.',
};

export default function RecruiterPostJobPage() {
  return (
    <div className="w-full pb-10">
      <div className="mb-5">
        <h1 className="cpost-title">Post a job</h1>
        <p className="text-sm text-[#5e6670]">
          Fill in the details below to create and publish your vacancy on Chakri.ai.
        </p>
      </div>
      <JobForm />
    </div>
  );
}
