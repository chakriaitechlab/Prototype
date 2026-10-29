import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { lookup } from 'node:dns/promises';
import { BlockList, isIP } from 'node:net';
import { chromium } from 'playwright';
import type { Browser, BrowserContext, Route } from 'playwright';

const VIEWPORT = { width: 1280, height: 800 };
const NAVIGATION_TIMEOUT_MS = 30_000;
const ACTION_TIMEOUT_MS = 10_000;
const INLINE_PROTOCOLS = new Set(['data:', 'blob:', 'about:']);
const HOST_CACHE_MAX = 1_000;

const PRIVATE_NETWORKS = new BlockList();
const PRIVATE_IPV4: [string, number][] = [
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['172.16.0.0', 12],
  ['192.168.0.0', 16],
  ['224.0.0.0', 4],
];
const PRIVATE_IPV6: [string, number][] = [
  ['::', 128],
  ['::1', 128],
  ['fc00::', 7],
  ['fe80::', 10],
];
PRIVATE_IPV4.forEach(([address, prefix]) => PRIVATE_NETWORKS.addSubnet(address, prefix, 'ipv4'));
PRIVATE_IPV6.forEach(([address, prefix]) => PRIVATE_NETWORKS.addSubnet(address, prefix, 'ipv6'));

@Injectable()
export class BrowserService implements OnModuleDestroy {
  private readonly logger = new Logger(BrowserService.name);
  private browser: Promise<Browser> | null = null;
  private readonly hostCache = new Map<string, Promise<boolean>>();

  async newContext(): Promise<BrowserContext> {
    const browser = await this.launch();
    const context = await browser.newContext({ viewport: VIEWPORT, locale: 'en-US', acceptDownloads: false });
    context.setDefaultNavigationTimeout(NAVIGATION_TIMEOUT_MS);
    context.setDefaultTimeout(ACTION_TIMEOUT_MS);
    await context.route('**/*', (route) => this.guard(route));
    return context;
  }

  async isPublicUrl(url: string) {
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      return false;
    }
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
    return this.isPublicHost(parsed.hostname);
  }

  async onModuleDestroy() {
    const browser = await this.browser?.catch(() => null);
    await browser?.close().catch(() => {});
  }

  private launch() {
    if (!this.browser) {
      this.browser = chromium.launch({ headless: true }).then((browser) => {
        this.logger.log('🌐 Agent browser launched');
        browser.on('disconnected', () => {
          this.logger.warn('Agent browser disconnected');
          this.browser = null;
        });
        return browser;
      });
      this.browser.catch((error: unknown) => {
        this.logger.error(`❌ Agent browser failed to launch: ${error instanceof Error ? error.message : String(error)}`);
        this.browser = null;
      });
    }
    return this.browser;
  }

  private async guard(route: Route) {
    const url = route.request().url();
    const { protocol } = new URL(url);
    const allowed = protocol === 'http:' || protocol === 'https:' ? await this.isPublicUrl(url) : INLINE_PROTOCOLS.has(protocol);
    await (allowed ? route.continue() : route.abort('blockedbyclient')).catch(() => {});
  }

  private isPublicHost(hostname: string) {
    const host = hostname.replace(/^\[|\]$/g, '').toLowerCase();
    if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.internal')) return Promise.resolve(false);

    let cached = this.hostCache.get(host);
    if (!cached) {
      if (this.hostCache.size >= HOST_CACHE_MAX) this.hostCache.clear();
      cached = this.resolvesPublic(host);
      this.hostCache.set(host, cached);
    }
    return cached;
  }

  private async resolvesPublic(host: string) {
    const family = isIP(host);
    const addresses = family ? [{ address: host, family }] : await lookup(host, { all: true }).catch(() => []);
    return (
      addresses.length > 0 &&
      addresses.every(({ address, family: version }) => !PRIVATE_NETWORKS.check(address, version === 6 ? 'ipv6' : 'ipv4'))
    );
  }
}
