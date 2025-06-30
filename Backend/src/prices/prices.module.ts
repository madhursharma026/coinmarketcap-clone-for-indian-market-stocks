import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from 'src/company/entity/company.entity';
import { HistoricalPrice } from './entity/historical-price.entity';
import { Price } from './entity/price.entity';
import { PricesResolver } from './prices.resolver';
import { PricesService } from './prices.service';

@Module({
  imports: [TypeOrmModule.forFeature([Price, HistoricalPrice, Company])],
  providers: [PricesService, PricesResolver],
  exports: [PricesService],
})
export class PricesModule {}
