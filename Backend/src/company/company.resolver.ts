import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CompanyMeta } from 'src/company/dto/company-meta.output';
import { CompanyService } from './company.service';
import { CompanyFilterInput } from './dto/company-filter.input';
import { CompanySortInput } from './dto/company-sort.input';
import { CreateCompanyInput } from './dto/create-company.input';
import { Company } from './entity/company.entity';

@Resolver(() => Company)
export class CompanyResolver {
  constructor(private readonly companyService: CompanyService) {}

  @Mutation(() => Company)
  async addCompany(@Args('input') input: CreateCompanyInput): Promise<Company> {
    return this.companyService.create(input);
  }

  @Query(() => [Company])
  companies(
    @Args('filter', { nullable: true }) filter?: CompanyFilterInput,
    @Args('sort', { nullable: true }) sort?: CompanySortInput,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('offset', { type: () => Int, nullable: true }) offset?: number,
  ): Promise<Company[]> {
    return this.companyService.findAll(filter, sort, limit, offset);
  }

  @Query(() => Company, { nullable: true })
  async company(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Company | null> {
    return this.companyService.findOne(id);
  }

  @Query(() => CompanyMeta)
  async companiesMeta(): Promise<CompanyMeta> {
    const total = await this.companyService.countAll();
    return { totalCount: total };
  }
}
