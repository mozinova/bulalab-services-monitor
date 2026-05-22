import { prisma } from './lib/prisma';

const args = process.argv.slice(2);
const command = args[0];

async function main() {
  switch (command) {
    case 'add':
      await add();
      break;
    case 'report':
      await report();
      break;
    case 'remove':
      await remove();
      break;
    default:
      console.error('Usage:');
      console.error('  bun src/cli.ts add --data <path>');
      console.error('  bun src/cli.ts report --service <id|url> --error "<msg>" [--status <code>]');
      console.error('  bun src/cli.ts remove --service <id|url>');
      process.exit(1);
  }

  await prisma.$disconnect();
}

async function add() {
  const dataIdx = args.indexOf('--data');
  if (dataIdx === -1) {
    console.error('Missing --data <path>');
    process.exit(1);
  }

  const filePath = args[dataIdx + 1];
  if (!filePath) {
    console.error('Missing file path after --data');
    process.exit(1);
  }

  const file = Bun.file(filePath);
  const content = await file.json();
  const services = Array.isArray(content) ? content : [content];

  const data = services.map((svc: any) => ({
    name: svc.name,
    url: svc.url ?? svc.source,
    source: svc.source ?? svc.url,
    protocol: svc.protocol ?? 'HTTP',
    description: svc.description,
    interval: svc.interval ?? 60,
  }));

  if (data.length === 1) {
    const created = await prisma.service.create({ data: data[0] });
    console.log(`Created service: ${created.name} (${created.id})`);
  } else {
    await prisma.service.createMany({ data });
    console.log(`Created ${data.length} services`);
  }
}

async function findService(ref: string) {
  return prisma.service.findFirst({
    where: { OR: [{ id: ref }, { url: ref }, { source: ref }] },
  });
}

async function report() {
  const serviceIdx = args.indexOf('--service');
  const errorIdx = args.indexOf('--error');
  const statusIdx = args.indexOf('--status');

  if (serviceIdx === -1) {
    console.error('Missing --service <id|url>');
    process.exit(1);
  }

  if (errorIdx === -1) {
    console.error('Missing --error "<message>"');
    process.exit(1);
  }

  const serviceRef = args[serviceIdx + 1];
  const errorMsg = args[errorIdx + 1];
  const statusCode = statusIdx !== -1 ? parseInt(args[statusIdx + 1], 10) : null;

  if (!serviceRef) {
    console.error('Missing service reference after --service');
    process.exit(1);
  }

  const service = await findService(serviceRef);
  if (!service) {
    console.error(`Service not found: ${serviceRef}`);
    process.exit(1);
  }

  await prisma.downtimeReport.create({
    data: {
      serviceId: service.id,
      startedAt: new Date(),
      statusCode,
      error: errorMsg,
    },
  });

  if (service.status !== 'DOWN') {
    await prisma.service.update({
      where: { id: service.id },
      data: { status: 'DOWN' },
    });
  }

  console.log(`Report created for service: ${service.name} (${service.id})`);
}

async function remove() {
  const serviceIdx = args.indexOf('--service');

  if (serviceIdx === -1) {
    console.error('Missing --service <id|url>');
    process.exit(1);
  }

  const serviceRef = args[serviceIdx + 1];
  if (!serviceRef) {
    console.error('Missing service reference after --service');
    process.exit(1);
  }

  const service = await findService(serviceRef);
  if (!service) {
    console.error(`Service not found: ${serviceRef}`);
    process.exit(1);
  }

  await prisma.service.delete({ where: { id: service.id } });
  console.log(`Removed service: ${service.name} (${service.id})`);
}

main().catch((err) => {
  console.error(err);
  prisma.$disconnect();
  process.exit(1);
});
