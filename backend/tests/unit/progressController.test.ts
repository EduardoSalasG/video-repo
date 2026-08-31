import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  completeProgressController,
  createProgressController,
  getProgress,
  getProgressBySection,
  updateProgressController,
} from '../../src/controllers/progressController';
import {
  findAllUserProgress,
  getUserProgressBySection,
  upsertUserProgress,
} from '../../src/models/userProgress';

vi.mock('../../src/models/userProgress', () => ({
  findAllUserProgress: vi.fn(),
  getUserProgressBySection: vi.fn(),
  upsertUserProgress: vi.fn(),
  getProgressById: vi.fn(),
  deleteProgressById: vi.fn(),
}));

describe('progressController', () => {
  let mockReq: any;
  let mockRes: any;

  const progress = {
    id: 'progress-1',
    userId: 'user-1',
    sectionId: 'section-1',
    completedAt: null,
    lastPositionSeconds: 42,
    updatedAt: new Date(),
  };

  beforeEach(() => {
    mockReq = {
      body: {},
      params: {},
      query: {},
      user: { id: 'user-1' },
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    };
    vi.clearAllMocks();
  });

  it('lists paginated progress for the authenticated user', async () => {
    const result = {
      progress: [progress],
      pagination: { page: 1, limit: 10, total: 1, pages: 1 },
    };
    vi.mocked(findAllUserProgress).mockResolvedValue(result);
    mockReq.query = { page: '1', limit: '10' };

    await getProgress(mockReq, mockRes);

    expect(findAllUserProgress).toHaveBeenCalledWith('user-1', { page: 1, limit: 10 });
    expect(mockRes.json).toHaveBeenCalledWith(result);
  });

  it('returns a section progress record only for the authenticated user', async () => {
    vi.mocked(getUserProgressBySection).mockResolvedValue(progress as any);
    mockReq.params = { sectionId: 'section-1' };

    await getProgressBySection(mockReq, mockRes);

    expect(getUserProgressBySection).toHaveBeenCalledWith('user-1', 'section-1');
    expect(mockRes.json).toHaveBeenCalledWith(progress);
  });

  it('creates progress with the section id from the route', async () => {
    vi.mocked(upsertUserProgress).mockResolvedValue(progress as any);
    mockReq.params = { sectionId: 'section-1' };
    mockReq.body = { lastPositionSeconds: 42 };

    await createProgressController(mockReq, mockRes);

    expect(upsertUserProgress).toHaveBeenCalledWith('user-1', 'section-1', {
      completedAt: undefined,
      lastPositionSeconds: 42,
    });
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith(progress);
  });

  it('updates progress and reports a missing active section as 404', async () => {
    vi.mocked(upsertUserProgress).mockRejectedValue(new Error('Section not found or is deleted'));
    mockReq.params = { sectionId: 'section-1' };
    mockReq.body = { lastPositionSeconds: 42 };

    await updateProgressController(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Section not found' });
  });

  it('completes progress with a timestamp when the request omits one', async () => {
    const completed = { ...progress, completedAt: new Date() };
    vi.mocked(upsertUserProgress).mockResolvedValue(completed as any);
    mockReq.params = { sectionId: 'section-1' };

    await completeProgressController(mockReq, mockRes);

    expect(upsertUserProgress).toHaveBeenCalledWith(
      'user-1',
      'section-1',
      expect.objectContaining({ completedAt: expect.any(Date), lastPositionSeconds: null })
    );
    expect(mockRes.json).toHaveBeenCalledWith(completed);
  });

  it('rejects unauthenticated progress reads', async () => {
    mockReq.user = undefined;

    await getProgress(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
  });
});
