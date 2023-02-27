import { initTracer, opentracing, TracingConfig, TracingOptions } from 'jaeger-client';

class ChildGlobalTracerDelegate extends opentracing.Tracer {
    public constructor(
        private m_Tracer: opentracing.Tracer
    ) {
        super();
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

let childGlobalTracerDelegate: opentracing.Tracer;

export function initChildGlobalTracer(tracingConfig: TracingConfig, tracingOptions: TracingOptions) {
    const tracer = initTracer(tracingConfig, tracingOptions);
    childGlobalTracerDelegate = new ChildGlobalTracerDelegate(tracer);
    return childGlobalTracerDelegate;
}

export function childGlobalTracer(): opentracing.Tracer {
    return childGlobalTracerDelegate;
}
