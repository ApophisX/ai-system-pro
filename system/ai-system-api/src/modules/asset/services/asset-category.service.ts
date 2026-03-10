import { Injectable, Logger, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AssetCategoryRepository } from '../repositories';
import { AssetCategoryEntity } from '../entities';
import {
  CreateAssetCategoryDto,
  UpdateAssetCategoryDto,
  QueryAssetCategoryDto,
  AppQueryAssetCategoryDto,
} from '../dto';
import { PaginationMetaDto } from '@/common/dtos/base-query.dto';

/**
 * 资产分类服务
 *
 * 提供资产分类的业务逻辑处理
 */
@Injectable()
export class AssetCategoryService {
  private readonly logger = new Logger(AssetCategoryService.name);

  constructor(
    private readonly categoryRepo: AssetCategoryRepository,
    private readonly dataSource: DataSource,
  ) {}

  // ========== App 端接口 ==========

  /**
   * 获取分类列表（App 端）
   * 用于用户界面展示分类
   */
  async getAppCategories(dto: AppQueryAssetCategoryDto): Promise<AssetCategoryEntity[]> {
    if (dto.parentId) {
      // 获取指定父分类下的子分类
      const parent = await this.categoryRepo.findById(dto.parentId);
      if (!parent) {
        throw new NotFoundException('父分类不存在');
      }

      if (dto.includeChildren) {
        // 返回包含子分类的树形结构
        const tree = await this.categoryRepo.findDescendantsTree(parent, dto.depth);
        // 过滤掉不活跃的分类
        return this.filterActiveCategories([tree])[0]?.children || [];
      } else {
        // 只返回直接子分类
        return this.categoryRepo.findByParentId(dto.parentId, true);
      }
    }

    // 获取根分类或完整树
    if (dto.includeChildren) {
      const trees = await this.categoryRepo.findTrees(true);
      return trees;
    } else {
      return this.categoryRepo.findRoots(true, dto.displayOnHome);
    }
  }

  /**
   * 获取分类树（App 端）
   * 返回完整的分类树形结构
   */
  async getAppCategoryTree(): Promise<AssetCategoryEntity[]> {
    return this.categoryRepo.findTrees(true);
  }

  /**
   * 根据分类代码获取分类信息（App 端）
   */
  async getAppCategoryByCode(code: string): Promise<AssetCategoryEntity> {
    const category = await this.categoryRepo.findByCode(code);
    if (!category || !category.isActive) {
      throw new NotFoundException('分类不存在');
    }
    return category;
  }

  // ========== Admin 端接口 ==========

  /**
   * 创建分类（Admin 端）
   */
  async create(dto: CreateAssetCategoryDto): Promise<AssetCategoryEntity> {
    // 检查分类代码是否已存在
    const exists = await this.categoryRepo.existsByCode(dto.code);
    if (exists) {
      throw new ConflictException(`分类代码已存在: ${dto.code}`);
    }

    // 创建分类实体
    const category = new AssetCategoryEntity();
    category.code = dto.code;
    category.name = dto.name;
    category.description = dto.description;
    category.icon = dto.icon;
    category.sortOrder = dto.sortOrder || 0;
    category.attributes = dto.attributes;
    category.isActive = true;

    // 设置父分类
    if (dto.parentId) {
      const parent = await this.categoryRepo.findById(dto.parentId);
      if (!parent) {
        throw new NotFoundException('父分类不存在');
      }
      category.parent = parent;
    }

    const saved = await this.categoryRepo.save(category);
    this.logger.log(`创建资产分类: ${saved.code} (${saved.id})`);

    return saved;
  }

  /**
   * 更新分类（Admin 端）
   */
  async update(id: string, dto: UpdateAssetCategoryDto): Promise<AssetCategoryEntity> {
    const category = await this.categoryRepo.findById(id);
    if (!category) {
      throw new NotFoundException('分类不存在');
    }

    // 检查新代码是否冲突
    if (dto.code && dto.code !== category.code) {
      const exists = await this.categoryRepo.existsByCodeExcludeId(dto.code, id);
      if (exists) {
        throw new ConflictException(`分类代码已存在: ${dto.code}`);
      }
      category.code = dto.code;
    }

    // 更新字段
    if (dto.name !== undefined) category.name = dto.name;
    if (dto.description !== undefined) category.description = dto.description;
    if (dto.icon !== undefined) category.icon = dto.icon;
    if (dto.sortOrder !== undefined) category.sortOrder = dto.sortOrder;
    if (dto.attributes !== undefined) category.attributes = dto.attributes;
    if (dto.isActive !== undefined) category.isActive = dto.isActive;

    // 更新父分类
    if (dto.parentId !== undefined) {
      if (dto.parentId === null) {
        // 移动到根级别
        category.parent = undefined;
      } else {
        // 检查是否形成循环引用
        if (dto.parentId === id) {
          throw new BadRequestException('不能将分类设置为自己的子分类');
        }

        const newParent = await this.categoryRepo.findById(dto.parentId);
        if (!newParent) {
          throw new NotFoundException('父分类不存在');
        }

        // 检查新父分类是否是当前分类的后代
        const descendants = await this.categoryRepo.findDescendants(category);
        if (descendants.some(d => d.id === dto.parentId)) {
          throw new BadRequestException('不能将分类移动到其子分类下');
        }

        category.parent = newParent;
      }
    }

    const saved = await this.categoryRepo.save(category);
    this.logger.log(`更新资产分类: ${saved.code} (${saved.id})`);

    return saved;
  }

  /**
   * 删除分类（Admin 端）
   */
  async delete(id: string): Promise<void> {
    const category = await this.categoryRepo.findById(id);
    if (!category) {
      throw new NotFoundException('分类不存在');
    }

    // 检查是否有子分类
    const hasChildren = await this.categoryRepo.hasChildren(id);
    if (hasChildren) {
      throw new BadRequestException('该分类下存在子分类，无法删除');
    }

    // TODO: 检查是否有关联的资产（后续实现）
    // const hasAssets = await this.assetRepo.existsByCategoryId(id);
    // if (hasAssets) {
    //   throw new BadRequestException('该分类下存在资产，无法删除');
    // }

    await this.categoryRepo.softDelete(id);
    this.logger.log(`删除资产分类: ${category.code} (${id})`);
  }

  /**
   * 获取分类详情（Admin 端）
   */
  async getById(id: string): Promise<AssetCategoryEntity> {
    const category = await this.categoryRepo.findByIdWithRelations(id);
    if (!category) {
      throw new NotFoundException('分类不存在');
    }
    return category;
  }

  /**
   * 根据分类代码获取（Admin 端）
   */
  async getByCode(code: string): Promise<AssetCategoryEntity> {
    const category = await this.categoryRepo.findByCode(code);
    if (!category) {
      throw new NotFoundException('分类不存在');
    }
    return category;
  }

  /**
   * 分页查询分类（Admin 端）
   */
  async getList(dto: QueryAssetCategoryDto): Promise<{ data: AssetCategoryEntity[]; meta: PaginationMetaDto }> {
    const [categories, total] = await this.categoryRepo.findWithPagination({
      keyword: dto.keyword,
      parentId: dto.parentId,
      isActive: dto.isActive,
      skip: dto.skip,
      take: dto.pageSize,
    });

    const meta = new PaginationMetaDto(dto.page, dto.pageSize);
    meta.total = total;

    return { data: categories, meta };
  }

  /**
   * 获取完整分类树（Admin 端）
   */
  async getTree(isActiveOnly: boolean = false): Promise<AssetCategoryEntity[]> {
    return this.categoryRepo.findTrees(isActiveOnly);
  }

  /**
   * 获取根分类列表（Admin 端）
   */
  async getRoots(isActiveOnly: boolean = false): Promise<AssetCategoryEntity[]> {
    return this.categoryRepo.findRoots(isActiveOnly);
  }

  /**
   * 获取子分类列表（Admin 端）
   */
  async getChildren(parentId: string, isActiveOnly: boolean = false): Promise<AssetCategoryEntity[]> {
    const parent = await this.categoryRepo.findById(parentId);
    if (!parent) {
      throw new NotFoundException('父分类不存在');
    }
    return this.categoryRepo.findByParentId(parentId, isActiveOnly);
  }

  /**
   * 批量更新排序
   */
  async updateSortOrder(items: Array<{ id: string; sortOrder: number }>): Promise<void> {
    await this.dataSource.transaction(async manager => {
      for (const item of items) {
        await manager.update(AssetCategoryEntity, item.id, {
          sortOrder: item.sortOrder,
        });
      }
    });
    this.logger.log(`批量更新分类排序: ${items.length} 个`);
  }

  // ========== 私有方法 ==========

  /**
   * 过滤只保留 isActive 为 true 的分类
   */
  private filterActiveCategories(categories: AssetCategoryEntity[]): AssetCategoryEntity[] {
    return categories
      .filter(c => c.isActive)
      .map(c => {
        if (c.children && c.children.length > 0) {
          c.children = this.filterActiveCategories(c.children);
        }
        return c;
      });
  }
}
