import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export function setupPassport() {
  // 本地策略 - 用于登录
  passport.use(new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    async (email: string, password: string, done) => {
      try {
        // 查找用户
        const user = await prisma.user.findUnique({
          where: { email },
          include: {
            anonymousIdentities: true,
            preferences: true
          }
        });

        if (!user) {
          return done(null, false, { message: '用户不存在' });
        }

        if (!user.isActive) {
          return done(null, false, { message: '账户已被禁用' });
        }

        // 验证密码
        const isValidPassword = await bcrypt.compare(password, user.passwordHash);
        if (!isValidPassword) {
          return done(null, false, { message: '密码错误' });
        }

        // 更新最后活跃时间
        await prisma.user.update({
          where: { id: user.id },
          data: { lastActiveAt: new Date() }
        });

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  ));

  // JWT 策略 - 用于认证保护的路由
  passport.use(new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'threadbond_jwt_secret_key_2024_very_secure'
    },
    async (payload, done) => {
      try {
        const user = await prisma.user.findUnique({
          where: { id: payload.userId },
          include: {
            anonymousIdentities: true,
            preferences: true
          }
        });

        if (!user) {
          return done(null, false);
        }

        if (!user.isActive) {
          return done(null, false);
        }

        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  ));

  // 序列化用户（用于会话）
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  // 反序列化用户（用于会话）
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          anonymousIdentities: true,
          preferences: true
        }
      });
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
}