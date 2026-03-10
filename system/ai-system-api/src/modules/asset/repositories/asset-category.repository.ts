import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TreeRepository, DataSource, Not, IsNull } from 'typeorm';
import { AssetCategoryEntity } from '../entities';

/**
 * 资产分类仓储
 *
 * 负责资产分类的数据访问操作
 * 使用 TypeORM Tree Repository 支持树形结构操作
 */
@Injectable()
export class AssetCategoryRepository {
  private readonly treeRepo: TreeRepository<AssetCategoryEntity>;

  constructor(
    @InjectRepository(AssetCategoryEntity)
    private readonly repo: Repository<AssetCategoryEntity>,
    private readonly dataSource: DataSource,
  ) {
    this.treeRepo = this.dataSource.getTreeRepository(AssetCategoryEntity);
  }
  /**
   * 清空所有分类
   */
  async deleteAll(): Promise<void> {
    await this.repo.delete({
      parent: {
        id: IsNull(),
      },
    });
  }

  /**
   * 保存分类
   */
  async save(category: AssetCategoryEntity): Promise<AssetCategoryEntity> {
    return this.repo.save(category);
  }

  /**
   * 根据 ID 查找分类
   */
  async findById(id: string): Promise<AssetCategoryEntity> {
    const category = await this.repo.findOne({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException('分类不存在');
    }
    return category;
  }

  /**
   * 根据 ID 查找分类（包含父分类和子分类）
   */
  async findByIdWithRelations(id: string): Promise<AssetCategoryEntity | null> {
    const category = await this.repo.findOne({
      where: { id },
    });

    if (!category) return null;

    // 获取父分类
    const parent = await this.treeRepo.findAncestors(category, {
      depth: 1,
    });
    if (parent.length > 1) {
      category.parent = parent[1]; // 第一个是自己，第二个是父节点
    }

    // 获取直接子分类
    const children = await this.treeRepo.findDescendants(category, {
      depth: 1,
    });
    category.children = children.filter(c => c.id !== category.id);

    return category;
  }

  /**
   * 根据分类代码查找
   */
  async findByCode(code: string): Promise<AssetCategoryEntity | null> {
    return this.repo.findOne({
      where: { code },
    });
  }

  /**
   * 检查分类代码是否存在
   */
  async existsByCode(code: string): Promise<boolean> {
    const count = await this.repo.count({ where: { code } });
    return count > 0;
  }

  /**
   * 检查分类代码是否存在（排除指定 ID）
   */
  async existsByCodeExcludeId(code: string, excludeId: string): Promise<boolean> {
    const category = await this.repo.findOne({
      where: { code },
    });
    return category !== null && category.id !== excludeId;
  }

  /**
   * 获取所有根分类（无父分类）
   */
  async findRoots(isActiveOnly: boolean = true, displayOnHome?: boolean): Promise<AssetCategoryEntity[]> {
    const roots = await this.treeRepo.findRoots();

    let list: AssetCategoryEntity[] = [];
    if (isActiveOnly) {
      list = roots.filter(r => r.isActive);
    }
    if (displayOnHome) {
      list = list.filter(r => r.displayOnHome);
    }
    return list.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  /**
   * 获取完整的分类树
   */
  async findTrees(isActiveOnly: boolean = true): Promise<AssetCategoryEntity[]> {
    const trees = await this.treeRepo.findTrees();
    if (isActiveOnly) {
      return this.filterActiveCategories(trees);
    }
    return trees;
  }

  /**
   * 获取指定分类的所有后代
   */
  async findDescendants(category: AssetCategoryEntity, depth?: number): Promise<AssetCategoryEntity[]> {
    return this.treeRepo.findDescendants(category, { depth });
  }

  /**
   * 获取指定分类的后代树
   */
  async findDescendantsTree(category: AssetCategoryEntity, depth?: number): Promise<AssetCategoryEntity> {
    return this.treeRepo.findDescendantsTree(category, { depth });
  }

  /**
   * 获取指定分类的所有祖先
   */
  async findAncestors(category: AssetCategoryEntity): Promise<AssetCategoryEntity[]> {
    return this.treeRepo.findAncestors(category);
  }

  /**
   * 获取指定父分类下的直接子分类
   */
  async findByParentId(
    parentId: string | null,
    isActiveOnly: boolean = true,
    displayOnHome: boolean = false,
  ): Promise<AssetCategoryEntity[]> {
    const queryBuilder = this.repo.createQueryBuilder('category');

    if (parentId === null) {
      // 查询根分类
      queryBuilder.where('category.parent IS NULL');
    } else {
      queryBuilder.innerJoin('category.parent', 'parent').where('parent.id = :parentId', { parentId });
    }

    if (isActiveOnly) {
      queryBuilder.andWhere('category.isActive = :isActive', {
        isActive: true,
      });
    }

    if (displayOnHome) {
      queryBuilder.andWhere('category.displayOnHome = :displayOnHome', {
        displayOnHome: true,
      });
    }

    queryBuilder.orderBy('category.sortOrder', 'DESC');
    queryBuilder.addOrderBy('category.createdAt', 'ASC');

    return queryBuilder.getMany();
  }

  /**
   * 分页查询分类
   */
  async findWithPagination(options: {
    keyword?: string;
    parentId?: string;
    isActive?: boolean;
    skip: number;
    take: number;
  }): Promise<[AssetCategoryEntity[], number]> {
    const queryBuilder = this.repo.createQueryBuilder('category');

    // 关键字搜索
    if (options.keyword) {
      queryBuilder.andWhere('(category.name LIKE :keyword OR category.code LIKE :keyword)', {
        keyword: `%${options.keyword}%`,
      });
    }

    // 父分类过滤
    if (options.parentId === 'root') {
      queryBuilder.andWhere('category.parent IS NULL');
    } else if (options.parentId) {
      queryBuilder
        .innerJoin('category.parent', 'parent')
        .andWhere('parent.id = :parentId', { parentId: options.parentId });
    }

    // 状态过滤
    if (options.isActive !== undefined) {
      queryBuilder.andWhere('category.isActive = :isActive', {
        isActive: options.isActive,
      });
    }

    queryBuilder.orderBy('category.sortOrder', 'DESC');
    queryBuilder.addOrderBy('category.createdAt', 'DESC');

    queryBuilder.skip(options.skip);
    queryBuilder.take(options.take);

    return queryBuilder.getManyAndCount();
  }

  /**
   * 更新分类（仅更新非 JSON 类型字段）
   */
  async update(
    id: string,
    data: Partial<Omit<AssetCategoryEntity, 'attributes' | 'parent' | 'children' | 'assets'>>,
  ): Promise<void> {
    await this.repo.update(id, data);
  }

  /**
   * 软删除分类
   */
  async softDelete(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }

  /**
   * 统计子分类数量
   */
  async countChildren(parentId: string): Promise<number> {
    const parent = await this.findById(parentId);
    if (!parent) return 0;

    const descendants = await this.treeRepo.findDescendants(parent, {
      depth: 1,
    });
    return descendants.length - 1; // 减去自己
  }

  /**
   * 检查分类是否有子分类
   */
  async hasChildren(categoryId: string): Promise<boolean> {
    const count = await this.countChildren(categoryId);
    return count > 0;
  }

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
