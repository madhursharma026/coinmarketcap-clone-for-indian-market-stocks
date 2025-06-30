import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';

import { CompanyModule } from './company/company.module';
import { FundamentalsModule } from './fundamentals/fundamentals.module';
import { PricesModule } from './prices/prices.module';
import { ScraperModule } from './scraper/scraper.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'stock_db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // ⚠️ use only in development
      autoLoadEntities: true,
    }),
    ScheduleModule.forRoot(), // ✅ Moved outside TypeORM config
    CompanyModule,
    FundamentalsModule,
    PricesModule,
    ScraperModule,
  ],
})
export class AppModule {}
