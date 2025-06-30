import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { Company } from 'src/company/entity/company.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity()
export class HistoricalPrice {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Company)
  @ManyToOne(() => Company, (company) => company.prices)
  company: Company;

  @Field(() => Float)
  @Column('decimal')
  price: number;

  @Field(() => Date)
  @Column('date')
  date: Date;
}
