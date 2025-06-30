import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyResolver } from './company.resolver';
import { CompanyService } from './company.service';
import { Company } from './entity/company.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Company])],
  providers: [CompanyResolver, CompanyService],
})
export class CompanyModule {}
