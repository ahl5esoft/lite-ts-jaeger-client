import { strictEqual } from 'assert';

import { initRootGlobalTracer } from './root-global-tracer';
import { Span as Self } from './span';

describe('src/root-global-tracer.ts', () => {
    describe('.finish(timestamp?: number)', () => {
        it('ok', async () => {
            const tracer = initRootGlobalTracer(
                {
                    serviceName: 'framework-dev-gateway',
                    reporter: {
                        collectorEndpoint: 'http://10.10.0.66:14268/api/traces'
                    },
                    sampler: {
                        type: 'const',
                        param: 1
                    }
                },
                {
                    tags: {
                        version: '1.0.0'
                    }
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
                tracer.startSpan('/app/mh/test'),
                tracer,
                async (_: string, tags: { [key: string]: any; }) => {
                    const ok = whitelist.includes(tags[key]);
                    res = ok;
                    return ok;
                }
            );

            self.addTags({
                [key]: 'user0'
            });

            await self.finish();

            strictEqual(res, false);
        });
    });
});