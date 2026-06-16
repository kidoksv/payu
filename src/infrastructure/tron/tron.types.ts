export interface Trc20Transfer {
  txid: string;
  fromAddress: string;
  toAddress: string;
  amount: string;
  blockNumber?: number;
  blockTimestamp?: Date;
  raw: unknown;
}
