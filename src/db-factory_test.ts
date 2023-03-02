import { strictEqual } from 'assert';
import { opentracing } from 'jaeger-client';
import { Mock } from 'lite-ts-mock';

import { JaegerClientDbFactory as Self } from './db-factory';
import { JaegerClientDbRepository } from './db-repository';
import { JaegerClientUnitOfWork } from './unit-of-work';
import { IDbFactory } from './i-db-factory';
import { IUnitOfWork } from './i-unit-of-work';

describe('src/service/jaeger/db-factory.ts', () => {
    describe('.db<T>(model: new () => T, uow?: UnitOfWorkRepositoryBase)', () => {
        class DbModel { }

        it('ok', () => {
            const self = new Self(
                null,
                null,
                new opentracing.Span()
            );

            const res = self.db(DbModel);
            strictEqual(res.constructor, JaegerClientDbRepository);
        });
    });
    describe('.uow()', () => {
        it('ok', () => {
            const mockDbFactory = new Mock<IDbFactory>();
            const self = new Self(
                mockDbFactory.actual,
                null,
                new opentracing.Span()
            );

            const mockUow = new Mock<IUnitOfWork>();
            mockDbFactory.expectReturn(
                r => r.uow(),
                mockUow.actual
            );

            const res = self.uow();
            strictEqual(res.constructor, JaegerClientUnitOfWork);
        });
    });
});