import { strictEqual } from 'assert';
import { DbModel, IDbRepository } from 'lite-ts-db';
import { Mock } from 'lite-ts-mock';

import { JaegerClientDbRepository as Self } from './db-repository';

class TestDbRepository extends DbModel { }

describe('src/service/jaeger/db-repository.ts', () => {
    describe('.query()', () => {
        it('ok', () => {
            const mockDbRepository = new Mock<IDbRepository<TestDbRepository>>({
                model: TestDbRepository.name
            });
            const self = new Self(
                mockDbRepository.actual,
                null,
                null
            );

            const query_ = {};
            mockDbRepository.expectReturn(
                r => r.query(),
                query_
            );

            const res = self.query();
            strictEqual(Reflect.get(res, 'm_DbQuery'), query_);
            strictEqual(Reflect.get(res, 'm_Table'), TestDbRepository.name);
        });
    });
});