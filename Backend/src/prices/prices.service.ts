import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from 'src/company/entity/company.entity';
import { Repository } from 'typeorm';
import { HistoricalPrice } from './entity/historical-price.entity';

@Injectable()
export class PricesService {
  private readonly logger = new Logger(PricesService.name);

  constructor(
    @InjectRepository(HistoricalPrice)
    private historicalPriceRepo: Repository<HistoricalPrice>,
    @InjectRepository(Company)
    private companyRepo: Repository<Company>,
  ) {}

  @Cron('0 11 * * *') // Runs every day at 11 AM
  async scrapeDailyPrice(): Promise<void> {
    const companies = await this.companyRepo.find();

    for (const company of companies) {
      try {
        // Replace this logic with real API call
        const simulatedPrice = Math.random() * 1000;

        const priceRecord = this.historicalPriceRepo.create({
          company,
          price: simulatedPrice,
          date: new Date(),
        });

        await this.historicalPriceRepo.save(priceRecord);
        this.logger.log(`✅ Saved price for ${company.name}`);
      } catch (error) {
        this.logger.error(
          `❌ Error scraping price for ${company.name}: ${error.message}`,
        );
      }
    }
  }
}
