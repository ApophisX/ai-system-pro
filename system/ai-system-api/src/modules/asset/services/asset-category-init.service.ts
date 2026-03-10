import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AssetCategoryRepository } from '../repositories';
import { AssetCategoryEntity } from '../entities';
import { ASSET_CATEGORIES } from '../data/init-asset-category.data';

/**
 * 资产分类初始化服务
 *
 * 用于初始化资产分类数据到数据库
 */
@Injectable()
export class AssetCategoryInitService {
  private readonly logger = new Logger(AssetCategoryInitService.name);

  constructor(
    private readonly categoryRepo: AssetCategoryRepository,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 初始化分类数据
   * @param force 是否强制重新初始化（会删除已存在的分类）
   */
  async init(force: boolean = false): Promise<void> {
    this.logger.log('开始初始化资产分类数据...');
    this.logger.log(force);

    // 检查是否已有数据
    const existingRoots = await this.categoryRepo.findRoots(true);
    if (existingRoots.length > 0) {
      if (force) {
        this.logger.warn('强制重新初始化模式');
        await this.categoryRepo.deleteAll();
      } else {
        this.logger.log(
          `数据库中已存在 ${existingRoots.length} 个根分类，跳过初始化。如需重新初始化，请使用 force=true`,
        );
        return;
      }
    }

    try {
      await this.dataSource.transaction(async manager => {
        const treeRepo = manager.getTreeRepository(AssetCategoryEntity);
        const savedCategories = new Map<string, AssetCategoryEntity>();

        // 第一步：创建所有父分类
        for (let i = 0; i < ASSET_CATEGORIES.length; i++) {
          const categoryData = ASSET_CATEGORIES[i];
          const parentCategory = new AssetCategoryEntity();
          parentCategory.code = categoryData.code.trim();
          parentCategory.name = categoryData.name;
          parentCategory.icon = categoryData.icon || '';
          parentCategory.sortOrder = ASSET_CATEGORIES.length - i; // 倒序排列，第一个最大
          parentCategory.isActive = categoryData.isActive || false;
          parentCategory.displayOnHome = categoryData.displayOnHome || false;
          parentCategory.sortOrder = categoryData.sortOrder || 0;
          const savedParent = await treeRepo.save(parentCategory);
          savedCategories.set(categoryData.code, savedParent);
          this.logger.log(`创建父分类: ${savedParent.name} (${savedParent.code})`);
        }

        // 第二步：创建所有子分类并建立父子关系
        for (const categoryData of ASSET_CATEGORIES) {
          const parent = savedCategories.get(categoryData.code);
          if (!parent || !categoryData.subCategories) {
            continue;
          }

          for (let j = 0; j < categoryData.subCategories.length; j++) {
            const subCategoryData = categoryData.subCategories[j];
            const subCategory = new AssetCategoryEntity();
            subCategory.code = `${categoryData.code.trim()}_${subCategoryData.code.trim()}`;
            subCategory.name = subCategoryData.name;
            subCategory.icon = subCategoryData.icon || '';
            subCategory.sortOrder = categoryData.subCategories.length - j; // 倒序排列
            subCategory.isActive = subCategoryData.isActive || false;
            subCategory.parent = parent; // 设置父分类
            subCategory.displayOnHome = subCategoryData.displayOnHome || false;
            subCategory.sortOrder = subCategoryData.sortOrder || 0;
            const savedSub = await treeRepo.save(subCategory);
            this.logger.log(`创建子分类: ${savedSub.name} (${savedSub.code}) -> 父分类: ${parent.name}`);
          }
        }
      });

      this.logger.log('资产分类数据初始化完成！');
    } catch (error) {
      this.logger.error('初始化资产分类数据失败', error);
      throw error;
    }
  }

  /**
   * 检查初始化状态
   */
  async checkStatus(): Promise<{
    hasData: boolean;
    rootCount: number;
    totalCount: number;
  }> {
    const roots = await this.categoryRepo.findRoots(false);
    const allTrees = await this.categoryRepo.findTrees(false);

    // 统计总数（包括所有层级）
    const countTotal = (categories: AssetCategoryEntity[]): number => {
      let count = categories.length;
      categories.forEach(cat => {
        if (cat.children && cat.children.length > 0) {
          count += countTotal(cat.children);
        }
      });
      return count;
    };

    const totalCount = countTotal(allTrees);

    return {
      hasData: roots.length > 0,
      rootCount: roots.length,
      totalCount,
    };
  }
}
