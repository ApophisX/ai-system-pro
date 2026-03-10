/**
 * 事务管理器
 *
 * 管理数据库事务的生命周期
 * - 支持简化的事务执行
 * - 支持手动事务控制
 * - 支持嵌套事务（savepoint）
 */

import { Injectable, Logger } from '@nestjs/common';
import { DataSource, EntityManager, QueryRunner } from 'typeorm';

/**
 * 事务隔离级别
 */
export enum IsolationLevel {
  READ_UNCOMMITTED = 'READ UNCOMMITTED',
  READ_COMMITTED = 'READ COMMITTED',
  REPEATABLE_READ = 'REPEATABLE READ',
  SERIALIZABLE = 'SERIALIZABLE',
}

/**
 * 事务选项
 */
export interface TransactionOptions {
  /** 事务隔离级别 */
  isolationLevel?: IsolationLevel;
}

@Injectable()
export class TransactionManager {
  private readonly logger = new Logger(TransactionManager.name);

  constructor(private readonly dataSource: DataSource) {}

  /**
   * 在事务中执行操作（推荐方式）
   *
   * @param operation 事务操作函数
   * @param options 事务选项
   * @returns 操作结果
   *
   * @example
   * ```typescript
   * const result = await this.transactionManager.runInTransaction(async (manager) => {
   *   const order = await manager.save(OrderEntity, orderData);
   *   await manager.update(AssetEntity, assetId, { status: 'occupied' });
   *   return order;
   * });
   * ```
   */
  async runInTransaction<T>(
    operation: (manager: EntityManager) => Promise<T>,
    options?: TransactionOptions,
  ): Promise<T> {
    if (options?.isolationLevel) {
      return this.runWithIsolationLevel(operation, options.isolationLevel);
    }

    return this.dataSource.transaction(operation);
  }

  /**
   * 使用指定隔离级别执行事务
   */
  private async runWithIsolationLevel<T>(
    operation: (manager: EntityManager) => Promise<T>,
    isolationLevel: IsolationLevel,
  ): Promise<T> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction(isolationLevel);

    try {
      const result = await operation(queryRunner.manager);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 创建 QueryRunner 用于手动事务控制
   *
   * @returns QueryRunner 实例
   *
   * @example
   * ```typescript
   * const queryRunner = await this.transactionManager.createQueryRunner();
   * await queryRunner.startTransaction();
   * try {
   *   await queryRunner.manager.save(OrderEntity, order);
   *   await queryRunner.commitTransaction();
   * } catch (error) {
   *   await queryRunner.rollbackTransaction();
   *   throw error;
   * } finally {
   *   await queryRunner.release();
   * }
   * ```
   */
  async createQueryRunner(): Promise<QueryRunner> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    return queryRunner;
  }

  /**
   * 使用 QueryRunner 执行事务（带自动清理）
   *
   * @param operation 事务操作函数
   * @returns 操作结果
   */
  async executeWithQueryRunner<T>(operation: (queryRunner: QueryRunner) => Promise<T>): Promise<T> {
    const queryRunner = await this.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      const result = await operation(queryRunner);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Transaction failed, rolled back', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 在事务中执行批量操作
   *
   * @param operations 操作数组
   * @param batchSize 批次大小
   */
  async batchInTransaction<T, R>(
    items: T[],
    operation: (manager: EntityManager, item: T) => Promise<R>,
    batchSize: number = 100,
  ): Promise<R[]> {
    const results: R[] = [];

    // 分批处理
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);

      const batchResults = await this.runInTransaction(async manager => {
        const batchPromises = batch.map(item => operation(manager, item));
        return Promise.all(batchPromises);
      });

      results.push(...batchResults);
    }

    return results;
  }

  /**
   * 获取 EntityManager（用于需要直接访问的场景）
   */
  getManager(): EntityManager {
    return this.dataSource.manager;
  }

  /**
   * 获取 DataSource
   */
  getDataSource(): DataSource {
    return this.dataSource;
  }
}
