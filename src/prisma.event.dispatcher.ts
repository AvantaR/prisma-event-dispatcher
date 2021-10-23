export interface EventEmmiter {
  emit(event: symbol | string, ...values: any[]): boolean;
}

export interface PrismaEventDispatcher {}

export type PrismaEventDispatcherOptions = {
  models?: string[];
  actions?: PrismaAction[];
  when?: When[];
};

export type MiddlewareParams = {
  model?: string;
  action: PrismaAction;
  args: any;
  dataPath: string[];
  runInTransaction: boolean;
};

export type PrismaAction =
  | 'findUnique'
  | 'findMany'
  | 'findFirst'
  | 'create'
  | 'createMany'
  | 'update'
  | 'updateMany'
  | 'upsert'
  | 'delete'
  | 'deleteMany'
  | 'executeRaw'
  | 'queryRaw'
  | 'aggregate'
  | 'count';

export type NextMiddleware = (params: MiddlewareParams) => Promise<any>;

export type When = typeof When[keyof typeof When];

const When = {
  Before: 'before',
  After: 'after',
} as const;

export class PrismaEventDispatcher {
  constructor(private options: PrismaEventDispatcherOptions, private emitter: EventEmmiter) {}

  static setup(options: PrismaEventDispatcherOptions, emitter: EventEmmiter): PrismaEventDispatcher {
    return new PrismaEventDispatcher(options, emitter);
  }

  async dispatch(params: MiddlewareParams, next: NextMiddleware): Promise<NextMiddleware> {
    if (!params.model) return await next(params);
    if (this.options.models && !this.options.models?.includes(params.model)) return await next(params);
    if (this.options.actions && !this.options.actions.includes(params.action)) return await next(params);

    if (!this.options.when || (this.options.when && this.options.when.includes(When.Before))) {
      this.emitter.emit(this.getEventName(params.model, When.Before, params.action), params);
    }

    const result = await next(params);

    if (result && (!this.options.when || (this.options.when && this.options.when.includes(When.After)))) {
      this.emitter.emit(this.getEventName(params.model, When.After, params.action), params, result);
    }

    return result;
  }

  private getEventName(model: string, when: When, action: string): string {
    return `${model}.${when}.${action}`;
  }
}
