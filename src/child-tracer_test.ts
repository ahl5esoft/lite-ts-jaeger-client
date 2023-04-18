import { notStrictEqual, strictEqual } from 'assert';
import { opentracing } from 'jaeger-client';

import { ChildTracer } from './child-tracer';

describe('src/child-tracer.ts', () => {
    describe('.extract(format: string, carrier: any)', () => {
        const tracer = new ChildTracer(
            {
                config: {
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
            'framework-dev-gatewat',
            '1.0.0'
        );

        it('uber-trace-id is not exists', async () => {
            const ctx = tracer.extract(opentracing.FORMAT_HTTP_HEADERS, {});
            strictEqual(ctx, null);
        });

        it('uber-trace-id is exists', async () => {
            const ctx = tracer.extract(opentracing.FORMAT_HTTP_HEADERS, {
                'uber-trace-id': 'e0bc83a49624733:e0bc83a49624733:0:1'
            });
            notStrictEqual(ctx, null);
        });
    });
});
