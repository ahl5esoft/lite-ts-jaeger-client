import { opentracing } from 'jaeger-client';

export type finishPredicate = (name: string, tags: { [key: string]: any; }) => Promise<boolean>;

export class Span extends opentracing.Span {
    private m_Tags: { [key: string]: any; } = {};

    public constructor(
        private m_Name: string,
        private m_Span: opentracing.Span,
        private m_Tracer: opentracing.Tracer,
        private m_FinishPredicate?: finishPredicate
    ) {
        super();
    }

    public context() {
        return this.m_Span.context();
    }

    public tracer() {
        return this.m_Tracer;
    }

    public setOperationName(name: string) {
        this.m_Span.setOperationName(name);
        return this;
    }

    public setBaggageItem(key: string, value: string) {
        this.m_Span.setBaggageItem(key, value);
        return this;
    }

    public getBaggageItem(key: string) {
        return this.m_Span.getBaggageItem(key);
    }

    public setTag(key: string, value: any) {
        this.m_Tags[key] = value;
        this.m_Span.setTag(key, value);
        return this;
    }

    public addTags(keyValueMap: { [key: string]: any; }) {
        Object.assign(this.m_Tags, keyValueMap);
        this.m_Span.addTags(keyValueMap);
        return this;
    }

    public log(keyValuePairs: { [key: string]: any; }, timestamp?: number) {
        this.m_Span.log(keyValuePairs, timestamp);
        return this;
    }

    public logEvent(eventName: string, payload: any) {
        this.m_Span.logEvent(eventName, payload);
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