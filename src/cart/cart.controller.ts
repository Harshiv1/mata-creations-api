import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { store } from '../data/store';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  @Get()
  getCart(@Req() req: any) {
    const items = store.carts.get(req.user.id) || [];
    return this.buildCart(items, req.user.customerType);
  }

  @Post('add')
  addItem(@Req() req: any, @Body() dto: { productId: string; quantity: number }) {
    const items = store.carts.get(req.user.id) || [];
    const existing = items.find((i) => i.productId === dto.productId);
    if (existing) {
      existing.quantity += dto.quantity || 1;
    } else {
      items.push({ productId: dto.productId, quantity: dto.quantity || 1 });
    }
    store.carts.set(req.user.id, items);
    return this.buildCart(items, req.user.customerType);
  }

  @Put(':productId')
  updateItem(@Req() req: any, @Param('productId') productId: string, @Body() dto: { quantity: number }) {
    const items = store.carts.get(req.user.id) || [];
    const item = items.find((i) => i.productId === productId);
    if (item) item.quantity = dto.quantity;
    store.carts.set(req.user.id, items);
    return this.buildCart(items, req.user.customerType);
  }

  @Delete(':productId')
  removeItem(@Req() req: any, @Param('productId') productId: string) {
    let items = store.carts.get(req.user.id) || [];
    items = items.filter((i) => i.productId !== productId);
    store.carts.set(req.user.id, items);
    return this.buildCart(items, req.user.customerType);
  }

  @Delete()
  clearCart(@Req() req: any) {
    store.carts.set(req.user.id, []);
    return this.buildCart([], req.user.customerType);
  }

  @Post('coupon')
  applyCoupon(@Req() req: any, @Body() dto: { code: string }) {
    const items = store.carts.get(req.user.id) || [];
    const cart = this.buildCart(items, req.user.customerType);
    // Demo coupon
    if (dto.code.toUpperCase() === 'MATA20') {
      cart.discount = Math.floor(cart.subtotal * 0.2);
      cart.total = cart.subtotal - cart.discount + cart.shipping;
      cart.coupon = { code: 'MATA20', discount: 20, type: 'percentage' };
    } else {
      return { statusCode: 400, message: 'Invalid coupon code' };
    }
    return cart;
  }

  private buildCart(items: { productId: string; quantity: number }[], customerType = 'retail') {
    const cartItems = items.map((item) => {
      const product = store.products.find((p) => p.id === item.productId);
      if (!product) return null;
      const price = customerType === 'wholesale' ? product.pricing.wholesale : product.pricing.retail;
      return {
        product: {
          id: product.id,
          name: product.name,
          primaryImage: product.images[0],
          pricing: product.pricing,
        },
        quantity: item.quantity,
        price,
        total: price * item.quantity,
      };
    }).filter(Boolean);

    const subtotal = cartItems.reduce((s, i: any) => s + i.total, 0);
    const shipping = subtotal >= 2000 ? 0 : 99;

    return {
      items: cartItems,
      subtotal,
      shipping,
      discount: 0,
      total: subtotal + shipping,
      coupon: null,
    };
  }
}
