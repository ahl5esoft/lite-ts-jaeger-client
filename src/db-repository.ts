import { opentracing } from 'jaeger-client';

import { JaegerClientDbQuery } from './db-query';
import { IDbFactory } from './i-db-factory';
import { IDbRepository } from './i-db-repository';
import { IUnitOfWorkRepository } from './i-unit-of-work-repository';

type regiterAction = (model: Function, entry: any) => void;

export class JaegerClientDbRepository<T> implements IDbRepository<T> {
    /**
     * 是否有事务
     */
    private m_IsTx = true;

    /**
     * 工作单元
     */
    private get uow() {
        if (!this.m_Uow) {
            this.m_Uow = this.m_JaegerDbFactory.uow() as IUnitOfWorkRepository;
            this.m_IsTx = false;
        }

        return this.m_Uow;
    }

    private m_Repo: IDbRepository<T>;
    protected get repo() {
        if (!this.m_Repo)
            this.m_Repo = this.m_OriginDbFactory.db(this.m_Model, this.uow);

        return this.m_Repo;
    }

    public constructor(
        private m_JaegerDbFactory: IDbFactory,
        private m_Model: new () => T,
        private m_OriginDbFactory: IDbFactory,
        private m_ParentTracerSpan: opentracing.Span,
        private m_Tracer: opentracing.Tracer,
        private m_Uow: IUnitOfWorkRepository,
    ) { }

    /**
     * 新增
     * 
     * @param entry 实体
     */
    public async add(entry: T) {
        await this.exec(this.uow.registerAdd, entry);
    }

    /**
     * 删除
     * 
     * @param entry 实体
     */
    public async remove(entry: T) {
        await this.exec(this.uow.registerRemove, entry);
    }

    /**
     * 更新
     * 
     * @param entry 实体
     */
    public async save(entry: T) {
        await this.exec(this.uow.registerSave, entry);
    }

    /**
     * 创建数据库查询
     */
    public query() {
        return new JaegerClientDbQuery<T>(
            this.repo.query(),
            this.m_Model.name,
            this.m_Tracer,
            this.m_ParentTracerSpan,
        );
    }

    /**
     * 执行方法, 如果不存在事务则直接提交
     * 
     * @param action 方法
     * @param entry 实体
     */
    private async exec(action: regiterAction, entry: any) {
        action.bind(this.uow)(this.m_Model, entry);
        if (this.m_IsTx)
            return;

        await this.uow.commit();
    }
}