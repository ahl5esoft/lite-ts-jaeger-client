import { opentracing } from 'jaeger-client';
import { ITracerSpan } from 'lite-ts-tracer';

export type FinishPredicate = (name: string, tags: { [key: string]: any; }) => Promise<boolean>;

export class Span implements ITracerSpan {
    private m_Tags: { [key: string]: any; } = {};

    public constructor(
        private m_Name: string,
        private m_Span: opentracing.Span,
        private m_FinishPredicate?: FinishPredicate
    ) { }

    public toString() {
        return this.m_Span.context().toString();
    }

    public setTag(key: string, value: any) {
        this.m_Tags[key] = value;
        this.m_Span.setTag(key, value);
        return this;
    }

    public log(keyValuePairs: { [key: string]: any; }, timestamp?: number) {
        this.m_Span.log(keyValuePairs, timestamp);
        return this;
    }

    public async finish(finishTime?: number) {
        if (this.m_FinishPredicate) {
            const ok = await this.m_FinishPredicate(this.m_Name, this.m_Tags);
            if (!ok)
                return;
        }
        this.m_Span.finish(finishTime);
    }
}