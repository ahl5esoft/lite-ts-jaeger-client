import { opentracing } from 'jaeger-client';

import { IUnitOfWorkRepository } from './i-unit-of-work-repository';

enum Action {
    delete = 'remove',
    insert = 'add',
    update = 'save',
}

export class JaegerClientUnitOfWork implements IUnitOfWorkRepository {
    /**
     * 提交后函数
     */
    private m_AfterAction: { [key: string]: () => Promise<void>; } = {};

    private m_Queue: {
        action: Action;
        entry: any;
        model: new () => any;
    }[] = [];

    public constructor(
        private m_Uow: IUnitOfWorkRepository,
        private m_ParentTracerSpan: opentracing.Span,
        private m_Tracer: opentracing.Tracer,
    ) { }

    /**
     * 提交
     */
    public async commit() {
        try {
            await this.onCommit();
        } finally {
            const tasks = Object.values(this.m_AfterAction).map(r => {
                return r();
            });
            await Promise.all(tasks);
        }
    }

    /**
     * 注册提交后函数
     * 
     * @param action 函数
     * @param key 键
     */
    public registerAfter(action: () => Promise<void>, key?: string) {
        key ??= `key-${Object.keys(this.m_AfterAction).length}`;
        this.m_AfterAction[key] = action;
    }

    public registerAdd<T>(model: new () => T, entry: T) {
        this.m_Queue.push({
            action: Action.insert,
            entry,
            model
        });
    }

    public registerRemove<T>(model: new () => T, entry: T) {
        this.m_Queue.push({
            action: Action.delete,
            entry,
            model
        });
    }

    public registerSave<T>(model: new () => T, entry: T) {
        this.m_Queue.push({
            action: Action.update,
            entry,
            model
        });
    }

    protected async onCommit() {
        if (!this.m_Queue.length)
            return;

        const tracerSpan = this.m_ParentTracerSpan ? this.m_Tracer.startSpan('db.uow', {
            childOf: this.m_ParentTracerSpan
        }) : null;

        tracerSpan?.setTag?.(opentracing.Tags.DB_STATEMENT, 'commit');

        try {
            for (const r of this.m_Queue) {
                switch (r.action) {
                    case Action.delete:
                        this.m_Uow.registerRemove(r.model, r.entry);
                        break;
                    case Action.insert:
                        this.m_Uow.registerAdd(r.model, r.entry);
                        break;
                    case Action.update:
                        this.m_Uow.registerSave(r.model, r.entry);
                        break;
                }

                tracerSpan?.log?.({
                    action: 'save',
                    entry: r.entry,
                    table: r.model.name
                });
            }

            await this.m_Uow.commit();
        } catch (ex) {
            tracerSpan?.log?.({
                err: ex
            })?.setTag?.(opentracing.Tags.ERROR, true);

            throw ex;
        } finally {
            this.m_Queue = [];
            tracerSpan?.finish?.();
        }
    }
}