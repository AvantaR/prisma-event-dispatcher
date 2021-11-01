import { test as it, beforeEach, afterEach } from 'tap';
import { stubInterface } from 'ts-sinon';
import {
  EventEmitter,
  PrismaEventDispatcher,
  PrismaEventDispatcherOptions,
  MiddlewareParams,
  NextMiddleware,
} from '../src/prisma.event.dispatcher';

const eventEmitter = stubInterface<EventEmitter>();

const next: NextMiddleware = async () => {
  return true;
};

it('emits all type of events when options are empty', async (t) => {
  eventEmitter.emit.reset();

  const options: PrismaEventDispatcherOptions = {};

  const params: MiddlewareParams = {
    action: 'create',
    args: [],
    dataPath: [],
    model: 'User',
    runInTransaction: false,
  };

  await PrismaEventDispatcher.setup(options, eventEmitter).dispatch(params, next);

  t.ok(eventEmitter.emit.calledWith('User.before.create'));
  t.ok(eventEmitter.emit.calledWith('User.after.create'));

  t.end();
});

it('does not emit events when model is not set in options', async (t) => {
  eventEmitter.emit.reset();

  const options: PrismaEventDispatcherOptions = {
    models: ['Post', 'Comment'],
  };

  const params: MiddlewareParams = {
    action: 'create',
    args: [],
    dataPath: [],
    model: 'User',
    runInTransaction: false,
  };

  await PrismaEventDispatcher.setup(options, eventEmitter).dispatch(params, next);

  t.ok(eventEmitter.emit.notCalled);
  t.end();
});

it('emit only before event when only "before" is set in options', async (t) => {
  eventEmitter.emit.reset();
  const options: PrismaEventDispatcherOptions = {
    when: ['before'],
  };

  const params: MiddlewareParams = {
    action: 'create',
    args: [],
    dataPath: [],
    model: 'User',
    runInTransaction: false,
  };

  await PrismaEventDispatcher.setup(options, eventEmitter).dispatch(params, next);

  t.ok(eventEmitter.emit.calledOnceWith('User.before.create'));
  t.end();
});

it('emit only after event when only "after" is set in options', async (t) => {
  eventEmitter.emit.reset();

  const options: PrismaEventDispatcherOptions = {
    when: ['after'],
  };

  const params: MiddlewareParams = {
    action: 'create',
    args: [],
    dataPath: [],
    model: 'User',
    runInTransaction: false,
  };

  await PrismaEventDispatcher.setup(options, eventEmitter).dispatch(params, next);

  t.ok(eventEmitter.emit.calledOnceWith('User.after.create'));
  t.end();
});

it('does not emit any event when no model passed in middleware params', async (t) => {
  eventEmitter.emit.reset();

  const params: MiddlewareParams = {
    action: 'queryRaw',
    args: [],
    dataPath: [],
    runInTransaction: false,
  };

  await PrismaEventDispatcher.setup({}, eventEmitter).dispatch(params, next);
  t.ok(eventEmitter.emit.notCalled);
  t.end();
});

it('does not emit any event when perfomed action is not set in options', async (t) => {
  eventEmitter.emit.reset();

  const options: PrismaEventDispatcherOptions = {
    actions: ['create', 'findFirst'],
  };

  const params: MiddlewareParams = {
    model: 'User',
    action: 'update',
    args: [],
    dataPath: [],
    runInTransaction: false,
  };

  await PrismaEventDispatcher.setup(options, eventEmitter).dispatch(params, next);
  t.ok(eventEmitter.emit.notCalled);
  t.end();
});
