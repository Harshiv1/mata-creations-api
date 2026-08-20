import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './auth/auth.module';
import { ProductModule } from './product/product.module';
import { CartModule } from './cart/cart.module';
import { OrderModule } from './order/order.module';
import { UserModule } from './user/user.module';
import { BannerModule } from './banner/banner.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'mata-creations-secret-key-2024',
      signOptions: { expiresIn: '30d' },
    }),
    AuthModule,
    ProductModule,
    CartModule,
    OrderModule,
    UserModule,
    BannerModule,
    AdminModule,
  ],
})
export class AppModule {}
