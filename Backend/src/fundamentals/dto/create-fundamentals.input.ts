import { Field, Float, InputType, Int } from '@nestjs/graphql';

@InputType()
export class CreateFundamentalsInput {
  @Field(() => Int)
  companyId: number;

  @Field(() => Float, { nullable: true }) pe_ratio?: number;
  @Field(() => Float, { nullable: true }) pb_ratio?: number;
  @Field(() => Float, { nullable: true }) roe?: number;
  @Field(() => Float, { nullable: true }) roce?: number;
  @Field(() => Float, { nullable: true }) debt_to_equity?: number;
  @Field(() => Float, { nullable: true }) dividend_yield?: number;
  @Field(() => Float, { nullable: true }) sales_growth_3yr?: number;
  @Field(() => Float, { nullable: true }) profit_growth_3yr?: number;
  @Field(() => Float, { nullable: true }) sales_growth_5yr?: number;
  @Field(() => Float, { nullable: true }) profit_growth_5yr?: number;
}
