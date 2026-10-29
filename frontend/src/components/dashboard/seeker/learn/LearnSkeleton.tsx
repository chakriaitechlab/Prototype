const SIDEBAR_ROWS = 6;

export function ChatSkeleton() {
  return (
    <div className="learning-shell__main">
      <div className="learning-messages">
        <div className="learning-messages__inner">
          <div className="learning-msgs-skel" aria-hidden="true">
            <div className="learning-skel learning-msgs-skel__user" style={{ width: '38%' }} />
            <div className="learning-msgs-skel__group">
              <div className="learning-skel learning-msgs-skel__line" style={{ width: '92%' }} />
              <div className="learning-skel learning-msgs-skel__line" style={{ width: '84%' }} />
              <div className="learning-skel learning-msgs-skel__line" style={{ width: '60%' }} />
            </div>
            <div className="learning-skel learning-msgs-skel__user" style={{ width: '26%' }} />
            <div className="learning-msgs-skel__group">
              <div className="learning-skel learning-msgs-skel__line" style={{ width: '88%' }} />
              <div className="learning-skel learning-msgs-skel__line" style={{ width: '70%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LearnSkeleton() {
  return (
    <div className="messenger-page learn-runtime-root flex h-full min-h-0 w-full flex-col" data-theme="light">
      <div className="learning-shell">
        <div className="learning-shell__sidebar">
          <aside className="learning-sidebar">
            <div className="learning-panel">
              <div className="learning-panel__body">
                <div className="learning-sidebar__skeletons" aria-hidden="true">
                  {Array.from({ length: SIDEBAR_ROWS }, (_, index) => (
                    <div key={index} className="learning-convo-skel" />
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
        <ChatSkeleton />
      </div>
    </div>
  );
}
