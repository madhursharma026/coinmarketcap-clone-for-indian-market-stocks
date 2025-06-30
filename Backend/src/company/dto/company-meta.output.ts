import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CompanyMeta {
  @Field(() => Int)
  totalCount: number;
}
