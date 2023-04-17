import { strictEqual } from 'assert';
import { opentracing } from 'jaeger-client';
import { DbFactoryBase, DbModel, DbOption, DbRepository, IUnitOfWork } from 'lite-ts-db';
import { Mock } from 'lite-ts-mock';

import { JaegerClientDbFactory as Self } from './db-factory';
import { JaegerClientDbRepository } from './db-repository';
import { JaegerClientUnitOfWork } from './unit-of-work';

function modelDbOption(model: any): DbOption {
    return (_, dbRepo_) => {
        (dbRepo_ as DbRepository<any>).model = typeof model == 'string' ? model : model.name;
    };
}

class TestModel extends DbModel { }

describe('src/service/jaeger/db-factory.ts', () => {
    describe('.db<T>(model: new () => T, uow?: UnitOfWorkRepositoryBase)', () => {

        it('ok', () => {
            const dbFacotryMock = new Mock<DbFactoryBase>();

            const dbOption = modelDbOption(TestModel);
            dbFacotryMock.expectReturn(
                r => r.db(dbOption),
                {}
            );

            const self = new Self(
                dbFacotryMock.actual,
                null
            );

            const res = self.db(dbOption);
            strictEqual(res.constructor, JaegerClientDbRepository);
        });
    });

    describe('.uow()', () => {
        it('ok', () => {
            const mockDbFactory = new Mock<DbFactoryBase>();
            const self = new Self(
                mockDbFactory.actual,
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