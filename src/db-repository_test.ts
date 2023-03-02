import { strictEqual } from 'assert';
import { Mock } from 'lite-ts-mock';

import { JaegerClientDbRepository as Self } from './db-repository';
import { IDbFactory } from './i-db-factory';
import { IDbRepository } from './i-db-repository';

class TestDbRepository { }

describe('src/service/jaeger/db-repository.ts', () => {
    describe('.repo[proctected]', () => {
        it('ok', () => {
            const mockDbFactory = new Mock<IDbFactory>();
            const self = new Self(
                null,
                TestDbRepository,
                mockDbFactory.actual,
                null,
                null,
                'uow' as any,
            );

            const mockDbRepo = new Mock<IDbRepository<TestDbRepository>>();
            mockDbFactory.expectReturn(
                r => r.db(TestDbRepository, 'uow'),
                mockDbRepo.actual
            );

            const res = Reflect.get(self, 'repo');
            strictEqual(res, mockDbRepo.actual);
        });
    });
});