import { TracingConfig, TracingOptions, initTracer, opentracing } from 'jaeger-client';

export abstract class TracerBase extends opentracing.Tracer {
    protected tracer: opentracing.Tracer;

    public constructor(
        cfg: {
            config: TracingConfig,
            options?: TracingOptions,
        },
        name: string,
        version: string,
    ) {
        super();

        cfg.config.serviceName = name;
        cfg.options ??= {};
        cfg.options.tags ??= {};
        cfg.options.tags.version = version;

        this.tracer = initTracer(cfg.config, cfg.options);
        opentracing.initGlobalTracer(this);
    }
}