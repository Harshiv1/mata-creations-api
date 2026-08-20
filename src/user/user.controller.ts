import { Controller, Get, Put, Post, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { store } from '../data/store';
import { randomUUID as uuid } from 'crypto';

@Controller()
@UseGuards(JwtAuthGuard)
export class UserController {
  // ── Profile ───────────────────────────────────────────────

  @Get('profile')
  getProfile(@Req() req: any) {
    const user = store.users.find((u) => u.id === req.user.id);
    if (!user) return { statusCode: 404, message: 'User not found' };
    return { id: user.id, name: user.name, email: user.email, phone: user.phone, customerType: user.customerType, avatar: user.avatar };
  }

  @Put('profile')
  updateProfile(@Req() req: any, @Body() dto: { name?: string; phone?: string }) {
    const user = store.users.find((u) => u.id === req.user.id);
    if (!user) return { statusCode: 404, message: 'User not found' };
    if (dto.name) user.name = dto.name;
    if (dto.phone) user.phone = dto.phone;
    return { id: user.id, name: user.name, email: user.email, phone: user.phone, customerType: user.customerType };
  }

  // ── Addresses ─────────────────────────────────────────────

  @Get('addresses')
  getAddresses(@Req() req: any) {
    return store.addresses.get(req.user.id) || [];
  }

  @Post('addresses')
  addAddress(@Req() req: any, @Body() dto: any) {
    const addresses = store.addresses.get(req.user.id) || [];
    const addr = {
      id: uuid(),
      userId: req.user.id,
      name: dto.name,
      phone: dto.phone,
      line1: dto.line1,
      line2: dto.line2 || '',
      city: dto.city,
      state: dto.state,
      pincode: dto.pincode,
      isDefault: addresses.length === 0,
    };
    addresses.push(addr);
    store.addresses.set(req.user.id, addresses);
    return addr;
  }

  @Put('addresses/:id')
  updateAddress(@Req() req: any, @Param('id') id: string, @Body() dto: any) {
    const addresses = store.addresses.get(req.user.id) || [];
    const addr = addresses.find((a) => a.id === id);
    if (!addr) return { statusCode: 404, message: 'Address not found' };
    Object.assign(addr, dto);
    return addr;
  }

  @Put('addresses/:id/default')
  setDefault(@Req() req: any, @Param('id') id: string) {
    const addresses = store.addresses.get(req.user.id) || [];
    addresses.forEach((a) => (a.isDefault = a.id === id));
    store.addresses.set(req.user.id, addresses);
    return addresses;
  }

  @Delete('addresses/:id')
  deleteAddress(@Req() req: any, @Param('id') id: string) {
    let addresses = store.addresses.get(req.user.id) || [];
    addresses = addresses.filter((a) => a.id !== id);
    store.addresses.set(req.user.id, addresses);
    return { message: 'Address deleted' };
  }

  // ── Wishlist ──────────────────────────────────────────────

  @Get('wishlist')
  getWishlist(@Req() req: any) {
    const ids = store.wishlists.get(req.user.id) || [];
    return store.products.filter((p) => ids.includes(p.id));
  }

  @Post('wishlist/:productId')
  toggleWishlist(@Req() req: any, @Param('productId') productId: string) {
    const ids = store.wishlists.get(req.user.id) || [];
    const idx = ids.indexOf(productId);
    if (idx >= 0) {
      ids.splice(idx, 1);
      store.wishlists.set(req.user.id, ids);
      return { added: false };
    } else {
      ids.push(productId);
      store.wishlists.set(req.user.id, ids);
      return { added: true };
    }
  }

  // ── Wholesale Application ─────────────────────────────────

  @Post('wholesale/apply')
  applyWholesale(@Req() req: any, @Body() dto: { gstNumber: string; businessName: string }) {
    const user = store.users.find((u) => u.id === req.user.id);
    if (user) user.customerType = 'wholesale';
    return { message: 'Wholesale application approved', status: 'approved' };
  }
}
