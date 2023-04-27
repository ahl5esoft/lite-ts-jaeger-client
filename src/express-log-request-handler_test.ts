import { strictEqual } from 'assert';
import { ILog, LogFactoryBase } from 'lite-ts-log';
import { ExpressRequestHandlerBase } from 'lite-ts-express';
import { Mock } from 'lite-ts-mock';

import { ExpressLogRequestHandler as Self } from './express-log-request-handler';

describe('src/log-request-handler.ts', () => {
    describe('.handle(ctx: RequestHandlerContext)', () => {
        it('ok', async () => {
            const mockFactory = new Mock<LogFactoryBase>();
            const self = new Self(mockFactory.actual, 'k', ctx => {
                return ctx.req.path;
            });

            const mockLog = new Mock<ILog>();
            mockFactory.expectReturn(
                r => r.build(),
                mockLog.actual
            );

            mockLog.expectReturn(
                r => r.addLabel('k', '/aa/bb'),
                mockLog.actual
            );

            const mockHandler = new Mock<ExpressRequestHandlerBase>();
            self.setNext(mockHandler.actual);

            const ctx = {
                req: {
                    path: '/aa/bb'
                }
            } as any;
            mockHandler.expected.handle(ctx);

            await self.handle(ctx);

            strictEqual(ctx.log, mockLog.actual);
        });
    });
});