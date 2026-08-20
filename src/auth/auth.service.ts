import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcryptjs from 'bcryptjs';
import { randomUUID as uuid } from 'crypto';
import { store, User } from '../data/store';

@Injectable()
export class AuthService {
  constructor(private jwt: JwtService) {}

  async register(dto: { name: string; email: string; phone: string; password: string; customerType?: string }) {
    if (dto.email && store.users.find((u) => u.email === dto.email)) {
      throw new BadRequestException('Email already registered');
    }
    if (dto.phone && store.users.find((u) => u.phone === dto.phone && u.phone !== '')) {
      throw new BadRequestException('Phone number already registered');
    }
    const user: User = {
      id: uuid(),
      name: dto.name,
      email: dto.email || '',
      phone: dto.phone || '',
      password: await bcryptjs.hash(dto.password, 10),
      customerType: (dto.customerType as any) || 'retail',
      createdAt: new Date().toISOString(),
    };
    store.users.push(user);
    return this.issueTokens(user);
  }

  async registerSendOtp(dto: { name: string; email?: string; phone?: string; password: string }) {
    const contact = dto.email || dto.phone;
    if (!contact) {
      throw new BadRequestException('Either email or phone number is required');
    }
    if (dto.email && store.users.find((u) => u.email === dto.email)) {
      throw new BadRequestException('Email already registered');
    }
    if (dto.phone && store.users.find((u) => u.phone === dto.phone && u.phone !== '')) {
      throw new BadRequestException('Phone number already registered');
    }
    const otp = String(100000 + Math.floor(Math.random() * 900000));
    store.otpStore.set(contact, otp);
    store.pendingRegistrations.set(contact, dto);
    console.log(`[REGISTER OTP] ${contact}: ${otp}`);
    return { message: `OTP sent to ${contact}`, otp, contact };
  }

  async registerVerifyOtp(contact: string, otp: string) {
    const saved = store.otpStore.get(contact);
    if (!saved || saved !== otp) {
      throw new BadRequestException('Invalid OTP');
    }
    const pending = store.pendingRegistrations.get(contact);
    if (!pending) {
      throw new BadRequestException('No pending registration found. Please register again.');
    }
    store.otpStore.delete(contact);
    store.pendingRegistrations.delete(contact);

    const user: User = {
      id: uuid(),
      name: pending.name,
      email: pending.email || '',
      phone: pending.phone || '',
      password: await bcryptjs.hash(pending.password, 10),
      customerType: 'retail',
      createdAt: new Date().toISOString(),
    };
    store.users.push(user);
    return this.issueTokens(user);
  }

  async login(email: string, password: string) {
    const user = store.users.find((u) => u.email === email);
    if (!user || !(await bcryptjs.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return this.issueTokens(user);
  }

  async sendOtp(email: string) {
    const otp = String(100000 + Math.floor(Math.random() * 900000));
    store.otpStore.set(email, otp);
    console.log(`[OTP] ${email}: ${otp}`);
    return { message: 'OTP sent successfully', otp }; // return OTP for demo
  }

  async verifyOtp(email: string, otp: string) {
    const saved = store.otpStore.get(email);
    if (!saved || saved !== otp) {
      throw new BadRequestException('Invalid OTP');
    }
    store.otpStore.delete(email);

    let user = store.users.find((u) => u.email === email);
    if (!user) {
      // auto-create user on OTP verify
      user = {
        id: uuid(),
        name: email.split('@')[0],
        email,
        phone: '',
        password: await bcryptjs.hash(uuid(), 10),
        customerType: 'retail',
        createdAt: new Date().toISOString(),
      };
      store.users.push(user);
    }
    return this.issueTokens(user);
  }

  async refreshToken(token: string) {
    try {
      const payload = this.jwt.verify(token);
      const user = store.users.find((u) => u.id === payload.sub);
      if (!user) throw new UnauthorizedException();
      return this.issueTokens(user);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async forgotPassword(email: string) {
    return this.sendOtp(email);
  }

  async resetPassword(email: string, otp: string, newPassword: string) {
    const saved = store.otpStore.get(email);
    if (!saved || saved !== otp) {
      throw new BadRequestException('Invalid OTP');
    }
    store.otpStore.delete(email);
    const user = store.users.find((u) => u.email === email);
    if (!user) throw new BadRequestException('User not found');
    user.password = await bcryptjs.hash(newPassword, 10);
    return { message: 'Password reset successfully' };
  }

  private issueTokens(user: User) {
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwt.sign(payload, { expiresIn: '7d' });
    const refreshToken = this.jwt.sign(payload, { expiresIn: '30d' });
    store.refreshTokens.set(user.id, refreshToken);
    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        customerType: user.customerType,
        avatar: user.avatar,
      },
    };
  }
}
