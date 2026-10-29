import { Injectable } from '@nestjs/common';
import type { BrowserContext, CDPSession, Page } from 'playwright';

const FRAME_QUALITY = 50;
const FRAME_MAX_WIDTH = 1280;
const FRAME_MAX_HEIGHT = 800;

const CURSOR_SCRIPT = `(() => {
  if (window.__agentCursor) return;
  window.__agentCursor = true;
  const mount = () => {
    const cursor = document.createElement('div');
    cursor.setAttribute('aria-hidden', 'true');
    cursor.style.cssText = 'position:fixed;left:0;top:0;width:22px;height:22px;z-index:2147483647;pointer-events:none;transform:translate(-100px,-100px);transition:transform 40ms linear;';
    cursor.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24"><path d="M4 2l15 9.5-6.6 1.4L16 21l-3.2 1.4-3.6-8.2L4 18z" fill="#0a65cc" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/></svg>';
    const ring = document.createElement('div');
    ring.style.cssText = 'position:absolute;left:-9px;top:-9px;width:18px;height:18px;border-radius:50%;border:2px solid #0a65cc;opacity:0;transition:opacity 150ms,transform 150ms;';
    cursor.appendChild(ring);
    document.documentElement.appendChild(cursor);
    document.addEventListener('mousemove', (event) => {
      cursor.style.transform = 'translate(' + event.clientX + 'px,' + event.clientY + 'px)';
    }, true);
    document.addEventListener('mousedown', () => {
      ring.style.opacity = '1';
      ring.style.transform = 'scale(1.6)';
      setTimeout(() => { ring.style.opacity = '0'; ring.style.transform = 'scale(1)'; }, 250);
    }, true);
  };
  if (document.documentElement) mount();
  else document.addEventListener('DOMContentLoaded', mount);
})();`;

export interface ScreencastFrame {
  image: string;
  url: string;
}

@Injectable()
export class ScreencastService {
  async prepare(context: BrowserContext) {
    await context.addInitScript(CURSOR_SCRIPT);
  }

  async start(page: Page, onFrame: (frame: ScreencastFrame) => void): Promise<() => Promise<void>> {
    const session: CDPSession = await page.context().newCDPSession(page);

    session.on('Page.screencastFrame', ({ data, sessionId }) => {
      onFrame({ image: `data:image/jpeg;base64,${data}`, url: page.url() });
      void session.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
    });
    await session.send('Page.startScreencast', {
      format: 'jpeg',
      quality: FRAME_QUALITY,
      maxWidth: FRAME_MAX_WIDTH,
      maxHeight: FRAME_MAX_HEIGHT,
    });

    return async () => {
      await session.send('Page.stopScreencast').catch(() => {});
      await session.detach().catch(() => {});
    };
  }
}
