import {
  Controller, Get, Post, Put, Delete,
  Param, Body, UseGuards, Req,
  ForbiddenException, NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { store, Product } from '../data/store';
import { randomUUID as uuid } from 'crypto';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {

  private checkAdmin(req: any) {
    if (!req.user.isAdmin) {
      throw new ForbiddenException('Admin access required');
    }
  }

  // ── Dashboard ──────────────────────────────────────────────────

  @Get('dashboard')
  dashboard(@Req() req: any) {
    this.checkAdmin(req);
    const totalProducts = store.products.length;
    const totalOrders = store.orders.length;
    const totalUsers = store.users.length;
    const totalRevenue = store.orders.reduce((s, o) => s + o.total, 0);
    const pendingOrders = store.orders.filter((o) => o.status === 'confirmed' || o.status === 'pending').length;
    const recentOrders = store.orders
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    return {
      totalProducts,
      totalOrders,
      totalUsers,
      totalRevenue,
      pendingOrders,
      recentOrders,
    };
  }

  // ── Products CRUD ──────────────────────────────────────────────

  @Get('products')
  listProducts(@Req() req: any) {
    this.checkAdmin(req);
    return store.products;
  }

  @Post('products')
  createProduct(@Req() req: any, @Body() dto: Partial<Product>) {
    this.checkAdmin(req);
    const product: Product = {
      id: uuid(),
      name: dto.name || 'New Product',
      slug: (dto.name || 'new-product').toLowerCase().replace(/\s+/g, '-'),
      description: dto.description || '',
      images: dto.images || ['https://picsum.photos/seed/new/600/800'],
      categoryId: dto.categoryId || 'cat-1',
      category: dto.category || 'Banarasi Silk',
      fabric: dto.fabric || 'Silk',
      occasion: dto.occasion || 'Festive',
      color: dto.color || 'Red',
      work: dto.work || 'Zari',
      pricing: dto.pricing || { retail: 2000, wholesale: 1300, mrp: 2800 },
      stock: dto.stock ?? 10,
      rating: 0,
      reviewCount: 0,
      isFeatured: dto.isFeatured ?? false,
      isNewArrival: dto.isNewArrival ?? true,
      createdAt: new Date().toISOString(),
    };
    store.products.push(product);
    return product;
  }

  @Put('products/:id')
  updateProduct(@Req() req: any, @Param('id') id: string, @Body() dto: Partial<Product>) {
    this.checkAdmin(req);
    const idx = store.products.findIndex((p) => p.id === id);
    if (idx === -1) throw new NotFoundException('Product not found');

    const product = store.products[idx];
    Object.assign(product, {
      ...dto,
      id: product.id, // never overwrite id
      slug: dto.name ? dto.name.toLowerCase().replace(/\s+/g, '-') : product.slug,
    });
    return product;
  }

  @Delete('products/:id')
  deleteProduct(@Req() req: any, @Param('id') id: string) {
    this.checkAdmin(req);
    const idx = store.products.findIndex((p) => p.id === id);
    if (idx === -1) throw new NotFoundException('Product not found');
    store.products.splice(idx, 1);
    return { message: 'Product deleted' };
  }

  // ── Categories ─────────────────────────────────────────────────

  @Get('categories')
  listCategories(@Req() req: any) {
    this.checkAdmin(req);
    return store.categories;
  }

  @Post('categories')
  createCategory(@Req() req: any, @Body() dto: { name: string; image?: string }) {
    this.checkAdmin(req);
    const category = {
      id: `cat-${Date.now()}`,
      name: dto.name,
      slug: dto.name.toLowerCase().replace(/\s+/g, '-'),
      image: dto.image || 'https://picsum.photos/seed/cat-new/400/400',
      productCount: 0,
    };
    store.categories.push(category);
    return category;
  }

  // ── Orders ─────────────────────────────────────────────────────

  @Get('orders')
  listOrders(@Req() req: any) {
    this.checkAdmin(req);
    return store.orders.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  @Put('orders/:id/status')
  updateOrderStatus(@Req() req: any, @Param('id') id: string, @Body() dto: { status: string }) {
    this.checkAdmin(req);
    const order = store.orders.find((o) => o.id === id);
    if (!order) throw new NotFoundException('Order not found');
    order.status = dto.status;
    return order;
  }

  // ── Users ──────────────────────────────────────────────────────

  @Get('users')
  listUsers(@Req() req: any) {
    this.checkAdmin(req);
    return store.users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      customerType: u.customerType,
      isAdmin: u.isAdmin || store.adminEmails.includes(u.email),
      createdAt: u.createdAt,
    }));
  }
}
