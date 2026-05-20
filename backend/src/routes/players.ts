import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/db';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/players/:username
router.get('/:username', async (req: Request, res: Response) => {
  try {
    const profile = await prisma.playerProfile.findUnique({
      where: { username: req.params.username },
      include: {
        user: { select: { name: true, email: true, fideId: true } },
        ratingHistory: { orderBy: { date: 'asc' } },
      },
    });
    if (!profile) return res.status(404).json({ error: 'Player not found' });
    res.json(profile);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/players/rating-entry (authenticated player)
router.post('/rating-entry', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      rating: z.number().min(100).max(3000),
      date: z.string(),
      tournamentName: z.string().optional(),
      delta: z.number().optional(),
      result: z.string().optional(),
    });
    const data = schema.parse(req.body);

    const profile = await prisma.playerProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    const entry = await prisma.ratingEntry.create({
      data: { ...data, date: new Date(data.date), profileId: profile.id },
    });

    // Update current rating
    await prisma.playerProfile.update({
      where: { id: profile.id },
      data: {
        currentRating: data.rating,
        peakRating: Math.max(profile.peakRating, data.rating),
        totalTournaments: { increment: 1 },
      },
    });

    res.status(201).json(entry);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
