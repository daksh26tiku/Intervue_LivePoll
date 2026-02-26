import { Router, Request, Response } from 'express';
import { pollService } from '../services/PollService';

const router = Router();

// GET /api/polls/history
router.get('/polls/history', async (_req: Request, res: Response) => {
    try {
        const history = await pollService.getPollHistory();
        res.json({ success: true, data: history });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch poll history' });
    }
});

// GET /api/health
router.get('/health', (_req: Request, res: Response) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

export default router;
