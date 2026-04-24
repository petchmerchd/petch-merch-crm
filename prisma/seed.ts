import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();

async function main() {
  const pwd = await bcrypt.hash('petch2024', 10);
  const user = await db.user.upsert({
    where: { email: 'admin@petchmerch.fr' },
    update: {},
    create: { email: 'admin@petchmerch.fr', password: pwd, name: 'Petch Merch' },
  });

  await db.counter.createMany({
    data: [{ key: 'QUOTE', value: 5 }, { key: 'ORDER', value: 4 }, { key: 'INVOICE', value: 7 }],
    skipDuplicates: true,
  });

  const clients = await Promise.all([
    db.client.create({ data: { name: 'Jordan Moreau',  company: 'JM Events',      email: 'jordan@jmevents.fr',    phone: '06 12 34 56 78' } }),
    db.client.create({ data: { name: 'Léa Fontaine',   company: 'Fontaine Sport', email: 'lea@fontainesport.com', phone: '06 98 76 54 32' } }),
    db.client.create({ data: { name: 'Karim Benali',   company: 'KB Fitness',     email: 'karim@kbfitness.fr',    phone: '07 11 22 33 44' } }),
    db.client.create({ data: { name: 'Sophie Martin',  company: 'Café Martin',    email: 'sophie@cafemartin.fr',  phone: '06 55 44 33 22' } }),
  ]);

  await db.lead.createMany({
    data: [
      { name: 'Alex Petit',   company: 'Petit FC',    email: 'alex@petitfc.fr',  source: 'INSTAGRAM', status: 'NEW',      notes: 'Maillots foot × 20' },
      { name: 'Nadia Roux',   company: 'Studio Roux', email: 'nadia@roux.fr',    source: 'REFERRAL',  status: 'QUALIFIED', estimatedBudget: 80000 },
      { name: 'Marc Bernard', company: 'Bernard BTP', email: 'marc@btp.fr',      source: 'PHONE',     status: 'PROPOSAL',  notes: 'Vêtements brodés × 50', estimatedBudget: 150000 },
    ],
  });

  const q1 = await db.quote.create({
    data: {
      number: 'DEV-0006', clientId: clients[0]!.id, createdById: user.id,
      status: 'CONVERTED', title: 'Maillots JM Events Été 2025',
      validUntil: new Date('2025-06-30'), depositPct: 30,
      subtotalCents: 89000, taxCents: 17800, totalCents: 106800,
      approvedAt: new Date('2025-01-15'),
      items: {
        create: [
          { position: 0, description: 'Maillot sublimation full-print (×20)', quantity: 20, unit: 'unité', unitPriceCents: 2800, vatRate: 20, totalCents: 56000 },
          { position: 1, description: 'Short assorti (×20)', quantity: 20, unit: 'unité', unitPriceCents: 1500, vatRate: 20, totalCents: 30000 },
          { position: 2, description: 'Flocage numéros + noms', quantity: 20, unit: 'unité', unitPriceCents: 150, vatRate: 20, totalCents: 3000 },
        ],
      },
    },
  });

  const o1 = await db.order.create({
    data: {
      number: 'CMD-0005', clientId: clients[0]!.id, quoteId: q1.id,
      status: 'IN_PRODUCTION', priority: 'HIGH',
      title: 'Maillots JM Events Été 2025',
      totalCents: 106800, depositCents: 32040,
      depositPaidAt: new Date('2025-01-18'),
      deliveryDate: new Date('2025-02-15'), deliveryMethod: 'PICKUP',
      productionSteps: {
        create: [
          { position: 0, name: 'Validation fichiers',    status: 'DONE',        doneAt: new Date('2025-01-22') },
          { position: 1, name: 'Sublimation maillots',   status: 'IN_PROGRESS', technique: 'SUBLIMATION' },
          { position: 2, name: 'Flocage numéros',        status: 'TODO',        technique: 'FLOCAGE' },
          { position: 3, name: 'Contrôle qualité',       status: 'TODO' },
        ],
      },
    },
  });

  await db.invoice.create({
    data: {
      number: 'FAC-0008', clientId: clients[0]!.id, orderId: o1.id,
      type: 'DEPOSIT', status: 'PAID',
      issuedAt: new Date('2025-01-18'), dueAt: new Date('2025-01-25'),
      subtotalCents: 32040, taxCents: 0, totalCents: 32040, paidCents: 32040,
      payments: { create: [{ amountCents: 32040, method: 'BANK_TRANSFER', reference: 'VIR-001', paidAt: new Date('2025-01-19') }] },
    },
  });

  const o2 = await db.order.create({
    data: {
      number: 'CMD-0004', clientId: clients[3]!.id,
      status: 'READY', priority: 'NORMAL',
      title: 'Tabliers Café Martin',
      totalCents: 28800, depositCents: 8640,
      depositPaidAt: new Date('2025-01-05'),
      deliveryMethod: 'PICKUP',
      productionSteps: {
        create: [
          { position: 0, name: 'Sérigraphie logo',  status: 'DONE', doneAt: new Date('2025-01-20'), technique: 'SERIGRAPHIE' },
          { position: 1, name: 'Contrôle qualité',  status: 'DONE', doneAt: new Date('2025-01-22') },
        ],
      },
    },
  });

  await db.invoice.create({
    data: {
      number: 'FAC-0009', clientId: clients[3]!.id, orderId: o2.id,
      type: 'FINAL', status: 'ISSUED',
      issuedAt: new Date('2025-01-23'), dueAt: new Date('2025-02-05'),
      subtotalCents: 24000, taxCents: 4800, totalCents: 28800, paidCents: 0,
    },
  });

  await db.quote.create({
    data: {
      number: 'DEV-0007', clientId: clients[1]!.id, createdById: user.id,
      status: 'SENT', title: 'Polos brodés Fontaine Sport',
      validUntil: new Date('2025-03-15'), depositPct: 50,
      sentAt: new Date('2025-01-20'),
      subtotalCents: 43500, taxCents: 8700, totalCents: 52200,
      items: {
        create: [
          { position: 0, description: 'Polo brodé logo (×15)', quantity: 15, unit: 'unité', unitPriceCents: 1800, vatRate: 20, totalCents: 27000 },
          { position: 1, description: 'Sweat capuche brodé (×10)', quantity: 10, unit: 'unité', unitPriceCents: 1650, vatRate: 20, totalCents: 16500 },
        ],
      },
    },
  });

  await db.task.createMany({
    data: [
      { title: 'Envoyer BAT maillots JM Events',   priority: 'URGENT', dueAt: new Date('2025-01-28'), orderId: o1.id, assigneeId: user.id, status: 'TODO' },
      { title: 'Relancer Léa Fontaine DEV-0007',   priority: 'HIGH',   dueAt: new Date('2025-01-30'), assigneeId: user.id, status: 'TODO' },
      { title: 'Commander stock t-shirts L/XL',    priority: 'HIGH',   dueAt: new Date('2025-02-01'), assigneeId: user.id, status: 'TODO' },
      { title: 'Relance facture FAC-0009',         priority: 'HIGH',   dueAt: new Date('2025-02-06'), assigneeId: user.id, status: 'TODO' },
      { title: 'Mise à jour catalogue prix 2025',  priority: 'LOW',    assigneeId: user.id, status: 'TODO' },
    ],
  });

  console.log('✅ Seed terminé !');
  console.log('📧 admin@petchmerch.fr');
  console.log('🔑 petch2024');
}

main().catch(console.error).finally(() => db.$disconnect());
