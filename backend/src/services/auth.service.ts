import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '../models';
import { jwtConfig } from '../config/jwt';

function generateTokens(userId: number, role: UserRole) {
  const accessToken = jwt.sign({ userId, role }, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn } as jwt.SignOptions);
  const refreshToken = jwt.sign({ userId, role }, jwtConfig.refreshSecret, { expiresIn: jwtConfig.refreshExpiresIn } as jwt.SignOptions);
  return { accessToken, refreshToken };
}

export async function register(email: string, password: string, firstName: string, lastName: string) {
  const existing = await User.findOne({ where: { email } });
  if (existing) throw new Error('Email already in use');

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ email, password: hashed, firstName, lastName });
  return user;
}

export async function login(email: string, password: string) {
  const user = await User.findOne({ where: { email } });
  if (!user || !user.isActive) throw new Error('Invalid credentials');

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error('Invalid credentials');

  const tokens = generateTokens(user.id, user.role);
  return { user, tokens };
}

export async function refresh(refreshToken: string) {
  const decoded = jwt.verify(refreshToken, jwtConfig.refreshSecret) as { userId: number; role: UserRole };
  const user = await User.findByPk(decoded.userId);
  if (!user || !user.isActive) throw new Error('User not found');

  const tokens = generateTokens(user.id, user.role);
  return { tokens };
}

export { generateTokens };
