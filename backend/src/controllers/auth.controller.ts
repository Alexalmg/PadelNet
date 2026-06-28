import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import * as authService from '../services/auth.service';

export async function registerHandler(req: Request, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const { email, password, firstName, lastName } = req.body;
    const user = await authService.register(email, password, firstName, lastName);
    const { password: _, ...safeUser } = user.toJSON() as unknown as Record<string, unknown>;
    res.status(201).json({ message: 'User registered successfully', user: safeUser });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Registration failed';
    res.status(400).json({ error: message });
  }
}

export async function loginHandler(req: Request, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const { email, password } = req.body;
    const { user, tokens } = await authService.login(email, password);
    const { password: _, ...safeUser } = user.toJSON() as unknown as Record<string, unknown>;
    res.json({ message: 'Login successful', user: safeUser, tokens });
  } catch {
    res.status(401).json({ error: 'Invalid credentials' });
  }
}

export async function refreshHandler(req: Request, res: Response): Promise<void> {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    res.status(400).json({ error: 'Refresh token required' });
    return;
  }

  try {
    const { tokens } = await authService.refresh(refreshToken);
    res.json({ tokens });
  } catch {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
}

export async function profileHandler(req: Request, res: Response): Promise<void> {
  const user = req.user!;
  const { password: _, ...safeUser } = user.toJSON() as unknown as Record<string, unknown>;
  res.json({ user: safeUser });
}
