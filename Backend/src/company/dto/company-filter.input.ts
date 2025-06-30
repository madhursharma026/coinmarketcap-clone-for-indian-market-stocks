import { Field, Float, InputType } from '@nestjs/graphql';

@InputType()
export class CompanyFilterInput {
  @Field(() => Float, { nullable: true }) pe_lt?: number;
  @Field(() => Float, { nullable: true }) pe_gt?: number;
  @Field(() => Float, { nullable: true }) roe_gt?: number;
  @Field(() => Float, { nullable: true }) marketCap_gt?: number;
  @Field(() => Float, { nullable: true }) marketCap_lt?: number;
}
