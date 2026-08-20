import { Controller, Get, Param, Query, UseGuards, Req, Post, Body } from '@nestjs/common';
import { store } from '../data/store';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('products')
export class ProductController {
  @Get()
  findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('sort') sort?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('fabric') fabric?: string,
    @Query('occasion') occasion?: string,
    @Query('featured') featured?: string,
  ) {
    let products = [...store.products];

    if (featured === 'true') {
      products = products.filter((p) => p.isFeatured);
    }

    if (category) {
      products = products.filter((p) => p.categoryId === category || p.category.toLowerCase() === category.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      products = products.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    if (fabric) {
      products = products.filter((p) => p.fabric.toLowerCase() === fabric.toLowerCase());
    }
    if (occasion) {
      products = products.filter((p) => p.occasion.toLowerCase() === occasion.toLowerCase());
    }
    if (minPrice) {
      products = products.filter((p) => p.pricing.retail >= Number(minPrice));
    }
    if (maxPrice) {
      products = products.filter((p) => p.pricing.retail <= Number(maxPrice));
    }

    switch (sort) {
      case 'price_asc':
        products.sort((a, b) => a.pricing.retail - b.pricing.retail);
        break;
      case 'price_desc':
        products.sort((a, b) => b.pricing.retail - a.pricing.retail);
        break;
      case 'newest':
      case '-createdAt':
        products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'rating':
        products.sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }

    const p = Number(page);
    const l = Number(limit);
    const start = (p - 1) * l;
    const items = products.slice(start, start + l);

    return {
      data: items,
      meta: {
        page: p,
        limit: l,
        total: products.length,
        totalPages: Math.ceil(products.length / l),
      },
    };
  }

  @Get('featured')
  featured() {
    return store.products.filter((p) => p.isFeatured);
  }

  @Get('new-arrivals')
  newArrivals() {
    return store.products.filter((p) => p.isNewArrival);
  }

  @Get('categories')
  categories() {
    return store.categories;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    const product = store.products.find((p) => p.id === id);
    if (!product) return { statusCode: 404, message: 'Product not found' };
    return product;
  }

  @Get(':id/reviews')
  reviews(@Param('id') id: string) {
    return store.reviews.filter((r) => r.productId === id);
  }

  @Post(':id/reviews')
  @UseGuards(JwtAuthGuard)
  addReview(@Param('id') id: string, @Req() req: any, @Body() dto: { rating: number; comment: string }) {
    const review = {
      id: `rev-${Date.now()}`,
      productId: id,
      userId: req.user.id,
      userName: req.user.name,
      rating: dto.rating,
      comment: dto.comment,
      createdAt: new Date().toISOString(),
    };
    store.reviews.push(review);
    const product = store.products.find((p) => p.id === id);
    if (product) {
      product.reviewCount++;
      const allReviews = store.reviews.filter((r) => r.productId === id);
      product.rating = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
    }
    return review;
  }
}
