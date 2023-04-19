import { initTracer, opentracing } from 'jaeger-client';

import { Default } from './default';

export abstract class TracerBase extends opentracing.Tracer {
    protected tracer: opentracing.Tracer;

    public constructor(cfg: Default) {
        super();

        cfg.openTracing.config.serviceName = cfg.name;
        cfg.openTracing.options ??= {};
        cfg.openTracing.options.tags ??= {};
        cfg.openTracing.options.tags.version = cfg.version;

        this.tracer = initTracer(cfg.openTracing.config, cfg.openTracing.options);
        opentracing.initGlobalTracer(this);
    }
}