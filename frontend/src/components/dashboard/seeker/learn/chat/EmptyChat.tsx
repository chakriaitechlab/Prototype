export function EmptyChat() {
  return (
    <div className="learning-empty">
      <div className="learning-empty__hero">
        <p className="learning-empty__eyebrow">Fig. 01 — Learning path</p>
        <h2 className="learning-empty__title">
          Learn anything, <span className="italic">step by step</span>
        </h2>

        <svg
          className="schematic-diagram"
          viewBox="0 0 840 190"
          fill="none"
          aria-hidden="true"
        >
          <defs>
            <filter id="schematicGlow" x="-200%" y="-200%" width="500%" height="500%">
              <feGaussianBlur stdDeviation="3.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <path
            id="schematicFlowPath"
            className="flow-path"
            pathLength={100}
            d="M60,130 Q160,30 260,70 Q360,120 460,60 Q560,10 640,55 Q700,85 780,60"
          />

          <circle className="pulse" r="4">
            <animateMotion dur="4.5s" repeatCount="indefinite">
              <mpath href="#schematicFlowPath" />
            </animateMotion>
          </circle>
          <circle className="pulse" r="4" opacity="0.7">
            <animateMotion dur="4.5s" begin="-2.25s" repeatCount="indefinite">
              <mpath href="#schematicFlowPath" />
            </animateMotion>
          </circle>

          <g>
            <circle className="node-core" cx="60" cy="130" r="9" style={{ animationDelay: '0.4s' }} />
            <circle className="node-dot" cx="60" cy="130" r="3" style={{ animationDelay: '0.4s' }} />
            <text
              className="node-label"
              x="60"
              y="158"
              textAnchor="middle"
              style={{ animationDelay: '0.5s' }}
            >
              01 CONCEPT
            </text>
          </g>
          <g>
            <circle className="node-core" cx="260" cy="70" r="9" style={{ animationDelay: '0.75s' }} />
            <circle className="node-dot" cx="260" cy="70" r="3" style={{ animationDelay: '0.75s' }} />
            <text
              className="node-label"
              x="260"
              y="42"
              textAnchor="middle"
              style={{ animationDelay: '0.85s' }}
            >
              02 PRACTICE
            </text>
          </g>
          <g>
            <circle className="node-core" cx="460" cy="60" r="9" style={{ animationDelay: '1.1s' }} />
            <circle className="node-dot" cx="460" cy="60" r="3" style={{ animationDelay: '1.1s' }} />
            <text
              className="node-label"
              x="460"
              y="32"
              textAnchor="middle"
              style={{ animationDelay: '1.2s' }}
            >
              03 BUILD
            </text>
          </g>
          <g>
            <circle className="node-core" cx="640" cy="55" r="9" style={{ animationDelay: '1.45s' }} />
            <circle className="node-dot" cx="640" cy="55" r="3" style={{ animationDelay: '1.45s' }} />
            <text
              className="node-label"
              x="640"
              y="27"
              textAnchor="middle"
              style={{ animationDelay: '1.55s' }}
            >
              04 SHIP
            </text>
          </g>
        </svg>

        <p className="learning-empty__sub">
          Your AI learning assistant — ask about programming, system design,
          career advice, interview prep, and more.
        </p>
      </div>
    </div>
  );
}
