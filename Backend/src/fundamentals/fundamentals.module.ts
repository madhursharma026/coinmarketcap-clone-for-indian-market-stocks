import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from 'src/company/entity/company.entity';
import { Fundamentals } from './entity/fundamentals.entity';
import { FundamentalsResolver } from './fundamentals.resolver';
import { FundamentalsService } from './fundamentals.service';

@Module({
  imports: [TypeOrmModule.forFeature([Fundamentals, Company])],
  providers: [FundamentalsResolver, FundamentalsService],
})
export class FundamentalsModule {}
