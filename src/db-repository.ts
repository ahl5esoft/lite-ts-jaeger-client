import { opentracing } from 'jaeger-client';
import { DbModel, DbRepository, IDbRepository } from 'lite-ts-db';

import { JaegerClientDbQuery } from './db-query';

export class JaegerClientDbRepository<T extends DbModel> implements IDbRepository<T> {
    public constructor(
        private m_DbRepository: IDbRepository<T>,
        private m_ParentTracerSpan?: opentracing.Span
    ) { }

    public async add(entry: T) {
        await this.m_DbRepository.add(entry);
    }

    public async remove(entry: T) {
        await this.m_DbRepository.remove(entry);
    }

    public async save(entry: T) {
        await this.m_DbRepository.save(entry);
    }

    public query() {
        const query = this.m_DbRepository.query();
        return new JaegerClientDbQuery<T>(query, (this.m_DbRepository as DbRepository<T>).model, this.m_ParentTracerSpan);
    }
}