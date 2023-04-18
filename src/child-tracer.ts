import { opentracing, TracingConfig, TracingOptions } from 'jaeger-client';
import { TracerBase } from './tracer-base';

export class ChildTracer extends TracerBase {

    public constructor(
        cfg: {
            config: TracingConfig,
            options?: TracingOptions,
        },
        name: string,
        version: string
    ) {
        super(cfg, name, version);
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
