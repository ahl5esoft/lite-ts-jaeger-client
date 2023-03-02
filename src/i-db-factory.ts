import { IDbRepository } from './i-db-repository';
import { IUnitOfWork } from './i-unit-of-work';

export interface IDbFactory {
    /**
     * 创建表数据仓储
     * 
     * @param model 表模型函数
     * @param extra 其他参数,工作单元或数据库类型
     * 
     * @example
     * ```typescript
     *  const dbFactory: DbFactoryBase;
     *  
     *  // 查询所有数据
     *  const rows = await dbFactory.db(Model).query().toArray();
     * 
     *  // 单个C:add U:save D:remove
     *  dbFactory.db(Model).add({
     *     id: '主键',
     *     // 其他字段 
     *  });
     * ```
     */
    db<T>(model: new () => T, ...extra: any[]): IDbRepository<T>;

    /**
     * 创建工作单元(事务)
     * 
     * @example
     * ```typescript
     *  const dbFactory: DbFactoryBase;
     *  const uow = dbFactory.uow();
     *  dbFactory.db(Model).add(...);
     *  dbFactory.db(Model).save(...);
     *  dbFactory.db(Model).remove(...);
     *  ...
     *  await uow.commit();
     * ```
     */
    uow(): IUnitOfWork;
}
