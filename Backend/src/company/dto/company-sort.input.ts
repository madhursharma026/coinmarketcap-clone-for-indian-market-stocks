import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CompanySortInput {
  @Field() sortBy: string;
  @Field({ defaultValue: 'asc' }) order: 'asc' | 'desc';
}
