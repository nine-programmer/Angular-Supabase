import type { Request, Response } from 'express';
import { RATE_LIMIT_ERROR, rateLimit } from './rate-limit';

function call(middleware: ReturnType<typeof rateLimit>, ip: string) {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  const next = vi.fn();
  middleware({ ip } as Request, res as unknown as Response, next);
  return { res, next };
}

describe('rateLimit', () => {
  it('lets `max` requests through, then answers 429 with the Thai message', () => {
    const limiter = rateLimit({ windowMs: 1000, max: 2, now: () => 0 });

    expect(call(limiter, '1.1.1.1').next).toHaveBeenCalled();
    expect(call(limiter, '1.1.1.1').next).toHaveBeenCalled();

    const third = call(limiter, '1.1.1.1');
    expect(third.next).not.toHaveBeenCalled();
    expect(third.res.status).toHaveBeenCalledWith(429);
    expect(third.res.json).toHaveBeenCalledWith({ error: RATE_LIMIT_ERROR });
  });

  it('counts each IP separately', () => {
    const limiter = rateLimit({ windowMs: 1000, max: 1, now: () => 0 });

    expect(call(limiter, '1.1.1.1').next).toHaveBeenCalled();
    expect(call(limiter, '2.2.2.2').next).toHaveBeenCalled();
    expect(call(limiter, '1.1.1.1').res.status).toHaveBeenCalledWith(429);
  });

  it('starts a fresh window once windowMs has passed', () => {
    let t = 0;
    const limiter = rateLimit({ windowMs: 1000, max: 1, now: () => t });

    expect(call(limiter, '1.1.1.1').next).toHaveBeenCalled();
    expect(call(limiter, '1.1.1.1').res.status).toHaveBeenCalledWith(429);

    t = 1000;
    expect(call(limiter, '1.1.1.1').next).toHaveBeenCalled();
  });
});
