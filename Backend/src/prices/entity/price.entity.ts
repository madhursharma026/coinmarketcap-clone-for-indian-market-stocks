import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { Company } from 'src/company/entity/company.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity()
export class Price {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Company)
  @ManyToOne(() => Company, (company) => company.prices)
  company: Company;

  @Field(() => Float)
  @Column('decimal')
  current_price: number;

  @Field(() => Float)
  @Column('decimal')
  high_52w: number;

  @Field(() => Float)
  @Column('decimal')
  low_52w: number;

  @Field(() => Date)
  @Column('timestamp')
  last_updated: Date;
}
