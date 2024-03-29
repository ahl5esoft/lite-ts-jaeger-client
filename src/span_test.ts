import { strictEqual } from 'assert';

import { RootTracer } from './root-tracer';
import { Span as Self } from './span';

describe('src/span.ts', () => {
    describe('.finish(timestamp?: number)', () => {
        it('ok', async () => {
            const tracer = new RootTracer(
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

            const whitelist = [
                'user1',
                'user2',
                'user3',
            ];
            const key = 'authID';

            let res: boolean;
            const self = new Self(
                '/app/mh/test',
                tracer.startSpan('/app/mh/test') as any,
                async (_: string, tags: { [key: string]: any; }) => {
                    const ok = whitelist.includes(tags[key]);
                    res = ok;
                    return ok;
                }
            );

            self.setTag(key, 'user0');

            await self.finish();

            strictEqual(res, false);
        });
    });
});