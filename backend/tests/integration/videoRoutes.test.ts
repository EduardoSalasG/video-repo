import { describe, it, expect, afterAll, beforeEach, vi } from 'vitest';
import request from 'supertest';
import prisma from '../../src/config/database.ts';
import app from '../../src/app.ts';
import { generateToken } from '../../src/utils/token';

// Mock ffprobe-backed extraction (ffprobe is not installed on the Windows
// test runner and the test uploads synthetic bytes that no real probe could
// parse). The upload endpoint contract is still fully exercised.
vi.mock('../../src/utils/videoProcessor', () => ({
  extractVideoMetadata: vi.fn(),
  getFileSize: vi.fn(),
}));

import { extractVideoMetadata } from '../../src/utils/videoProcessor';

// Set JWT_SECRET if not set
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test-secret';
}

const jwtSecret = process.env.JWT_SECRET;

async function createUser(role: string) {
  return prisma.user.create({
    data: {
      email: `${role.toLowerCase()}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}@test.com`,
      username: `${role.toLowerCase()}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,
      firstName: role,
      lastName: 'User',
      passwordHash: 'hashed',
      role: role as 'ADMIN' | 'INSTRUCTOR' | 'STUDENT',
    },
  });
}

// Create a fresh user and return a valid auth header for them
async function createToken(role: string): Promise<string> {
  const user = await createUser(role);
  return `Bearer ${generateToken({ userId: user.id }, jwtSecret!, '1h')}`;
}

// Helper to create a module and section for testing
async function createModuleAndSection() {
  const course = await prisma.course.create({
    data: { name: 'Test Course' }
  });
  const module = await prisma.module.create({
    data: { title: 'Test Module', orderIndex: 0, courseId: course.id },
  });
  
  const section = await prisma.section.create({
    data: {
      title: 'Test Section',
      orderIndex: 0,
      moduleId: module.id,
    },
  });
  
  return { courseId: course.id, moduleId: module.id, sectionId: section.id };
}

describe('Video Routes', () => {
  let testModuleId: string;
  let testSectionId: string;

  beforeEach(async () => {
    // Clear video metadata, sections, and modules before each test
    // (children before parents to respect FK constraints, plus related tables)
    await prisma.userProgress.deleteMany();
    await prisma.videoMetadata.deleteMany();
    await prisma.section.deleteMany();
    await prisma.session.deleteMany();
    await prisma.module.deleteMany();
    await prisma.course.deleteMany();
    await prisma.user.deleteMany();

    // Create a test module and section to use for video operations
    const { courseId, moduleId, sectionId } = await createModuleAndSection();
    testModuleId = moduleId;
    testSectionId = sectionId;

    // Default ffprobe extraction result for upload tests
    vi.mocked(extractVideoMetadata).mockResolvedValue({
      duration: 120,
      size: 1024000,
      format: 'mp4',
      bitrate: 1000000,
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Authentication guard', () => {
    it('should return 401 for unauthenticated GET /courses/:courseId/modules/:moduleId/sections/:sectionId/video-metadata', async () => {
      await request(app)
        .get(`/courses/1/modules/${testModuleId}/sections/${testSectionId}/video-metadata`)
        .expect(401);
    });

    it('should return 401 for unauthenticated POST /courses/:courseId/modules/:moduleId/sections/:sectionId/video-metadata', async () => {
      await request(app)
        .post(`/courses/1/modules/${testModuleId}/sections/${testSectionId}/video-metadata`)
        .send({})
        .expect(401);
    });

    it('should return 401 for unauthenticated PATCH /courses/:courseId/modules/:moduleId/sections/:sectionId/video-metadata', async () => {
      await request(app)
        .patch(`/courses/1/modules/${testModuleId}/sections/${testSectionId}/video-metadata`)
        .send({})
        .expect(401);
    });

    it('should return 401 for unauthenticated DELETE /courses/:courseId/modules/:moduleId/sections/:sectionId/video-metadata', async () => {
      await request(app)
        .delete(`/courses/1/modules/${testModuleId}/sections/${testSectionId}/video-metadata`)
        .expect(401);
    });

    it('should return 401 for unauthenticated POST /courses/:courseId/modules/:moduleId/sections/:sectionId/upload-video', async () => {
      await request(app)
        .post(`/courses/1/modules/${testModuleId}/sections/${testSectionId}/upload-video`)
        .expect(401);
    });
  });

  describe('Role authorization', () => {
    it('should allow STUDENT to read video metadata', async () => {
      const studentToken = await createToken('STUDENT');
      // First create video metadata as instructor to test reading
      const instructorToken = await createToken('INSTRUCTOR');
      const videoMetadataRes = await request(app)
        .post(`/courses/1/modules/${testModuleId}/sections/${testSectionId}/video-metadata`)
        .set('Authorization', instructorToken)
        .send({
          sectionId: testSectionId,
          steps: [{ step: 'basic step', count: 4 }],
          difficulty: 'BEGINNER',
          primaryStyle: 'MAMBO_ON2',
          influences: ['afro-cuban'],
          durationCounts: 8,
          videoType: 'STEP_BREAKDOWN',
          tags: ['beginner', 'steps'],
          fileSize: 1024000,
          durationSeconds: 120,
          filename: 'video1.mp4',
        })
        .expect(201);
      const videoMetadataId = videoMetadataRes.body.id;

      // Now test that student can read
      const res = await request(app)
        .get(`/courses/1/modules/${testModuleId}/sections/${testSectionId}/video-metadata`)
        .set('Authorization', studentToken)
        .expect(200);

      expect(res.body.id).toBe(videoMetadataId);
    });

    it('should forbid STUDENT from creating video metadata', async () => {
      const studentToken = await createToken('STUDENT');
      const res = await request(app)
        .post(`/courses/1/modules/${testModuleId}/sections/${testSectionId}/video-metadata`)
        .set('Authorization', studentToken)
        .send({
          sectionId: testSectionId,
          steps: [{ step: 'basic step', count: 4 }],
          difficulty: 'BEGINNER',
          primaryStyle: 'MAMBO_ON2',
          influences: ['afro-cuban'],
          durationCounts: 8,
          videoType: 'STEP_BREAKDOWN',
          tags: ['beginner', 'steps'],
          fileSize: 1024000,
          durationSeconds: 120,
          filename: 'video1.mp4',
        })
        .expect(403);

      expect(res.body.error).toContain('Forbidden');
    });

    it('should forbid STUDENT from updating video metadata', async () => {
      // First create video metadata as instructor
      const instructorToken = await createToken('INSTRUCTOR');
      const videoMetadataRes = await request(app)
        .post(`/courses/1/modules/${testModuleId}/sections/${testSectionId}/video-metadata`)
        .set('Authorization', instructorToken)
        .send({
          sectionId: testSectionId,
          steps: [{ step: 'basic step', count: 4 }],
          difficulty: 'BEGINNER',
          primaryStyle: 'MAMBO_ON2',
          influences: ['afro-cuban'],
          durationCounts: 8,
          videoType: 'STEP_BREAKDOWN',
          tags: ['beginner', 'steps'],
          fileSize: 1024000,
          durationSeconds: 120,
          filename: 'video1.mp4',
        })
        .expect(201);
      const videoMetadataId = videoMetadataRes.body.id;

      const studentToken = await createToken('STUDENT');
      await request(app)
        .patch(`/courses/1/modules/${testModuleId}/sections/${testSectionId}/video-metadata`)
        .set('Authorization', studentToken)
        .send({ steps: [{ step: 'updated', count: 6 }] })
        .expect(403);
    });

    it('should forbid STUDENT from deleting video metadata', async () => {
      // First create video metadata as instructor
      const instructorToken = await createToken('INSTRUCTOR');
      const videoMetadataRes = await request(app)
        .post(`/courses/1/modules/${testModuleId}/sections/${testSectionId}/video-metadata`)
        .set('Authorization', instructorToken)
        .send({
          sectionId: testSectionId,
          steps: [{ step: 'basic step', count: 4 }],
          difficulty: 'BEGINNER',
          primaryStyle: 'MAMBO_ON2',
          influences: ['afro-cuban'],
          durationCounts: 8,
          videoType: 'STEP_BREAKDOWN',
          tags: ['beginner', 'steps'],
          fileSize: 1024000,
          durationSeconds: 120,
          filename: 'video1.mp4',
        })
        .expect(201);
      const videoMetadataId = videoMetadataRes.body.id;

      const studentToken = await createToken('STUDENT');
      await request(app)
        .delete(`/courses/1/modules/${testModuleId}/sections/${testSectionId}/video-metadata`)
        .set('Authorization', studentToken)
        .expect(403);
    });

    it('should forbid STUDENT from uploading video', async () => {
      const studentToken = await createToken('STUDENT');
      const res = await request(app)
        .post(`/courses/1/modules/${testModuleId}/sections/${testSectionId}/upload-video`)
        .set('Authorization', studentToken)
        .expect(403);

      expect(res.body.error).toContain('Forbidden');
    });

    it('should allow INSTRUCTOR and ADMIN to perform write operations', async () => {
      const instructorToken = await createToken('INSTRUCTOR');
      const adminToken = await createToken('ADMIN');

      // A section holds at most one VideoMetadata record, so clear the
      // section's record before each create.
      const createBody = {
        sectionId: testSectionId,
        steps: [{ step: 'basic step', count: 4 }],
        difficulty: 'BEGINNER' as const,
        primaryStyle: 'MAMBO_ON2' as const,
        influences: ['afro-cuban'],
        durationCounts: 8,
        videoType: 'STEP_BREAKDOWN' as const,
        tags: ['beginner', 'steps'],
        fileSize: 1024000,
        durationSeconds: 120,
        filename: 'video1.mp4',
      };

      // Test creation
      for (const token of [instructorToken, adminToken]) {
        await prisma.videoMetadata.deleteMany({ where: { sectionId: testSectionId } });
        const res = await request(app)
          .post(`/courses/1/modules/${testModuleId}/sections/${testSectionId}/video-metadata`)
          .set('Authorization', token)
          .send(createBody)
          .expect(201);
        expect(res.body).toHaveProperty('id');
      }

      // Test update (the record created above still exists)
      for (const token of [instructorToken, adminToken]) {
        const res = await request(app)
          .patch(`/courses/1/modules/${testModuleId}/sections/${testSectionId}/video-metadata`)
          .set('Authorization', token)
          .send({ steps: [{ step: 'updated', count: 6 }] })
          .expect(200);
        expect(res.body.steps).toEqual([{ step: 'updated', count: 6 }]);
      }

      // Test delete
      for (const token of [instructorToken, adminToken]) {
        await prisma.videoMetadata.deleteMany({ where: { sectionId: testSectionId } });
        await request(app)
          .post(`/courses/1/modules/${testModuleId}/sections/${testSectionId}/video-metadata`)
          .set('Authorization', instructorToken)
          .send({ ...createBody, filename: 'todelete.mp4', durationCounts: 4, fileSize: 512000, durationSeconds: 60 })
          .expect(201);
        await request(app)
          .delete(`/courses/1/modules/${testModuleId}/sections/${testSectionId}/video-metadata`)
          .set('Authorization', token)
          .expect(204);
      }
    });
  });

  describe('GET /courses/:courseId/modules/:moduleId/sections/:sectionId/video-metadata', () => {
    it('should return 404 when no video metadata exists for a section', async () => {
      const studentToken = await createToken('STUDENT');
      await request(app)
        .get(`/courses/1/modules/${testModuleId}/sections/${testSectionId}/video-metadata`)
        .set('Authorization', studentToken)
        .expect(404);
    });

    it('should return the video metadata for a section when found', async () => {
      const studentToken = await createToken('STUDENT');
      await prisma.videoMetadata.create({
        data: {
          sectionId: testSectionId,
          steps: [{ step: 'basic step', count: 4 }],
          difficulty: 'BEGINNER',
          primaryStyle: 'MAMBO_ON2',
          influences: ['afro-cuban'],
          durationCounts: 8,
          videoType: 'STEP_BREAKDOWN',
          tags: ['beginner', 'steps'],
          fileSize: 1024000,
          durationSeconds: 120,
          filename: 'video1.mp4',
        },
      });

      const res = await request(app)
        .get(`/courses/1/modules/${testModuleId}/sections/${testSectionId}/video-metadata`)
        .set('Authorization', studentToken)
        .expect(200);

      expect(res.body.sectionId).toBe(testSectionId);
      expect(res.body.filename).toBe('video1.mp4');
      expect(res.body.difficulty).toBe('BEGINNER');
    });

    it('should return 404 for video metadata belonging to another section', async () => {
      const studentToken = await createToken('STUDENT');
      // Create another section and video metadata in it
      const otherSection = await prisma.section.create({
        data: {
          title: 'Other Section',
          orderIndex: 1,
          moduleId: testModuleId,
        },
      });
      await prisma.videoMetadata.create({
        data: {
          sectionId: otherSection.id,
          steps: [{ step: 'other step', count: 1 }],
          difficulty: 'BEGINNER',
          primaryStyle: 'MAMBO_ON2',
          influences: [],
          durationCounts: 2,
          videoType: 'STEP_BREAKDOWN',
          tags: ['other'],
          fileSize: 256000,
          durationSeconds: 30,
          filename: 'other.mp4',
        },
      });

      await request(app)
        .get(`/courses/1/modules/${testModuleId}/sections/${testSectionId}/video-metadata`)
        .set('Authorization', studentToken)
        .expect(404);
    });
  });

  describe('POST /courses/:courseId/modules/:moduleId/sections/:sectionId/video-metadata', () => {
    it('should create video metadata as INSTRUCTOR', async () => {
      const instructorToken = await createToken('INSTRUCTOR');
      const res = await request(app)
        .post(`/courses/1/modules/${testModuleId}/sections/${testSectionId}/video-metadata`)
        .set('Authorization', instructorToken)
        .send({
          sectionId: testSectionId,
          steps: [{ step: 'basic step', count: 4 }],
          difficulty: 'BEGINNER',
          primaryStyle: 'MAMBO_ON2',
          influences: ['afro-cuban'],
          durationCounts: 8,
          videoType: 'STEP_BREAKDOWN',
          tags: ['beginner', 'steps'],
          fileSize: 1024000,
          durationSeconds: 120,
          filename: 'video1.mp4',
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.sectionId).toBe(testSectionId);
      expect(res.body.filename).toBe('video1.mp4');
      expect(res.body.difficulty).toBe('BEGINNER');
    });

    it('should create video metadata as ADMIN', async () => {
      const adminToken = await createToken('ADMIN');
      const res = await request(app)
        .post(`/courses/1/modules/${testModuleId}/sections/${testSectionId}/video-metadata`)
        .set('Authorization', adminToken)
        .send({
          sectionId: testSectionId,
          steps: [{ step: 'basic step', count: 4 }],
          difficulty: 'BEGINNER',
          primaryStyle: 'MAMBO_ON2',
          influences: ['afro-cuban'],
          durationCounts: 8,
          videoType: 'STEP_BREAKDOWN',
          tags: ['beginner', 'steps'],
          fileSize: 1024000,
          durationSeconds: 120,
          filename: 'video1.mp4',
        })
        .expect(201);

      expect(res.body.sectionId).toBe(testSectionId);
      expect(res.body.filename).toBe('video1.mp4');
    });

    it('should return 400 for invalid body', async () => {
      const instructorToken = await createToken('INSTRUCTOR');
      const res = await request(app)
        .post(`/courses/1/modules/${testModuleId}/sections/${testSectionId}/video-metadata`)
        .set('Authorization', instructorToken)
        .send({ sectionId: '' }) // Invalid: empty sectionId
        .expect(400);

      expect(res.body).toHaveProperty('error');
    });
  });

  describe('PATCH /courses/:courseId/modules/:moduleId/sections/:sectionId/video-metadata', () => {
    it('should update video metadata as INSTRUCTOR', async () => {
      const instructorToken = await createToken('INSTRUCTOR');
      const videoMetadata = await prisma.videoMetadata.create({
        data: {
          sectionId: testSectionId,
          steps: [{ step: 'original step', count: 2 }],
          difficulty: 'BEGINNER',
          primaryStyle: 'MAMBO_ON2',
          influences: ['afro-cuban'],
          durationCounts: 4,
          videoType: 'STEP_BREAKDOWN',
          tags: ['beginner'],
          fileSize: 512000,
          durationSeconds: 60,
          filename: 'original.mp4',
        },
      });

      const res = await request(app)
        .patch(`/courses/1/modules/${testModuleId}/sections/${testSectionId}/video-metadata`)
        .set('Authorization', instructorToken)
        .send({ steps: [{ step: 'updated step', count: 4 }], difficulty: 'INTERMEDIATE' })
        .expect(200);

      expect(res.body.steps).toEqual([{ step: 'updated step', count: 4 }]);
      expect(res.body.difficulty).toBe('INTERMEDIATE');
      expect(res.body.filename).toBe('original.mp4'); // unchanged
    });

    it('should return 404 when updating a non-existent video metadata', async () => {
      const instructorToken = await createToken('INSTRUCTOR');
      await request(app)
        .patch(`/courses/1/modules/${testModuleId}/sections/${testSectionId}/video-metadata`)
        .set('Authorization', instructorToken)
        .send({ steps: [{ step: 'updated', count: 6 }] })
        .expect(404);
    });

    it('should return 404 when updating video metadata from another section', async () => {
      const instructorToken = await createToken('INSTRUCTOR');
      // Create another section and video metadata in it
      const otherSection = await prisma.section.create({
        data: {
          title: 'Other Section',
          orderIndex: 1,
          moduleId: testModuleId,
        },
      });
      const otherVideoMetadata = await prisma.videoMetadata.create({
        data: {
          sectionId: otherSection.id,
          steps: [{ step: 'other step', count: 1 }],
          difficulty: 'BEGINNER',
          primaryStyle: 'MAMBO_ON2',
          influences: [],
          durationCounts: 2,
          videoType: 'STEP_BREAKDOWN',
          tags: ['other'],
          fileSize: 256000,
          durationSeconds: 30,
          filename: 'other.mp4',
        },
      });

      await request(app)
        .patch(`/courses/1/modules/${testModuleId}/sections/${testSectionId}/video-metadata`)
        .set('Authorization', instructorToken)
        .send({ steps: [{ step: 'hacked', count: 10 }] })
        .expect(404);
    });

    it('should return 400 for invalid body', async () => {
      const instructorToken = await createToken('INSTRUCTOR');
      const videoMetadata = await prisma.videoMetadata.create({
        data: {
          sectionId: testSectionId,
          steps: [{ step: 'basic step', count: 4 }],
          difficulty: 'BEGINNER',
          primaryStyle: 'MAMBO_ON2',
          influences: ['afro-cuban'],
          durationCounts: 8,
          videoType: 'STEP_BREAKDOWN',
          tags: ['beginner', 'steps'],
          fileSize: 1024000,
          durationSeconds: 120,
          filename: 'video1.mp4',
        },
      });

      const res = await request(app)
        .patch(`/courses/1/modules/${testModuleId}/sections/${testSectionId}/video-metadata`)
        .set('Authorization', instructorToken)
        .send({ difficulty: 'EXPERT' }) // Invalid difficulty
        .expect(400);

      expect(res.body).toHaveProperty('error');
    });
  });

  describe('DELETE /courses/:courseId/modules/:moduleId/sections/:sectionId/video-metadata', () => {
    it('should delete video metadata as INSTRUCTOR', async () => {
      const instructorToken = await createToken('INSTRUCTOR');
      const videoMetadata = await prisma.videoMetadata.create({
        data: {
          sectionId: testSectionId,
          steps: [{ step: 'to delete', count: 3 }],
          difficulty: 'BEGINNER',
          primaryStyle: 'MAMBO_ON2',
          influences: ['afro-cuban'],
          durationCounts: 6,
          videoType: 'STEP_BREAKDOWN',
          tags: ['beginner'],
          fileSize: 768000,
          durationSeconds: 90,
          filename: 'todelete.mp4',
        },
      });

      await request(app)
        .delete(`/courses/1/modules/${testModuleId}/sections/${testSectionId}/video-metadata`)
        .set('Authorization', instructorToken)
        .expect(204);

      const deleted = await prisma.videoMetadata.findUnique({ where: { id: videoMetadata.id } });
      expect(deleted).toBeNull();
    });

    it('should return 404 when deleting a non-existent video metadata', async () => {
      const instructorToken = await createToken('INSTRUCTOR');
      await request(app)
        .delete(`/courses/1/modules/${testModuleId}/sections/${testSectionId}/video-metadata`)
        .set('Authorization', instructorToken)
        .expect(404);
    });

    it('should return 404 when deleting video metadata from another section', async () => {
      const instructorToken = await createToken('INSTRUCTOR');
      // Create another section and video metadata in it
      const otherSection = await prisma.section.create({
        data: {
          title: 'Other Section',
          orderIndex: 1,
          moduleId: testModuleId,
        },
      });
      const otherVideoMetadata = await prisma.videoMetadata.create({
        data: {
          sectionId: otherSection.id,
          steps: [{ step: 'other step', count: 1 }],
          difficulty: 'BEGINNER',
          primaryStyle: 'MAMBO_ON2',
          influences: [],
          durationCounts: 2,
          videoType: 'STEP_BREAKDOWN',
          tags: ['other'],
          fileSize: 256000,
          durationSeconds: 30,
          filename: 'other.mp4',
        },
      });

      await request(app)
        .delete(`/courses/1/modules/${testModuleId}/sections/${testSectionId}/video-metadata`)
        .set('Authorization', instructorToken)
        .expect(404);
    });
  });

  describe('POST /courses/:courseId/modules/:moduleId/sections/:sectionId/upload-video', () => {
    it('should upload video as INSTRUCTOR', async () => {
      const instructorToken = await createToken('INSTRUCTOR');
      const res = await request(app)
        .post(`/courses/1/modules/${testModuleId}/sections/${testSectionId}/upload-video`)
        .set('Authorization', instructorToken)
        .attach('video', Buffer.from('fake video content'), 'test-video.mp4')
        .expect(201);

      expect(res.body).toHaveProperty('videoMetadata');
      expect(res.body.videoMetadata).toHaveProperty('id');
      expect(res.body.message).toBe('Video uploaded successfully');
    });

    it('should upload video as ADMIN', async () => {
      const adminToken = await createToken('ADMIN');
      const res = await request(app)
        .post(`/courses/1/modules/${testModuleId}/sections/${testSectionId}/upload-video`)
        .set('Authorization', adminToken)
        .attach('video', Buffer.from('fake video content'), 'test-video.mp4')
        .expect(201);

      expect(res.body.videoMetadata).toHaveProperty('id');
    });

    it('should return 400 if no file is uploaded', async () => {
      const instructorToken = await createToken('INSTRUCTOR');
      const res = await request(app)
        .post(`/courses/1/modules/${testModuleId}/sections/${testSectionId}/upload-video`)
        .set('Authorization', instructorToken)
        .expect(400);

      expect(res.body.error).toBe('No video file uploaded');
    });

    it('should return 400 if sectionId param is missing', async () => {
      const instructorToken = await createToken('INSTRUCTOR');
      // The route requires sectionId in the path; a request without it does
      // not match any route and is rejected as not found.
      await request(app)
        .post(`/courses/1/modules/${testModuleId}/sections/upload-video`)
        .set('Authorization', instructorToken)
        .expect(404);
    });

    it('should return 500 if video metadata extraction fails', async () => {
      const instructorToken = await createToken('INSTRUCTOR');
      vi.mocked(extractVideoMetadata).mockRejectedValue(
        new Error('Failed to extract video metadata: Cannot find ffprobe')
      );

      await request(app)
        .post(`/courses/1/modules/${testModuleId}/sections/${testSectionId}/upload-video`)
        .set('Authorization', instructorToken)
        .attach('video', Buffer.from('fake video content'), 'test-video.mp4')
        .expect(500);
    });
  });
});