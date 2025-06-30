import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from 'src/company/entity/company.entity';
import { Repository } from 'typeorm';
import { CreateFundamentalsInput } from './dto/create-fundamentals.input';
import { Fundamentals } from './entity/fundamentals.entity';

@Injectable()
export class FundamentalsService {
  constructor(
    @InjectRepository(Fundamentals)
    private fundamentalsRepo: Repository<Fundamentals>,

    @InjectRepository(Company)
    private companyRepo: Repository<Company>,
  ) {}

  async create(input: CreateFundamentalsInput): Promise<Fundamentals> {
    const company = await this.companyRepo.findOne({
      where: { id: input.companyId },
    });
    if (!company) throw new NotFoundException('Company not found');

    const fundamentals = this.fundamentalsRepo.create({
      ...input,
      company,
      last_updated: new Date(),
    });

    return this.fundamentalsRepo.save(fundamentals);
  }

  findAll(): Promise<Fundamentals[]> {
    return this.fundamentalsRepo.find({ relations: ['company'] });
  }
}
