import { opentracing } from 'jaeger-client';

import { Config } from './config';
import { JaegerClientTracerBase } from './tracer-base';

export class ChildTracer extends JaegerClientTracerBase {
    public constructor(cfg: Config) {
        super(cfg);
    }

    public extract(format: string, carrier: any) {
        const ctx = this.tracer.extract(format, carrier);
        if (!ctx?.toSpanId() && !ctx?.toTraceId())
            return null;
        return ctx;
    }

    public startSpan(name: string, options: opentracing.SpanOptions = {}) {
        if (!options.childOf)
            return null;

        return this.tracer.startSpan(name, options);
    }

    public inject(spanContext: opentracing.SpanContext | opentracing.Span, format: string, carrier: any) {
        return this.tracer.inject(spanContext, format, carrier);
    }
}
