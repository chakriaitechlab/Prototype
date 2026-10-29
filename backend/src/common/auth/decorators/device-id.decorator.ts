import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { createHash } from 'node:crypto';
import type { Request } from 'express';

const DEVICE_ID_PATTERN = /^[a-zA-Z0-9_-]{8,128}$/;

export const DeviceId = createParamDecorator((_data: unknown, ctx: ExecutionContext): string => {
  const request = ctx.switchToHttp().getRequest<Request>();
  const header = request.headers['x-device-id'];
  const deviceId = typeof header === 'string' && DEVICE_ID_PATTERN.test(header) ? header : '';
  const raw = deviceId || `${request.ip}|${request.headers['user-agent'] ?? 'unknown'}`;

  return createHash('sha256').update(raw).digest('hex');
});
