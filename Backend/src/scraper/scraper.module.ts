import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from 'src/company/entity/company.entity';
import { Fundamentals } from 'src/fundamentals/entity/fundamentals.entity';
import { HistoricalPrice } from 'src/prices/entity/historical-price.entity';
import { Price } from 'src/prices/entity/price.entity';
import { ScraperService } from './scraper.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Company, Fundamentals, HistoricalPrice, Price]),
  ],
  providers: [ScraperService],
})
export class ScraperModule {}
