import { notStrictEqual } from 'assert';
import { opentracing } from 'jaeger-client';

import { RootTracer as Self } from './root-tracer';

describe('src/root-tracer.ts', () => {
    describe('.inject(spanContext: ITracerSpan | ITracerSpanContext, format: string, carrier: any)', () => {
        it('ok', async () => {
            const self = new Self(
                {
                    openTracing: {
                        config: {
                            serviceName: 'framework-dev-gateway',
                            reporter: {
                                collectorEndpoint: 'http://10.10.0.66:14268/api/traces'
                            },
                            sampler: {
                                type: 'const',
                                param: 1
                            }
                        },
                        options: {}
                    },
                    name: 'framework-dev-gateway',
                    version: '1.0.0'
                }
            );

            const span = self.startSpan('test');

            const headers = {};
            self.inject(span, opentracing.FORMAT_HTTP_HEADERS, headers);
            notStrictEqual(headers['uber-trace-id'], '[object Object]');
        });
    });
});