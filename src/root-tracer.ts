import { initTracer, opentracing, TracingConfig, TracingOptions } from 'jaeger-client';

import { Span, FinishPredicate } from './span';

export class RootTracer extends opentracing.Tracer {
    private m_Tracer: opentracing.Tracer;

    public constructor(
        tracingConfig: TracingConfig,
        tracingOptions: TracingOptions,
        private m_FinishPredicate?: FinishPredicate
    ) {
        super();

        this.m_Tracer = initTracer(tracingConfig, tracingOptions);
        opentracing.initGlobalTracer(this);
    }

    public extract(format: string, carrier: any) {
        return this.m_Tracer.extract(format, carrier);
    }

    public startSpan(name: string, options: opentracing.SpanOptions = {}) {
        return new Span(
            name,
            this.m_Tracer.startSpan(name, options),
            this.m_Tracer,
            this.m_FinishPredicate
        );
    }

    public inject(spanContext: opentracing.SpanContext | opentracing.Span, format: string, carrier: any) {
        return this.m_Tracer.inject(spanContext, format, carrier);
    }
}
