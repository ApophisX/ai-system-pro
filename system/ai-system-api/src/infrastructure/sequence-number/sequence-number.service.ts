/**
 * 序列号生成服务
 *
 * 基于 Redis 的分布式序列号生成服务
 * - 24位纯数字序列号
 * - 格式：日期(8位YYYYMMDD) + 混淆后的自增序列(16位)
 * - 使用 Redis INCR 实现分布式自增
 * - 按天重置序列，避免序列过大
 * - 支持不同业务类型，每种业务类型有独立的序列
 * - 使用混淆算法打乱序列号，避免被推测业务量
 */

import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '@/infrastructure/redis/redis.service';
import { SequenceNumberType } from './sequence-number.enum';

/**
 * 序列号生成配置
 */
const SEQUENCE_NUMBER_CONFIG = {
  /** Redis Key 前缀 */
  REDIS_KEY_PREFIX: 'sequence:number:',
  /** 序列号长度（16位） */
  SEQUENCE_LENGTH: 16,
  /** 序列号总长度（24位） */
  TOTAL_LENGTH: 24,
  /** 序列号起始值 */
  SEQUENCE_START: 1,
  /** 默认业务类型 */
  DEFAULT_BUSINESS_TYPE: SequenceNumberType.PAYMENT,
  /** 混淆算法使用的质数（确保与最大序列号互质） */
  OBFUSCATION_PRIME: 99194853094755497n, // 大质数，用于乘法混淆
  /** 混淆算法使用的偏移量 */
  OBFUSCATION_XOR: 0x5a5a5a5a5a5a5a5an, // XOR 混淆常量
} as const;

/**
 * 生成序列号选项
 */
export interface GenerateSequenceNumberOptions {
  /** 业务类型（用于区分不同业务，如：order、payment、refund等） */
  businessType?: SequenceNumberType;
  totalLength?: number;
  prefix?: string;
}

@Injectable()
export class SequenceNumberService {
  private readonly logger = new Logger(SequenceNumberService.name);

  constructor(private readonly redisService: RedisService) {
    //
  }

  /**
   * 生成序列号
   * @param options 生成选项
   * @returns 24位纯数字序列号
   */
  async generate(options?: GenerateSequenceNumberOptions): Promise<string> {
    try {
      const businessType = options?.businessType || SEQUENCE_NUMBER_CONFIG.DEFAULT_BUSINESS_TYPE;
      const dateStr = this.getDateString();
      const prefix = options?.prefix || '';
      const sequence = await this.getNextSequence(businessType, dateStr);

      const totalLength = options?.totalLength || SEQUENCE_NUMBER_CONFIG.TOTAL_LENGTH;

      // 对序列号进行混淆，避免被推测业务量
      const obfuscatedSequence = this.obfuscateNumber(BigInt(sequence), SEQUENCE_NUMBER_CONFIG.SEQUENCE_LENGTH);

      // 格式化：日期(8位) + 混淆后的序列号(16位，不足左侧补0) = 24位
      const sequenceNumber = `${prefix}${dateStr}${obfuscatedSequence
        .toString()
        .padStart(SEQUENCE_NUMBER_CONFIG.SEQUENCE_LENGTH, '0')}`;

      // 验证长度
      if (sequenceNumber.length - prefix.length !== totalLength) {
        this.logger.error(
          `Generated sequence number length mismatch: ${sequenceNumber.length}, expected: ${totalLength}`,
        );
        throw new Error('序列号长度不正确');
      }

      this.logger.debug(`Generated sequence number: ${sequenceNumber}, businessType: ${businessType}`);
      return sequenceNumber;
    } catch (error) {
      this.logger.error('Failed to generate sequence number', error);
      throw error;
    }
  }

  /**
   * 获取日期字符串（YYYYMMDD格式，8位）
   */
  private getDateString(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }

  /**
   * 混淆数字（可逆混淆算法）
   *
   * 使用基于乘法和 XOR 的混淆算法打乱数字序列：
   * 1. 先进行 XOR 混淆（打乱低位模式）
   * 2. 乘以大质数（打乱数字分布）
   * 3. 取模确保在范围内
   *
   * 该算法保证：
   * - 唯一性：不同的输入产生不同的输出（基于乘法和模运算的性质）
   * - 不可推测性：输出看起来是随机的，无法从序列号推测业务量
   * - 均匀分布：混淆后的数字在范围内均匀分布
   *
   * @param number 原始数字
   * @param maxDigits 最大位数（用于确定模数）
   * @returns 混淆后的数字
   */
  private obfuscateNumber(number: bigint, maxDigits: number): bigint {
    // 计算模数（例如16位模数为 10000000000000000）
    const modulus = 10n ** BigInt(maxDigits);

    // 第一步：XOR 混淆（打乱数字的低位模式）
    let obfuscated = number ^ SEQUENCE_NUMBER_CONFIG.OBFUSCATION_XOR;

    // 第二步：乘法混淆（乘以大质数后取模，打乱数字分布）
    // 使用大质数确保乘法操作具有良好的混淆效果
    obfuscated = (obfuscated * SEQUENCE_NUMBER_CONFIG.OBFUSCATION_PRIME) % modulus;

    // 确保结果在有效范围内
    // 如果为0且原始数字不为0，则使用备选混淆方案（极少数情况）
    if (obfuscated === 0n && number !== 0n) {
      // 备选方案：使用不同的混淆参数
      const altPrime = 12345678901234567n;
      obfuscated = ((number ^ SEQUENCE_NUMBER_CONFIG.OBFUSCATION_XOR) * altPrime) % modulus;
      // 如果仍然为0，使用原始数字（理论上几乎不会发生）
      if (obfuscated === 0n) {
        obfuscated = number;
      }
    }

    return obfuscated;
  }

  /**
   * 获取下一个序列号
   * @param businessType 业务类型
   * @param dateStr 日期字符串（YYYYMMDD）
   * @returns 序列号
   */
  private async getNextSequence(businessType: SequenceNumberType, dateStr: string): Promise<number> {
    const key = `${SEQUENCE_NUMBER_CONFIG.REDIS_KEY_PREFIX}${businessType}:${dateStr}`;
    const client = this.redisService.getClient();

    try {
      // 使用 INCR 原子性自增
      const sequence = await client.incr(key);

      // 如果是新创建的键，设置过期时间为25小时（确保跨天时不会立即过期）
      if (sequence === SEQUENCE_NUMBER_CONFIG.SEQUENCE_START) {
        await client.expire(key, 25 * 60 * 60); // 25小时
      }

      // 检查序列号是否超出范围（16位最大值为 9999999999999999）
      const maxSequence = 10 ** SEQUENCE_NUMBER_CONFIG.SEQUENCE_LENGTH - 1;
      if (sequence > maxSequence) {
        this.logger.error(`Sequence number overflow: ${sequence}, max: ${maxSequence}, businessType: ${businessType}`);
        throw new Error('序列号超出范围，请联系管理员');
      }

      return sequence;
    } catch (error) {
      this.logger.error(`Failed to get next sequence for key: ${key}`, error);
      throw error;
    }
  }
}
