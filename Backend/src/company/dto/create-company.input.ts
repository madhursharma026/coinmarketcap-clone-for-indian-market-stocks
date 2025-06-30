import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateCompanyInput {
  @Field() name: string;
  @Field() symbol: string;
  @Field() sector: string;
  @Field() exchange: string;
}
