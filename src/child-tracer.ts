import { initTracer, opentracing, TracingConfig, TracingOptions } from 'jaeger-client';

export class ChildTracer extends opentracing.Tracer {
    private m_Tracer: opentracing.Tracer;

    public constructor(
        tracingConfig: TracingConfig,
        tracingOptions: TracingOptions,
    ) {
        super();

        this.m_Tracer = initTracer(tracingConfig, tracingOptions);
        opentracing.initGlobalTracer(this.m_Tracer);
    }

    public extract(format: string, carrier: any) {
        const ctx = this.m_Tracer.extract(format, carrier);
        if (!ctx?.toSpanId() && !ctx?.toTraceId())
            return null;
        return ctx;
    }

    public startSpan(name: string, options: opentracing.SpanOptions = {}) {
        return this.m_Tracer.startSpan(name, options);
    }

    public inject(spanContext: opentracing.SpanContext | opentracing.Span, format: string, carrier: any) {
        return this.m_Tracer.inject(spanContext, format, carrier);
    }
}
