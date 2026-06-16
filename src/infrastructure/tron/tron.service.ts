import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { createHash } from 'crypto';
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

interface TronGridEventItem {
  transaction_id?: string;
  event_name?: string;
  contract_address?: string;
  result?: Record<string, string>;
  block_number?: number;
  block_timestamp?: number;
}

@Injectable()
export class TronService {
  private readonly logger = new Logger(TronService.name);
  private readonly http: AxiosInstance;

  constructor(private readonly config: ConfigService) {
    const apiKey = config.get<string>('tronGridApiKey') || config.get<string>('TRONGRID_API_KEY') || '';
    this.http = axios.create({
      baseURL: config.get<string>('tronFullHost') || config.get<string>('TRON_FULL_HOST') || 'https://api.trongrid.io',
      timeout: 10_000,
      headers: apiKey ? { 'TRON-PRO-API-KEY': apiKey } : {}
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

  async getUsdtTransferByTxid(txid: string): Promise<Trc20Transfer | null> {
    const contract = this.normalizeAddress(this.config.get<string>('usdtContract') || '');
    const res = await this.http.get(`/v1/transactions/${txid}/events`, {
      params: { only_confirmed: true, limit: 200 }
    });
    const data: TronGridEventItem[] = Array.isArray(res.data?.data) ? res.data.data : [];
    const transfer = data.find((item) => {
      const eventName = String(item.event_name || '').toLowerCase();
      const itemContract = this.normalizeAddress(item.contract_address || '');
      return eventName === 'transfer' && itemContract === contract;
    });
    if (!transfer?.result) return null;

    const from = this.normalizeAddress(transfer.result.from || transfer.result._from || '');
    const to = this.normalizeAddress(transfer.result.to || transfer.result._to || '');
    const value = transfer.result.value || transfer.result._value;
    if (!from || !to || !value) return null;

    return {
      txid,
      fromAddress: from,
      toAddress: to,
      amount: new Decimal(value).div(new Decimal(10).pow(6)).toFixed(6),
      blockNumber: transfer.block_number,
      blockTimestamp: transfer.block_timestamp ? new Date(Number(transfer.block_timestamp)) : undefined,
      raw: transfer
    };
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

  private normalizeAddress(address: string) {
    const trimmed = String(address || '').trim();
    if (!trimmed) return '';
    if (/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(trimmed)) return trimmed;
    const hex = trimmed.toLowerCase().replace(/^0x/, '');
    if (/^[0-9a-f]{40}$/.test(hex)) return this.tronHexToBase58(`41${hex}`);
    if (/^41[0-9a-f]{40}$/.test(hex)) return this.tronHexToBase58(hex);
    return trimmed;
  }

  private tronHexToBase58(hexAddress: string) {
    const payload = Buffer.from(hexAddress, 'hex');
    const checksum = createHash('sha256').update(createHash('sha256').update(payload).digest()).digest().subarray(0, 4);
    return this.base58Encode(Buffer.concat([payload, checksum]));
  }

  private base58Encode(bytes: Buffer) {
    const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let value = BigInt(`0x${bytes.toString('hex')}`);
    let output = '';
    while (value > 0n) {
      const mod = Number(value % 58n);
      output = alphabet[mod] + output;
      value /= 58n;
    }
    for (const byte of bytes) {
      if (byte !== 0) break;
      output = alphabet[0] + output;
    }
    return output || alphabet[0];
  }
}
