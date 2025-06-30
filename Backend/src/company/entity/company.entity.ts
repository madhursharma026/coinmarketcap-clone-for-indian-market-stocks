import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Fundamentals } from 'src/fundamentals/entity/fundamentals.entity';
import { Price } from 'src/prices/entity/price.entity';
import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@ObjectType()
@Entity()
export class Company {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field() @Column() name: string;
  @Field() @Column() symbol: string;
  @Field() @Column() sector: string;
  @Field() @Column() exchange: string;

  @Field(() => Fundamentals, { nullable: true })
  @OneToOne(() => Fundamentals, (fundamentals) => fundamentals.company)
  fundamentals: Fundamentals;

  @Field(() => [Price], { nullable: true })
  @OneToMany(() => Price, (price) => price.company)
  prices: Price[];
}
