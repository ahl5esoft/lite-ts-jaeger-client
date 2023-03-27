import { opentracing } from 'jaeger-client';
import { DbFactoryBase, DbModel, DbOption, IUnitOfWorkRepository } from 'lite-ts-db';

import { JaegerClientDbRepository } from './db-repository';
import { ITraceable } from './i-traceable';
import { JaegerClientUnitOfWork } from './unit-of-work';

export class JaegerClientDbFactory extends DbFactoryBase implements ITraceable<DbFactoryBase> {
    public constructor(
        private m_DbFactory: DbFactoryBase,
        private m_Tracer: opentracing.Tracer,
        private m_ParentSpan?: opentracing.Span
    ) {
        super();
    }

    public db<T extends DbModel>(...dbOptions: DbOption[]) {
        const dbRepository = this.m_DbFactory.db<T>(...dbOptions);

        return new JaegerClientDbRepository<T>(
            dbRepository,
            this.m_Tracer,
            this.m_ParentSpan
        );
    }

    public uow() {
        return new JaegerClientUnitOfWork(
            this.m_DbFactory.uow() as IUnitOfWorkRepository,
            this.m_ParentSpan,
            this.m_Tracer,
        );
    }

    public withTrace(parentSpan: opentracing.Span) {
        return parentSpan ? new JaegerClientDbFactory(
            this.m_DbFactory,
            this.m_Tracer,
            parentSpan
        ) : this.m_DbFactory;
    }
}
