import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateFundamentalsInput } from './dto/create-fundamentals.input';
import { Fundamentals } from './entity/fundamentals.entity';
import { FundamentalsService } from './fundamentals.service';

@Resolver(() => Fundamentals)
export class FundamentalsResolver {
  constructor(private readonly fundamentalsService: FundamentalsService) {}

  @Mutation(() => Fundamentals)
  async addFundamentals(
    @Args('input') input: CreateFundamentalsInput,
  ): Promise<Fundamentals> {
    return this.fundamentalsService.create(input);
  }

  @Query(() => [Fundamentals])
  async allFundamentals(): Promise<Fundamentals[]> {
    return this.fundamentalsService.findAll();
  }
}
