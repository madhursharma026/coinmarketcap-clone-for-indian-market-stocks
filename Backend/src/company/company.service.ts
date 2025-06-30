import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanyFilterInput } from './dto/company-filter.input';
import { CompanySortInput } from './dto/company-sort.input';
import { CreateCompanyInput } from './dto/create-company.input';
import { Company } from './entity/company.entity';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
  ) {}

  async create(input: CreateCompanyInput): Promise<Company> {
    const company = this.companyRepo.create(input);
    return this.companyRepo.save(company);
  }

  findAll(
    filter?: CompanyFilterInput,
    sort?: CompanySortInput,
    limit?: number,
    offset?: number,
  ): Promise<Company[]> {
    const query = this.companyRepo
      .createQueryBuilder('company')
      .leftJoinAndSelect('company.fundamentals', 'fundamentals')
      .leftJoinAndSelect('company.prices', 'prices');

    // Filtering
    if (filter?.pe_lt !== undefined) {
      query.andWhere('fundamentals.pe_ratio < :peLt', { peLt: filter.pe_lt });
    }
    if (filter?.pe_gt !== undefined) {
      query.andWhere('fundamentals.pe_ratio > :peGt', { peGt: filter.pe_gt });
    }
    if (filter?.roe_gt !== undefined) {
      query.andWhere('fundamentals.roe > :roeGt', { roeGt: filter.roe_gt });
    }
    if (filter?.marketCap_gt !== undefined) {
      query.andWhere('prices.current_price > :mcGt', {
        mcGt: filter.marketCap_gt,
      });
    }
    if (filter?.marketCap_lt !== undefined) {
      query.andWhere('prices.current_price < :mcLt', {
        mcLt: filter.marketCap_lt,
      });
    }

    // Sorting
    if (sort?.sortBy) {
      const allowedFields = ['pe_ratio', 'roe', 'current_price'];
      const sortBy = allowedFields.includes(sort.sortBy)
        ? sort.sortBy
        : 'pe_ratio';
      const direction = sort.order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

      const prefix = sortBy === 'current_price' ? 'prices' : 'fundamentals';

      query.orderBy(`${prefix}.${sortBy}`, direction);
    }

    if (limit !== undefined) query.take(limit);
    if (offset !== undefined) query.skip(offset);

    return query.getMany();
  }

  async findOne(id: number): Promise<Company> {
    const company = await this.companyRepo.findOne({
      where: { id },
      relations: ['fundamentals', 'prices'],
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }

  async countAll(): Promise<number> {
    return this.companyRepo.count();
  }
}
