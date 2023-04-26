import { opentracing } from 'jaeger-client';
import { IUnitOfWorkRepository } from 'lite-ts-db';
import { Mock } from 'lite-ts-mock';

import { JaegerClientUnitOfWork as Self } from './unit-of-work';

class TestUnitOfWorkModel { }

describe('src/service/jaeger-client/unit-of-work.ts', () => {
    describe('.commit()', () => {
        it('ok', async () => {
            const mockUow = new Mock<IUnitOfWorkRepository>();
            const self = new Self(mockUow.actual, null, null);

            const mockSpan = new Mock<opentracing.Span>();
            Reflect.set(self, 'm_Span', mockSpan.actual);

            mockSpan.expected.setTag(opentracing.Tags.DB_STATEMENT, 'commit');

            mockUow.expected.commit();

            mockSpan.expected.log({});

            mockSpan.expected.finish();

            await self.commit();
        });
    });

    describe('.registerAdd<T>(model: new () => T, entry: T)', () => {
        it('ok', () => {
            const self = new Self(null, null, null);

            self.registerAdd(TestUnitOfWorkModel.name, {});
        });
    });

    describe('.registerRemove(table: string, entry: any)', () => {
        it('ok', () => {
            const mockUow = new Mock<IUnitOfWorkRepository>();
            const self = new Self(mockUow.actual, null, null);

            mockUow.expected.registerRemove(TestUnitOfWorkModel.name, {});

            self.registerRemove(TestUnitOfWorkModel.name, {});
        });
    });

    describe('.registerSave(table: string, entry: any)', () => {
        it('ok', () => {
            const mockUow = new Mock<IUnitOfWorkRepository>();
            const self = new Self(mockUow.actual, null, null);

            mockUow.expected.registerSave(TestUnitOfWorkModel.name, {});

            self.registerSave(TestUnitOfWorkModel.name, {});
        });
    });
});