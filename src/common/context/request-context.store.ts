import { AsyncLocalStorage } from 'node:async_hooks';
import { RequestContext } from './request-context.types';

export const requestContextStorage = new AsyncLocalStorage<RequestContext>();
