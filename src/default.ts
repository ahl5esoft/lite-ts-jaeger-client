import { TracingConfig, TracingOptions } from 'jaeger-client';

export class Default {
    public name: string;
    public openTracing: {
        config: TracingConfig;
        options: TracingOptions;
    };
    public version: string;
}