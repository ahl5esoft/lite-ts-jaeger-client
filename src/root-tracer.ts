import { opentracing } from 'jaeger-client';

import { Config } from './config';
import { Span, FinishPredicate } from './span';
import { JaegerClientTracerBase } from './tracer-base';

export class RootTracer extends JaegerClientTracerBase {
    public constructor(
        cfg: Config,
        private m_FinishPredicate?: FinishPredicate
    ) {
        super(cfg);
    }

    public extract(format: string, carrier: any) {
        return this.tracer.extract(format, carrier);
    }

    public startSpan(name: string, options: opentracing.SpanOptions = {}) {
        return new Span(
            name,
            this.tracer.startSpan(name, options),
            this.tracer,
            this.m_FinishPredicate
        );
    }

    public inject(spanContext: opentracing.SpanContext | opentracing.Span, format: string, carrier: any) {
        return this.tracer.inject(spanContext, format, carrier);
    }
}
