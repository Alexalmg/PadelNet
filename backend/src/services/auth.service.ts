import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User, UserRole } from '../models';
import { jwtConfig } from '../config/jwt';
import { sendVerificationEmail } from './email.service';

function generateTokens(userId: number, role: UserRole) {
  const accessToken = jwt.sign({ userId, role }, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn } as jwt.SignOptions);
  const refreshToken = jwt.sign({ userId, role }, jwtConfig.refreshSecret, { expiresIn: jwtConfig.refreshExpiresIn } as jwt.SignOptions);
  return { accessToken, refreshToken };
}

export async function register(email: string, password: string, firstName: string, lastName: string) {
  const existing = await User.findOne({ where: { email } });
  if (existing) throw new Error('Email already in use');

  const hashed = await bcrypt.hash(password, 10);
  const smtpConfigured = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
  const isProd = process.env.NODE_ENV === 'production';

  if (!smtpConfigured) {
    // Sin SMTP: auto-verificar (modo dev sin config de email)
    const user = await User.create({ email, password: hashed, firstName, lastName, emailVerified: true });
    console.log(`📧 Sin SMTP configurado — usuario ${email} auto-verificado`);
    return user;
  }

  // Con SMTP: enviar email siempre
  const emailVerificationToken = crypto.randomBytes(32).toString('hex');
  // En producción requiere verificación; en dev auto-verifica pero igualmente envía el email para probar
  const emailVerified = !isProd;
  const user = await User.create({ email, password: hashed, firstName, lastName, emailVerificationToken, emailVerified });

  sendVerificationEmail(email, firstName, emailVerificationToken).catch(err =>
    console.error('Error enviando email de verificación:', err)
  );

  return user;
}

export async function verifyEmail(token: string) {
  const user = await User.findOne({ where: { emailVerificationToken: token } });
  if (!user) throw new Error('Token inválido o expirado');

  await user.update({ emailVerified: true, emailVerificationToken: undefined });
  return user;
}

export async function resendVerification(email: string) {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error('Email no encontrado');
  if (user.emailVerified) throw new Error('La cuenta ya está verificada');

  const emailVerificationToken = crypto.randomBytes(32).toString('hex');
  await user.update({ emailVerificationToken });
  await sendVerificationEmail(email, user.firstName, emailVerificationToken);
}

export async function login(email: string, password: string) {
  const user = await User.findOne({ where: { email } });
  if (!user || !user.isActive) throw new Error('Invalid credentials');

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error('Invalid credentials');

  if (!user.emailVerified) throw new Error('EMAIL_NOT_VERIFIED');

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
