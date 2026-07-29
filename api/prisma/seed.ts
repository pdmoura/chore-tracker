import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const demoUsers = {
  parent: {
    id: '00000000-0000-4000-8000-000000000001',
    name: 'Demo Parent',
    email: 'parent@example.com',
    password: 'Parent123!',
    role: Role.PARENT,
  },
  child: {
    id: '00000000-0000-4000-8000-000000000002',
    name: 'Demo Child',
    email: 'child@example.com',
    password: 'Child123!',
    role: Role.CHILD,
  },
  secondChild: {
    id: '00000000-0000-4000-8000-000000000003',
    name: 'Second Child',
    email: 'child2@example.com',
    password: 'Child123!',
    role: Role.CHILD,
  },
} as const;

async function upsertUser(user: (typeof demoUsers)[keyof typeof demoUsers]) {
  const passwordHash = await bcrypt.hash(user.password, 12);

  return prisma.user.upsert({
    where: { email: user.email },
    update: {
      name: user.name,
      passwordHash,
      role: user.role,
    },
    create: {
      id: user.id,
      name: user.name,
      email: user.email,
      passwordHash,
      role: user.role,
    },
  });
}

async function main() {
  const parent = await upsertUser(demoUsers.parent);
  const child = await upsertUser(demoUsers.child);
  const secondChild = await upsertUser(demoUsers.secondChild);

  await prisma.task.upsert({
    where: { id: '10000000-0000-4000-8000-000000000001' },
    update: {
      title: 'Tidy your room',
      description: 'Put away clothes and toys.',
      assignedToId: child.id,
      createdById: parent.id,
      completedAt: null,
    },
    create: {
      id: '10000000-0000-4000-8000-000000000001',
      title: 'Tidy your room',
      description: 'Put away clothes and toys.',
      assignedToId: child.id,
      createdById: parent.id,
    },
  });

  await prisma.task.upsert({
    where: { id: '10000000-0000-4000-8000-000000000002' },
    update: {
      title: 'Take out recycling',
      description: null,
      assignedToId: secondChild.id,
      createdById: parent.id,
      completedAt: null,
    },
    create: {
      id: '10000000-0000-4000-8000-000000000002',
      title: 'Take out recycling',
      assignedToId: secondChild.id,
      createdById: parent.id,
    },
  });

  console.log('Seeded demo users and tasks.');
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
