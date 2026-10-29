import { Briefcase, Building2, Sparkles } from 'lucide-react';

export function AuthSidebar() {
  return (
    <aside className="jp-auth-aside" aria-hidden>
      <div className="jp-auth-aside-inner is-light">
        <div className="jp-auth-aside-content">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="jp-auth-aside-art"
            src="/jobpilot/undraw_authentication_1evl.svg"
            alt=""
          />

          <div className="jp-auth-proof">
            <p className="jp-auth-proof-title">
              Thousands of <strong>active candidates</strong> waiting for great employers.
            </p>
            <div className="jp-auth-stat">
              <div className="jp-auth-stat-item">
                <span className="jp-auth-stat-ico">
                  <Briefcase size={22} strokeWidth={1.75} />
                </span>
                <strong>Active</strong>
                <span>Live Jobs</span>
              </div>

              <div className="jp-auth-stat-item">
                <span className="jp-auth-stat-ico">
                  <Building2 size={22} strokeWidth={1.75} />
                </span>
                <strong>Verified</strong>
                <span>Companies</span>
              </div>

              <div className="jp-auth-stat-item">
                <span className="jp-auth-stat-ico">
                  <Sparkles size={22} strokeWidth={1.75} />
                </span>
                <strong>AI Matched</strong>
                <span>New Jobs</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
