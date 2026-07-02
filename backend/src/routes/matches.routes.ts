import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';
import { listMatches, getMatch, confirmMatch } from '../controllers/matches.controller';
import { setLineup, submitResults } from '../controllers/lineup.controller';
import { propose, accept, reject, getProposals } from '../controllers/match-proposals.controller';
import { getMessages, sendMessage } from '../controllers/chat.controller';
import { raiseDispute, getMatchDispute } from '../controllers/disputes.controller';
import { castVote, getVotes, checkVoted } from '../controllers/mvp.controller';
import { UserRole } from '../models';

const router = Router();
router.use(authenticateToken);

router.get('/', listMatches);
router.get('/:id', getMatch);
router.post('/:id/confirm', requireRole(UserRole.CAPTAIN, UserRole.ADMIN), confirmMatch);
router.post('/:id/lineup', setLineup);
router.post('/:id/results', submitResults);

// Proposals
router.get('/:id/proposals', getProposals);
router.post('/:id/proposals', requireRole(UserRole.CAPTAIN), propose);
router.post('/:id/proposals/:proposalId/accept', requireRole(UserRole.CAPTAIN), accept);
router.post('/:id/proposals/:proposalId/reject', requireRole(UserRole.CAPTAIN), reject);

// Chat
router.get('/:id/messages', getMessages);
router.post('/:id/messages', sendMessage);

// Disputes
router.get('/:id/dispute', getMatchDispute);
router.post('/:id/dispute', requireRole(UserRole.CAPTAIN), raiseDispute);

// MVP
router.get('/:id/mvp', getVotes);
router.get('/:id/mvp/voted', checkVoted);
router.post('/:id/mvp', requireRole(UserRole.CAPTAIN), castVote);

export default router;
