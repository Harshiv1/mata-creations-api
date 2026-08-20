import { Controller, Get } from '@nestjs/common';
import { store } from '../data/store';

@Controller()
export class BannerController {
  @Get('banners')
  findAllBanners() {
    return store.banners;
  }

  @Get('categories')
  findAllCategories() {
    return store.categories;
  }
}
