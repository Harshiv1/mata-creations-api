import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { store } from '../data/store';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'mata-creations-secret-key-2024',
    });
  }

  async validate(payload: any) {
    const user = store.users.find((u) => u.id === payload.sub);
    if (!user) throw new UnauthorizedException();
    return { id: user.id, email: user.email, name: user.name, customerType: user.customerType };
  }
}
