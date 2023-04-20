import { TracingConfig, TracingOptions } from 'jaeger-client';

export class Config {
    public name: string;
    public openTracing: {
        config: TracingConfig;
        options: TracingOptions;
    };
    public version: string;
}