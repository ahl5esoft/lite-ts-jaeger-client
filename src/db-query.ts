import { opentracing } from 'jaeger-client';
import { DbQueryOption, IDbQuery } from 'lite-ts-db';
import { ITracerSpan, TracerBase } from 'lite-ts-tracer';

export class JaegerClientDbQuery<T> implements IDbQuery<T> {
    private m_TracerSpan: ITracerSpan;

    public constructor(
        private m_DbQuery: IDbQuery<T>,
        private m_Table: string,
        private m_Tracer: TracerBase,
        parentTracerSpan: ITracerSpan,
    ) {
        this.m_TracerSpan = parentTracerSpan ? this.m_Tracer?.startSpan('db.query', {
            childOf: parentTracerSpan,
            tags: {
                table: this.m_Table
            }
        }) : null;
    }

    public async count(where?: any) {
        try {
            if (where) {
                this.m_TracerSpan?.log?.({
                    where
                });
            }

            const res = await this.m_DbQuery.count(where);

            this.m_TracerSpan?.log?.({
                result: res
            });

            return res;
        } catch (ex) {
            this.m_TracerSpan?.log?.({
                err: ex
            })?.setTag?.(opentracing.Tags.ERROR, true);

            throw ex;
        } finally {
            this.m_TracerSpan?.setTag?.(opentracing.Tags.DB_STATEMENT, 'count')?.finish?.();
        }
    }

    public async toArray(v?: Partial<DbQueryOption<any>>) {
        try {
            if (v)
                this.m_TracerSpan?.log?.(v);

            const res = await this.m_DbQuery.toArray(v);

            this.m_TracerSpan?.log?.({
                result: res
            });

            return res;
        } catch (ex) {
            this.m_TracerSpan?.log?.({
                err: ex
            })?.setTag?.(opentracing.Tags.ERROR, true);

            throw ex;
        } finally {
            this.m_TracerSpan?.setTag?.(opentracing.Tags.DB_STATEMENT, 'toArray')?.finish?.();
        }
    }
}