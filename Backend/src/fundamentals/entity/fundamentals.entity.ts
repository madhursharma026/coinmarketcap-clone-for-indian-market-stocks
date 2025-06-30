import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { Company } from 'src/company/entity/company.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@ObjectType()
@Entity()
export class Fundamentals {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Company)
  @OneToOne(() => Company, (company) => company.fundamentals, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  company: Company;

  @Field(() => Float, { nullable: true })
  @Column('decimal', { nullable: true })
  pe_ratio: number | null;

  @Field(() => Float, { nullable: true })
  @Column('decimal', { nullable: true })
  pb_ratio: number | null;

  @Field(() => Float, { nullable: true })
  @Column('decimal', { nullable: true })
  roe: number | null;

  @Field(() => Float, { nullable: true })
  @Column('decimal', { nullable: true })
  roce: number | null;

  @Field(() => Float, { nullable: true })
  @Column('decimal', { nullable: true })
  debt_to_equity: number | null;

  @Field(() => Float, { nullable: true })
  @Column('decimal', { nullable: true })
  dividend_yield: number | null;

  @Field(() => Float, { nullable: true })
  @Column('decimal', { nullable: true })
  sales_growth_3yr: number | null;

  @Field(() => Float, { nullable: true })
  @Column('decimal', { nullable: true })
  profit_growth_3yr: number | null;

  @Field(() => Float, { nullable: true })
  @Column('decimal', { nullable: true })
  sales_growth_5yr: number | null;

  @Field(() => Float, { nullable: true })
  @Column('decimal', { nullable: true })
  profit_growth_5yr: number | null;

  @Field(() => Date)
  @Column('timestamp')
  last_updated: Date;
}
