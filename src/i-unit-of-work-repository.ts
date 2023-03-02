import { IUnitOfWork } from './i-unit-of-work';

export interface IUnitOfWorkRepository extends IUnitOfWork {
    registerAdd<T>(model: new () => T, entry: T): void;

    registerRemove<T>(model: new () => T, entry: T): void;

    registerSave<T>(model: new () => T, entry: T): void;
}