import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';
import { PrismaService } from '../src/prisma/prisma.service';

const ids = {
  parent: '20000000-0000-4000-8000-000000000001',
  child: '20000000-0000-4000-8000-000000000002',
  otherChild: '20000000-0000-4000-8000-000000000003',
  ownTask: '30000000-0000-4000-8000-000000000001',
  otherTask: '30000000-0000-4000-8000-000000000002',
} as const;

const credentials = {
  parent: { email: 'parent@e2e.test', password: 'ParentTest123!' },
  child: { email: 'child@e2e.test', password: 'ChildTest123!' },
  otherChild: { email: 'other-child@e2e.test', password: 'ChildTest123!' },
} as const;

describe('API authorization (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let parentToken: string;
  let childToken: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app, app.get(ConfigService));
    await app.init();
    prisma = app.get(PrismaService);

    await cleanupFixtures();
    const [parentHash, childHash] = await Promise.all([
      bcrypt.hash(credentials.parent.password, 4),
      bcrypt.hash(credentials.child.password, 4),
    ]);

    await prisma.user.createMany({
      data: [
        {
          id: ids.parent,
          name: 'E2E Parent',
          email: credentials.parent.email,
          passwordHash: parentHash,
          role: Role.PARENT,
        },
        {
          id: ids.child,
          name: 'E2E Child',
          email: credentials.child.email,
          passwordHash: childHash,
          role: Role.CHILD,
        },
        {
          id: ids.otherChild,
          name: 'Other E2E Child',
          email: credentials.otherChild.email,
          passwordHash: childHash,
          role: Role.CHILD,
        },
      ],
    });
    await prisma.task.createMany({
      data: [
        {
          id: ids.ownTask,
          title: '[e2e] Own task',
          assignedToId: ids.child,
          createdById: ids.parent,
        },
        {
          id: ids.otherTask,
          title: '[e2e] Other task',
          assignedToId: ids.otherChild,
          createdById: ids.parent,
        },
      ],
    });

    parentToken = await login(
      credentials.parent.email,
      credentials.parent.password,
    );
    childToken = await login(
      credentials.child.email,
      credentials.child.password,
    );
  });

  afterAll(async () => {
    if (prisma) {
      await cleanupFixtures();
    }
    if (app) {
      await app.close();
    }
  });

  it('authenticates demo roles without exposing password hashes', async () => {
    await request(app.getHttpServer()).get('/health').expect(200, {
      status: 'ok',
    });

    const response = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${parentToken}`)
      .expect(200);

    expect(response.body).toMatchObject({
      id: ids.parent,
      email: credentials.parent.email,
      role: Role.PARENT,
    });
    expect(JSON.stringify(response.body)).not.toContain('passwordHash');
    await request(app.getHttpServer()).get('/api/auth/me').expect(401);
  });

  it('allows only parents to manage users and keeps roles immutable', async () => {
    await request(app.getHttpServer())
      .get('/api/users')
      .set('Authorization', `Bearer ${childToken}`)
      .expect(403);

    const created = await request(app.getHttpServer())
      .post('/api/users')
      .set('Authorization', `Bearer ${parentToken}`)
      .send({
        name: 'Managed E2E Child',
        email: 'managed@e2e.test',
        password: 'ManagedTest123!',
        role: Role.CHILD,
      })
      .expect(201);

    expect(JSON.stringify(created.body)).not.toContain('passwordHash');

    await request(app.getHttpServer())
      .post('/api/users')
      .set('Authorization', `Bearer ${parentToken}`)
      .send({
        name: 'Duplicate E2E Child',
        email: 'managed@e2e.test',
        password: 'ManagedTest123!',
        role: Role.CHILD,
      })
      .expect(409);

    await request(app.getHttpServer())
      .patch(`/api/users/${created.body.id}`)
      .set('Authorization', `Bearer ${parentToken}`)
      .send({ role: Role.PARENT })
      .expect(400);

    await request(app.getHttpServer())
      .patch(`/api/users/${created.body.id}`)
      .set('Authorization', `Bearer ${parentToken}`)
      .send({ name: 'Updated E2E Child' })
      .expect(200)
      .expect(({ body }) => {
        expect(body.name).toBe('Updated E2E Child');
        expect(body.role).toBe(Role.CHILD);
      });

    await request(app.getHttpServer())
      .delete(`/api/users/${ids.parent}`)
      .set('Authorization', `Bearer ${parentToken}`)
      .expect(409);
    await request(app.getHttpServer())
      .delete(`/api/users/${ids.child}`)
      .set('Authorization', `Bearer ${parentToken}`)
      .expect(409);
    await request(app.getHttpServer())
      .delete(`/api/users/${created.body.id}`)
      .set('Authorization', `Bearer ${parentToken}`)
      .expect(204);
  });

  it('lets a parent create, update, and delete child-assigned tasks', async () => {
    await request(app.getHttpServer())
      .post('/api/tasks')
      .set('Authorization', `Bearer ${parentToken}`)
      .send({
        title: '[e2e] Invalid assignee',
        assignedToId: ids.parent,
      })
      .expect(400);

    const created = await request(app.getHttpServer())
      .post('/api/tasks')
      .set('Authorization', `Bearer ${parentToken}`)
      .send({
        title: '[e2e] Parent managed task',
        description: 'Initial description',
        assignedToId: ids.child,
      })
      .expect(201);

    expect(JSON.stringify(created.body)).not.toContain('passwordHash');

    await request(app.getHttpServer())
      .patch(`/api/tasks/${created.body.id}`)
      .set('Authorization', `Bearer ${parentToken}`)
      .send({
        title: '[e2e] Updated task',
        description: null,
        assignedToId: ids.otherChild,
      })
      .expect(200)
      .expect(({ body }) => {
        expect(body.title).toBe('[e2e] Updated task');
        expect(body.description).toBeNull();
        expect(body.assignedToId).toBe(ids.otherChild);
      });

    await request(app.getHttpServer())
      .delete(`/api/tasks/${created.body.id}`)
      .set('Authorization', `Bearer ${parentToken}`)
      .expect(204);
  });

  it('returns only tasks assigned to the authenticated child', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/tasks')
      .set('Authorization', `Bearer ${childToken}`)
      .expect(200);

    expect(response.body.map((task: { id: string }) => task.id)).toEqual([
      ids.ownTask,
    ]);
    await request(app.getHttpServer())
      .get(`/api/tasks/${ids.otherTask}`)
      .set('Authorization', `Bearer ${childToken}`)
      .expect(404);
  });

  it('rejects child task creation, editing, and deletion', async () => {
    await request(app.getHttpServer())
      .post('/api/tasks')
      .set('Authorization', `Bearer ${childToken}`)
      .send({ title: '[e2e] Forbidden', assignedToId: ids.child })
      .expect(403);
    await request(app.getHttpServer())
      .patch(`/api/tasks/${ids.ownTask}`)
      .set('Authorization', `Bearer ${childToken}`)
      .send({ title: '[e2e] Forbidden edit' })
      .expect(403);
    await request(app.getHttpServer())
      .delete(`/api/tasks/${ids.ownTask}`)
      .set('Authorization', `Bearer ${childToken}`)
      .expect(403);
  });

  it('lets a child complete their task but not another child task', async () => {
    const completed = await request(app.getHttpServer())
      .patch(`/api/tasks/${ids.ownTask}/completion`)
      .set('Authorization', `Bearer ${childToken}`)
      .send({ completed: true })
      .expect(200);

    expect(completed.body.completedAt).not.toBeNull();

    await request(app.getHttpServer())
      .patch(`/api/tasks/${ids.otherTask}/completion`)
      .set('Authorization', `Bearer ${childToken}`)
      .send({ completed: true })
      .expect(404);

    await request(app.getHttpServer())
      .patch(`/api/tasks/${ids.ownTask}/completion`)
      .set('Authorization', `Bearer ${childToken}`)
      .send({ completed: false })
      .expect(200)
      .expect(({ body }) => {
        expect(body.completedAt).toBeNull();
      });
  });

  async function login(email: string, password: string): Promise<string> {
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email, password })
      .expect(200);

    return response.body.accessToken as string;
  }

  async function cleanupFixtures(): Promise<void> {
    await prisma.task.deleteMany({
      where: {
        OR: [
          { createdById: ids.parent },
          { assignedToId: { in: [ids.child, ids.otherChild] } },
          { title: { startsWith: '[e2e]' } },
        ],
      },
    });
    await prisma.user.deleteMany({
      where: {
        OR: [
          { id: { in: [ids.parent, ids.child, ids.otherChild] } },
          { email: { endsWith: '@e2e.test' } },
        ],
      },
    });
  }
});
