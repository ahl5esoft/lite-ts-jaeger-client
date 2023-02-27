import { initTracer, opentracing, TracingConfig, TracingOptions } from 'jaeger-client';

import { Span, recordFunction } from './span';

class RootGlobalTracerDelegate extends opentracing.Tracer {
    public constructor(
        private m_Tracer: opentracing.Tracer,
        private m_RecordFn?: recordFunction
    ) {
        super();
    }

    public extract(format: string, carrier: any) {
        return this.m_Tracer.extract(format, carrier);
    }

    public startSpan(name: string, options: opentracing.SpanOptions = {}) {
        return new Span(
            name,
            this.m_Tracer.startSpan(name, options),
            this.m_Tracer,
            this.m_RecordFn
        );
    }

    public inject(spanContext: opentracing.SpanContext | opentracing.Span, format: string, carrier: any) {
        return this.m_Tracer.inject(spanContext, format, carrier);
    }
}

let rootGlobalTracerDelegate: opentracing.Tracer = null;

/**
 * @param tracingConfig 
 * @param tracingOptions 
 * @param recordFn 是否记录该 Span ，返回 true 记录，返回 false，不记录。不提供该函数，则按照 jaeger 配置记录
 */
export function initRootGlobalTracer(tracingConfig: TracingConfig, tracingOptions: TracingOptions, recordFn?: recordFunction) {
    const tracer = initTracer(tracingConfig, tracingOptions);
    rootGlobalTracerDelegate = new RootGlobalTracerDelegate(tracer, recordFn);
    return rootGlobalTracerDelegate;
}

export function rootGlobalTracer(): opentracing.Tracer {
    return rootGlobalTracerDelegate;
}
