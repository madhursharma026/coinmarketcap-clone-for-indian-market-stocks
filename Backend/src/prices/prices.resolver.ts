import { Query, Resolver } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HistoricalPrice } from './entity/historical-price.entity';

@Resolver(() => HistoricalPrice)
export class PricesResolver {
  constructor(
    @InjectRepository(HistoricalPrice)
    private historicalPriceRepo: Repository<HistoricalPrice>,
  ) {}

  @Query(() => [HistoricalPrice])
  async historicalPrices(): Promise<HistoricalPrice[]> {
    return this.historicalPriceRepo.find({
      relations: ['company'],
      order: { date: 'DESC' },
    });
  }
}
