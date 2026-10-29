import { Coins } from 'lucide-react';
import type { GovtJobContent } from '@/utils/govt-job-detail';
import { GovtJobSection } from './GovtJobListSection';

const SMS_NUMBER = '16222';

function SmsCard({ children }: { children: React.ReactNode }) {
  return <div className="rounded-lg border border-[#e2e8f0] bg-white px-3.5 py-2.5">{children}</div>;
}

function SmsCode({ children }: { children: React.ReactNode }) {
  return <code className="rounded bg-[#f1f5f9] px-1.5 py-0.5 font-semibold">{children}</code>;
}

export function GovtJobApplyProcess({ content }: { content: GovtJobContent }) {
  const { applicationSite, teletalkPrefix: prefix, applyStart, applyEnd, feeAmount, smsInstructions } = content;

  return (
    <GovtJobSection id="section-process" title="আবেদন প্রক্রিয়া">
      <div className="text-[0.95rem] leading-[1.8] text-[#334155]">
        <p className="mb-3.5 mt-0">
          • পরীক্ষায় অংশগ্রহণে ইচ্ছুক ব্যক্তি{' '}
          {applicationSite ? (
            <a
              href={applicationSite}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all font-semibold !text-[#2563eb] !underline"
            >
              {applicationSite}
            </a>
          ) : (
            <strong>টেলিটক ওয়েবসাইট</strong>
          )}{' '}
          -এ গিয়ে আবেদনপত্র পূরণ করতে পারবেন।
        </p>

        <div className="mb-5 flex flex-col gap-1.5 rounded-[10px] border border-[#e2e8f0] bg-[#f8fafc] px-[1.15rem] py-3.5">
          <span className="font-semibold text-[#0f172a]">আবেদনের সময়সীমা নিম্নরূপ:</span>
          <div className="pl-2 text-[0.9rem] text-[#475569]">
            <div>
              (১) Online-এ আবেদনপত্র পূরণ ও পরীক্ষার ফি জমাদান শুরুর তারিখ: <strong>{applyStart}</strong>
            </div>
            <div>
              (২) Online-এ আবেদনপত্র জমাদানের শেষ তারিখ ও সময়: <strong>{applyEnd}</strong>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-[#cbd5e1] bg-[#f8fafc] p-5">
          <h4 className="mb-3.5 mt-0 flex items-center gap-2 text-base font-bold text-[#0f172a]">
            <Coins size={18} className="text-[#059669]" /> SMS প্রেরণ এবং পরীক্ষার ফি প্রদানের নিয়মাবলী:
          </h4>

          {feeAmount && (
            <div className="mb-3 rounded-md bg-[#dcfce7] px-3 py-2 text-[0.9rem] text-[#166534]">
              <strong>পরীক্ষার ফি:</strong> {feeAmount}
            </div>
          )}

          <div className="flex flex-col gap-2.5 text-[0.9rem]">
            {smsInstructions.length > 0 ? (
              smsInstructions.map((instruction) => (
                <SmsCard key={instruction}>
                  <span className="font-medium text-[#0f172a]">{instruction}</span>
                </SmsCard>
              ))
            ) : (
              <>
                <SmsCard>
                  <strong className="text-[#2563eb]">প্রথম SMS:</strong> <SmsCode>{prefix} &lt;USER ID&gt;</SmsCode> লিখে
                  send করতে হবে <strong>{SMS_NUMBER}</strong> নম্বরে।
                </SmsCard>
                <SmsCard>
                  <strong className="text-[#059669]">Reply:</strong> Applicant&apos;s Name, Tk. will be charged as
                  application fee. Your PIN is 12345678.
                </SmsCard>
                <SmsCard>
                  <strong className="text-[#2563eb]">দ্বিতীয় SMS:</strong> <SmsCode>{prefix} YES &lt;PIN&gt;</SmsCode> লিখে
                  send করতে হবে <strong>{SMS_NUMBER}</strong> নম্বরে।
                </SmsCard>
                <SmsCard>
                  <strong className="text-[#d97706]">Help SMS:</strong>{' '}
                  <SmsCode>{prefix} Help USER &lt;User ID&gt;</SmsCode> অথবা{' '}
                  <SmsCode>{prefix} Help PIN &lt;PIN No&gt;</SmsCode> লিখে send করুন <strong>{SMS_NUMBER}</strong>{' '}
                  নম্বরে।
                </SmsCard>
              </>
            )}
          </div>
        </div>
      </div>
    </GovtJobSection>
  );
}
