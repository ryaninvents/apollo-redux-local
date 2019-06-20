import { createStore, applyMiddleware, combineReducers } from 'redux';
import createApolloMiddleware, {
  registerClient,
  registerResolvers,
} from './index';
import { ApolloLink, Observable } from 'apollo-link';
import { InMemoryCache } from 'apollo-cache-inmemory';
import ApolloClient from 'apollo-client';
import gql from 'graphql-tag';

class NullApolloLink extends ApolloLink {
  request() {
    return Observable.of();
  }
}

describe('apollo-redux-local', () => {
  const GET_COUNT = gql`
    {
      count @client
    }
  `;
  const INCREMENT = gql`
    mutation Increment {
      increment @client
    }
  `;

  function setupSimpleCase({ passClientDuringInit = false } = {}) {
    const cache = new InMemoryCache();
    const client = new ApolloClient({ cache, link: new NullApolloLink() });

    const countReducer = (state = 0, next) => {
      if (next.type !== 'COUNT') return state;
      return state + next.payload;
    };

    const reducer = combineReducers({
      count: countReducer,
    });
    const store = createStore(
      reducer,
      {},
      applyMiddleware(
        passClientDuringInit
          ? createApolloMiddleware({ client })
          : createApolloMiddleware()
      )
    );

    if (!passClientDuringInit) store.dispatch(registerClient(client));
    store.dispatch(
      registerResolvers({
        Query: {
          count: (_0, _1, { getState }) => getState().count,
        },
        Mutation: {
          increment: (_0, _1, { dispatch, getState }) => {
            dispatch({ type: 'COUNT', payload: 1 });
            return getState().count;
          },
        },
      })
    );

    return { store, cache, client };
  }

  [
    {
      name: 'passing client during initialization',
      opts: { passClientDuringInit: true },
    },
    {
      name: 'dispatching client via action',
      opts: { passClientDuringInit: false },
    },
  ].forEach(({ name, opts }) =>
    describe(name, () => {
      it('should resolve requests', async () => {
        const { client } = setupSimpleCase(opts);
        const q1 = await client.query({
          query: GET_COUNT,
        });
        expect(q1.data).toEqual({
          count: 0,
        });
        const m1 = await client.mutate({
          mutation: INCREMENT,
        });
        expect(m1.data).toEqual({
          increment: 1,
        });
        const m2 = await client.mutate({
          mutation: INCREMENT,
        });
        expect(m2.data).toEqual({
          increment: 2,
        });
      });
    })
  );
});
