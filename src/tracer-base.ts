import { initTracer, opentracing } from 'jaeger-client';
import { TracerBase } from 'lite-ts-tracer';

import { Config } from './config';

export abstract class JaegerClientTracerBase extends TracerBase {
    private m_Tracer: opentracing.Tracer;
    protected get tracer() {
        if (!this.m_Tracer) {
            this.m_Cfg.openTracing.config.serviceName = this.m_Cfg.name;
            this.m_Cfg.openTracing.options ??= {};
            this.m_Cfg.openTracing.options.tags ??= {};
            this.m_Cfg.openTracing.options.tags.version = this.m_Cfg.version;

            this.m_Tracer = initTracer(this.m_Cfg.openTracing.config, this.m_Cfg.openTracing.options);
        }
        return this.m_Tracer;
    }

    public constructor(private m_Cfg: Config) {
        super();
    }
}