import { opentracing } from 'jaeger-client';

import { JaegerClientDbRepository } from './db-repository';
import { JaegerClientUnitOfWork } from './unit-of-work';
import { IDbFactory } from './i-db-factory';
import { ITraceable } from './i-traceable';
import { IUnitOfWorkRepository } from './i-unit-of-work-repository';

export class JaegerClientDbFactory implements IDbFactory, ITraceable<IDbFactory> {
    public constructor(
        private m_DbFactory: IDbFactory,
        private m_Tracer: opentracing.Tracer,
        private m_ParentSpan?: opentracing.Span
    ) { }

    public db<T>(model: new () => T, uow?: IUnitOfWorkRepository) {
        return new JaegerClientDbRepository<T>(
            this,
            model,
            this.m_DbFactory,
            this.m_ParentSpan,
            this.m_Tracer,
            uow,
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
