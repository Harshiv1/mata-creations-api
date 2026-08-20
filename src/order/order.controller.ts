import { Controller, Get, Post, Param, UseGuards, Req, Body } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { store } from '../data/store';
import { randomUUID as uuid } from 'crypto';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  @Get()
  findAll(@Req() req: any) {
    return store.orders.filter((o) => o.userId === req.user.id).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    const order = store.orders.find((o) => o.id === id && o.userId === req.user.id);
    if (!order) return { statusCode: 404, message: 'Order not found' };
    return order;
  }

  @Post()
  create(@Req() req: any, @Body() dto: { addressId: string }) {
    const cartItems = store.carts.get(req.user.id) || [];
    if (cartItems.length === 0) return { statusCode: 400, message: 'Cart is empty' };

    const addresses = store.addresses.get(req.user.id) || [];
    const address = addresses.find((a) => a.id === dto.addressId);
    if (!address) return { statusCode: 400, message: 'Address not found' };

    const priceKey = req.user.customerType === 'wholesale' ? 'wholesale' : 'retail';
    const items = cartItems.map((ci) => {
      const product = store.products.find((p) => p.id === ci.productId)!;
      return {
        productId: product.id,
        productName: product.name,
        productImage: product.images[0],
        quantity: ci.quantity,
        price: product.pricing[priceKey],
      };
    });

    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const shipping = subtotal >= 2000 ? 0 : 99;

    const order = {
      id: uuid(),
      userId: req.user.id,
      items,
      address,
      subtotal,
      shipping,
      discount: 0,
      total: subtotal + shipping,
      status: 'confirmed',
      paymentMethod: 'cod',
      createdAt: new Date().toISOString(),
    };

    store.orders.push(order);
    store.carts.set(req.user.id, []); // clear cart

    return { orderId: order.id, ...order };
  }
}
