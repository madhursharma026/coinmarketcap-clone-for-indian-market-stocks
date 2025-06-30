import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { load } from 'cheerio';
import * as puppeteer from 'puppeteer';
import { Repository } from 'typeorm';

import { Company } from 'src/company/entity/company.entity';
import { Fundamentals } from 'src/fundamentals/entity/fundamentals.entity';
import { HistoricalPrice } from 'src/prices/entity/historical-price.entity';
import { Price } from 'src/prices/entity/price.entity';

@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);
  private hasFetchedDaily = false;
  private hasFetchedWeekly = false;
  private htmlCache = new Map<string, string>();
  private queueDelay = 2500;
  private screenerCookie = '';
  private nseCookie = '';

  constructor(
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
    @InjectRepository(HistoricalPrice)
    private readonly historicalPriceRepo: Repository<HistoricalPrice>,
    @InjectRepository(Price)
    private readonly priceRepo: Repository<Price>,
    @InjectRepository(Fundamentals)
    private readonly fundamentalRepo: Repository<Fundamentals>,
  ) {
    this.logger.log('✅ ScraperService initialized');
  }

  @Cron('00 15 09 * * *')
  async scrapeDailyData() {
    if (this.hasFetchedDaily)
      return this.logger.warn('🚫 [Daily] Already fetched');
    this.logger.log('📆 [Daily] Fetching prices...');
    const success = await this.retryUntilSuccess(() => this.fetchPricesOnly());
    if (success) this.hasFetchedDaily = true;
  }

  @Cron('00 30 09 * * 1')
  async scrapeWeeklyPrices() {
    if (this.hasFetchedWeekly)
      return this.logger.warn('🚫 [Weekly] Already fetched');
    this.logger.log('📆 [Weekly] Fetching prices only...');
    const success = await this.retryUntilSuccess(() => this.fetchPricesOnly());
    if (success) this.hasFetchedWeekly = true;
  }

  @Cron('00 45 09 * * 1')
  async updateFundamentalsCron() {
    await this.retryUntilSuccess(() => this.updateFundamentals());
  }

  @Cron('0 0 * * * *')
  clearCache() {
    this.htmlCache.clear();
    this.logger.log('♻️ HTML cache cleared');
  }

  private async getCookieForSite(url: string): Promise<string> {
    try {
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: 20000,
      });
      const cookies = await page.cookies();
      await browser.close();
      return cookies.map((c) => `${c.name}=${c.value}`).join('; ');
    } catch (err) {
      this.logger.error(`❌ Failed to get cookie for ${url}: ${err.message}`);
      return '';
    }
  }

  private async fetchWithRetry(
    url: string,
    maxRetries = 5,
    delayMs = 2000,
  ): Promise<string | null> {
    if (this.htmlCache.has(url)) {
      this.logger.log(`⚡ Using cached HTML for ${url}`);
      return this.htmlCache.get(url)!;
    }

    if (!this.screenerCookie) {
      this.screenerCookie = await this.getCookieForSite(
        'https://www.screener.in/',
      );
    }

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await axios.get(url, {
          timeout: 15000,
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
            Accept:
              'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp',
            Referer: 'https://www.screener.in/',
            Cookie: this.screenerCookie,
          },
        });

        this.htmlCache.set(url, response.data);
        return response.data;
      } catch (err) {
        const status = err?.response?.status || 'NO_RESPONSE';
        this.logger.warn(
          `⚠️ Attempt ${attempt} failed for ${url} [${status}] - ${err.message}`,
        );
        if (attempt < maxRetries) {
          await new Promise((res) => setTimeout(res, delayMs * attempt));
        } else {
          this.logger.error(`❌ Max retries reached for ${url}`);
          return null;
        }
      }
    }
    return null;
  }

  private async updateFundamentals() {
    const companies = await this.companyRepo.find();
    let count = 0;

    for (const company of companies) {
      if (!/^[A-Z0-9-]+$/.test(company.symbol)) {
        this.logger.warn(`⛔ Invalid symbol, skipping: ${company.symbol}`);
        continue;
      }

      try {
        const screenerUrl = `https://www.screener.in/company/${company.symbol}/`;
        const html = await this.fetchWithRetry(screenerUrl, 3, 3000);

        if (!html) {
          this.logger.error(
            `❌ Skipping ${company.name} - Unable to fetch page`,
          );
          continue;
        }

        const $ = load(html);
        const getLiValue = (label: string): number | null => {
          const row = $(`li:contains("${label}")`).first().text();
          const match = row.match(/([\d.]+)/);
          return match ? parseFloat(match[1]) : null;
        };

        const getTableValue = (label: string): number | null => {
          const cell = $(`td:contains("${label}")`).first().next().text();
          const match = cell.match(/([\d.]+)/);
          return match ? parseFloat(match[1]) : null;
        };

        let fundamentals = await this.fundamentalRepo.findOne({
          where: { company: { id: company.id } },
          relations: ['company'],
        });

        const recentlyUpdated =
          fundamentals?.last_updated &&
          Date.now() - fundamentals.last_updated.getTime() <
            1000 * 60 * 60 * 24;

        if (recentlyUpdated) {
          this.logger.log(`⏭️ Skipping ${company.symbol} - Recently updated`);
          continue;
        }

        if (!fundamentals)
          fundamentals = this.fundamentalRepo.create({ company });

        fundamentals.pe_ratio = getLiValue('P/E');
        fundamentals.pb_ratio = getLiValue('P/B');
        fundamentals.roe = getLiValue('ROE');
        fundamentals.roce = getLiValue('ROCE');
        fundamentals.debt_to_equity = getLiValue('Debt to equity');
        fundamentals.dividend_yield = getLiValue('Dividend Yield');
        fundamentals.sales_growth_3yr = getTableValue('3 Year Sales CAGR');
        fundamentals.profit_growth_3yr = getTableValue('3 Year Profit CAGR');
        fundamentals.sales_growth_5yr = getTableValue('5 Year Sales CAGR');
        fundamentals.profit_growth_5yr = getTableValue('5 Year Profit CAGR');
        fundamentals.last_updated = new Date();

        await this.fundamentalRepo.save(fundamentals);
        this.logger.log(
          `📊 (${++count}) Fundamentals updated for ${company.symbol}`,
        );

        await new Promise((res) => setTimeout(res, this.queueDelay));
      } catch (err) {
        this.logger.error(`❌ ${company.symbol}: ${err.message}`);
      }
    }

    this.logger.log(
      `🎉 Total fundamentals updated: ${count}/${companies.length}`,
    );
  }

  private async retryUntilSuccess(
    fetchFn: () => Promise<void>,
  ): Promise<boolean> {
    let attempt = 0;
    while (true) {
      attempt++;
      try {
        this.logger.log(`🔁 Attempt #${attempt}`);
        await fetchFn();
        this.logger.log(`✅ Success on attempt #${attempt}`);
        return true;
      } catch (err) {
        const status = err.response?.status;
        const statusText = err.response?.statusText || err.message;
        this.logger.error(`❌ Error [${status}]: ${statusText}`);
        this.logger.warn('⏳ Retrying in 10s...');
        await new Promise((res) => setTimeout(res, 10000));
      }
    }
  }

  private getHeaders(): Record<string, string> {
    return {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
      Accept: 'application/json, text/plain, */*',
      Connection: 'keep-alive',
      Referer: 'https://www.nseindia.com/',
      Host: 'www.nseindia.com',
    };
  }

  private async fetchQuote(symbol: string): Promise<any> {
    try {
      if (!this.nseCookie) {
        this.nseCookie = await this.getCookieForSite(
          'https://www.nseindia.com',
        );
      }

      const res = await axios.get(
        `https://www.nseindia.com/api/quote-equity?symbol=${symbol}`,
        {
          headers: {
            ...this.getHeaders(),
            Cookie: this.nseCookie,
          },
        },
      );
      return res.data;
    } catch (err) {
      this.logger.warn(`⚠️ Quote fetch failed for ${symbol}: ${err.message}`);
      return null;
    }
  }

  private async fetchPricesOnly(): Promise<void> {
    const now = new Date();

    if (!this.nseCookie) {
      this.nseCookie = await this.getCookieForSite('https://www.nseindia.com');
    }

    const { data } = await axios.get(
      'https://www.nseindia.com/api/equity-stockIndices?index=NIFTY%20500',
      {
        headers: {
          ...this.getHeaders(),
          Cookie: this.nseCookie,
        },
      },
    );

    for (const stock of data?.data || []) {
      const symbol = stock.symbol;
      const name = stock.meta?.companyName || symbol;
      const sector = stock.sector || 'Unknown';

      if (!/^[A-Z0-9-]+$/.test(symbol)) {
        this.logger.warn(`⛔ Skipping invalid symbol: ${symbol}`);
        continue;
      }

      let company = await this.companyRepo.findOne({ where: { symbol } });
      if (!company) {
        company = this.companyRepo.create({
          name,
          symbol,
          sector,
          exchange: 'NSE',
        });
      } else {
        company.sector = sector;
      }
      await this.companyRepo.save(company);

      const quote = await this.fetchQuote(symbol);
      const lastPrice = parseFloat(
        quote?.priceInfo?.lastPrice || stock.lastPrice || '0',
      );
      const high52 =
        parseFloat(quote?.priceInfo?.weekHigh52) ||
        parseFloat(stock.yearHigh) ||
        0;
      const low52 =
        parseFloat(quote?.priceInfo?.weekLow52) ||
        parseFloat(stock.yearLow) ||
        0;

      await this.historicalPriceRepo.save({
        company,
        price: lastPrice,
        date: now,
      });
      await this.priceRepo.save({
        company,
        current_price: lastPrice,
        high_52w: high52,
        low_52w: low52,
        last_updated: now,
      });

      this.logger.log(`💹 Updated ${symbol}: ₹${lastPrice}`);
      await new Promise((res) => setTimeout(res, 1000));
    }
  }
}
