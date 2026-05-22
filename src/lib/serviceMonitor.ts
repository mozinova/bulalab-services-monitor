import { prisma } from './prisma';
import * as email from './email';
import net from 'node:net';

interface CheckResult {
  service: string;
  status: 'UP' | 'DOWN';
  statusCode?: number;
  error?: string;
}

function parseSipSource(source: string): { host: string; port: number } {
  const sipRegex = /^sip:(.+@)?(.+)$/i;
  const match = source.match(sipRegex);
  if (!match) throw new Error(`Invalid SIP source: ${source}`);

  let host = match[2];
  let port = 5060;

  if (host.includes(':')) {
    const parts = host.split(':');
    host = parts[0];
    port = parseInt(parts[1], 10) || 5060;
  }

  return { host, port };
}

export class ServiceMonitor {
  async checkAll(): Promise<CheckResult[]> {
    const services = await prisma.service.findMany();
    const results: CheckResult[] = [];

    for (const service of services) {
      const result = await this.checkService(service);
      results.push(result);
    }

    return results;
  }

  private async checkService(service: {
    id: string;
    name: string;
    source: string;
    protocol: string;
    status: string;
  }): Promise<CheckResult> {
    const now = new Date();

    try {
      const isUp =
        service.protocol === 'SIP'
          ? await this.checkSip(service.source)
          : await this.checkHttp(service.source);

      if (isUp) {
        if (service.status !== 'UP') {
          await this.transitionToUp(service.id, now, service.name);
        }
        return { service: service.name, status: 'UP' };
      }

      if (service.status === 'UP') {
        await this.transitionToDown(service.id, now, null, null, service.name);
      }
      return { service: service.name, status: 'DOWN' };
    } catch (error) {
      if (service.status === 'UP') {
        await this.transitionToDown(
          service.id,
          now,
          null,
          error instanceof Error ? error.message : 'Unknown error',
          service.name,
        );
      }
      return { service: service.name, status: 'DOWN', error: String(error) };
    }
  }

  private async checkHttp(source: string): Promise<boolean> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(source, { signal: controller.signal });
      return response.ok;
    } finally {
      clearTimeout(timeout);
    }
  }

  private checkSip(source: string): Promise<boolean> {
    return new Promise((resolve) => {
      const { host, port } = parseSipSource(source);
      const socket = new net.Socket();

      socket.setTimeout(10000);

      socket.on('connect', () => {
        socket.destroy();
        resolve(true);
      });

      socket.on('timeout', () => {
        socket.destroy();
        resolve(false);
      });

      socket.on('error', () => {
        socket.destroy();
        resolve(false);
      });

      socket.connect(port, host);
    });
  }

  private async transitionToUp(serviceId: string, now: Date, serviceName?: string) {
    const lastDowntime = await prisma.downtimeReport.findFirst({
      where: { serviceId, endedAt: null },
      orderBy: { startedAt: 'desc' },
    });

    let error = '';
    if (lastDowntime) {
      const duration = Math.floor(
        (now.getTime() - lastDowntime.startedAt.getTime()) / 1000,
      );
      error = lastDowntime.error ?? '';
      await prisma.downtimeReport.update({
        where: { id: lastDowntime.id },
        data: { endedAt: now, duration, resolved: true },
      });
    }

    await prisma.uptime.create({
      data: { serviceId, startedAt: now },
    });

    const svc = await prisma.service.update({
      where: { id: serviceId },
      data: { status: 'UP' },
    });

    const name = serviceName ?? svc.name;
    const dur = lastDowntime?.duration
      ? `${Math.floor(lastDowntime.duration / 60)}m ${lastDowntime.duration % 60}s`
      : '';

    this.sendAlert('resolved', name, dur, error).catch(console.error);
  }

  private async transitionToDown(
    serviceId: string,
    now: Date,
    statusCode: number | null,
    error: string | null,
    serviceName?: string,
  ) {
    const lastUptime = await prisma.uptime.findFirst({
      where: { serviceId, endedAt: null },
      orderBy: { startedAt: 'desc' },
    });

    if (lastUptime) {
      const duration = Math.floor(
        (now.getTime() - lastUptime.startedAt.getTime()) / 1000,
      );
      await prisma.uptime.update({
        where: { id: lastUptime.id },
        data: { endedAt: now, duration },
      });
    }

    await prisma.downtimeReport.create({
      data: { serviceId, startedAt: now, statusCode, error },
    });

    const svc = await prisma.service.update({
      where: { id: serviceId },
      data: { status: 'DOWN' },
    });

    const name = serviceName ?? svc.name;
    this.sendAlert('down', name, now.toLocaleString(), error ?? '').catch(console.error);
  }

  private async sendAlert(
    type: 'down' | 'resolved',
    serviceName: string,
    detail: string,
    errorMsg: string,
  ) {
    const subscribers = await prisma.emailSubscriber.findMany({
      where: { verified: true },
    });
    if (subscribers.length === 0) return;

    const fn = type === 'down' ? email.sendServiceDown : email.sendServiceResolved;

    await Promise.allSettled(
      subscribers.map((s) =>
        fn(s.email, serviceName, detail, errorMsg || 'No details'),
      ),
    );
  }
}
