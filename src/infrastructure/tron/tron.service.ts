import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import Decimal from 'decimal.js';
import { Trc20Transfer } from './tron.types';

interface TronGridTrc20Item {
  transaction_id: string;
  from: string;
  to: string;
  value: string;
  block_number?: number;
  block_timestamp?: number;
  token_info?: { decimals?: number | string };
}

@Injectable()
export class TronService {
  private readonly logger = new Logger(TronService.name);
  private readonly http: AxiosInstance;

  constructor(private readonly config: ConfigService) {
    this.http = axios.create({
      baseURL: config.get<string>('TRON_FULL_HOST') || 'https://api.trongrid.io',
      timeout: 10_000,
      headers: config.get<string>('TRONGRID_API_KEY') ? { 'TRON-PRO-API-KEY': config.get<string>('TRONGRID_API_KEY') } : {}
    });
  }

  async getUsdtTransfers(address: string, minTimestamp?: number): Promise<Trc20Transfer[]> {
    const contract = this.config.get<string>('usdtContract');
    const params: Record<string, string | number | boolean> = {
      only_confirmed: true,
      limit: 200,
      contract_address: contract || '',
      order_by: 'block_timestamp,desc'
    };
    if (minTimestamp) params.min_timestamp = minTimestamp;
    const res = await this.http.get(`/v1/accounts/${address}/transactions/trc20`, { params });
    const data: TronGridTrc20Item[] = Array.isArray(res.data?.data) ? res.data.data : [];
    return data
      .filter((item) => String(item.to || '').toLowerCase() === address.toLowerCase())
      .map((item) => {
        const decimals = Number(item.token_info?.decimals || 6);
        return {
          txid: item.transaction_id,
          fromAddress: item.from,
          toAddress: item.to,
          amount: new Decimal(item.value).div(new Decimal(10).pow(decimals)).toFixed(6),
          blockNumber: item.block_number,
          blockTimestamp: item.block_timestamp ? new Date(Number(item.block_timestamp)) : undefined,
          raw: item
        };
      });
  }

  async getCurrentBlock(): Promise<number> {
    try {
      const res = await this.http.get('/wallet/getnowblock');
      return Number(res.data?.block_header?.raw_data?.number || 0);
    } catch (err) {
      this.logger.warn(`getCurrentBlock failed: ${(err as Error).message}`);
      return 0;
    }
  }
}
