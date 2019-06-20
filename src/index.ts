import ApolloClient from 'apollo-client';
import { DataProxy } from 'apollo-cache';

const PKG_NAME = 'apollo-redux-local';
const type: any = ([value]) => `@@${PKG_NAME}/${value}`;

const ActionType = {
  RegisterClient: type`register-client`,
  RegisterResolvers: type`register-resolvers`,
  GetClient: type`get-client`,
  WriteCache: type`write-cache`,
  WriteQuery: type`write-query`,
};

interface ResolverSet {
  [key: string]: Resolver;
}

interface Resolvers {
  Query?: ResolverSet;
  Mutation?: ResolverSet;
  [key: string]: ResolverSet;
}

type Resolver = (
  rootValue: any,
  args: any,
  context: any & { dispatch: Function; getState: Function },
  info: any
) => any;

function applyReduxArgsToProperties(
  originals: { [key: string]: Resolver },
  { dispatch, getState }
): { [key: string]: Resolver } {
  const result = {};
  Object.keys(originals).forEach((key) => {
    const origFn: Resolver = originals[key];
    const newFn: Resolver = (rootValue, args, context = null, ...rest) =>
      origFn(rootValue, args, { ...context, dispatch, getState }, ...rest);
    result[key] = newFn;
  });
  return result;
}

function applyReduxArgsToResolvers(
  resolvers: Resolvers,
  { dispatch, getState }
): Resolvers {
  const result: Resolvers = {};
  Object.keys(resolvers).forEach((key) => {
    result[key] = applyReduxArgsToProperties(resolvers[key], {
      dispatch,
      getState,
    });
  });
  return result;
}

export function registerClient<T>(client: ApolloClient<T>) {
  return {
    type: ActionType.RegisterClient,
    payload: client,
  };
}

export function registerResolvers(resolvers: Resolvers) {
  return {
    type: ActionType.RegisterResolvers,
    payload: resolvers,
  };
}

export function getClient() {
  return { type: ActionType.GetClient };
}

export function writeCache(args: DataProxy.WriteDataOptions<any>) {
  return { type: ActionType.WriteCache, payload: args };
}

export function writeQuery(args: DataProxy.WriteQueryOptions<any, any>) {
  return { type: ActionType.WriteQuery, payload: args };
}

export default function createApolloMiddleware<T>({
  client: inputClient = null,
} = {}) {
  return (store) => {
    let client: ApolloClient<T> | null = inputClient;
    let resolverStack = [];
    return (next) => (action) => {
      try {
        switch (action.type) {
          case ActionType.RegisterClient: {
            if (client) break;
            client = action.payload;
            client.addResolvers(resolverStack);
            break;
          }

          case ActionType.RegisterResolvers: {
            const dispatch = (...args) => store.dispatch(...args);
            const getState = () => store.getState();
            const resolver: Resolvers = applyReduxArgsToResolvers(
              action.payload,
              {
                dispatch,
                getState,
              }
            );
            if (!client) {
              resolverStack.push(resolver);
              break;
            }

            client.addResolvers(resolver as any);
            break;
          }

          case ActionType.WriteCache:
            if (!client) break;
            client.writeData(action.payload);
            break;
          case ActionType.WriteQuery:
            if (!client) break;
            client.writeQuery(action.payload);
            break;
          case ActionType.GetClient:
            next(action);
            return client;
          default:
            break;
        }
      } catch (error) {
        console.error(error);
      }

      return next(action);
    };
  };
}
