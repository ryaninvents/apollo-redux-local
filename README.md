# apollo-redux-local

> Use Redux to provide local GraphQL resolvers

[![CircleCI][circleci-image]][circleci-url]
[![GitHub repository][github-image]][github-url]
[![semantic-release][semantic-release-image]][semantic-release-url]
![Maintenance status as of 2020][maint-image]

## Why do I want to use this?

Redux provides a simple but powerful set of tools for building an application. Apollo provides a clean way for a component to declare what data it needs. By combining the two, you have access to the transparency, testability, and dev-tools support of Redux as well as the ease of use of a GraphQL API.

## Installation

```bash
npm install --save apollo-redux-local
```

## Usage

Use your Apollo `client` with `react-apollo` or `react-apollo-hooks` as you normally would. The `store` should be created using `createApolloMiddleware`:

```js
import createApolloMiddleware from 'apollo-redux-local';

const cache = new InMemoryCache();
const client = new ApolloClient({
  cache,
  link: myApolloLink
});

const store = createStore(
  reducer,
  {},
  applyMiddleware(createApolloMiddleware(client))
);
```

Then, you can register Redux actions as mutations, or expose selectors as queries:

```js
import { registerResolvers } from 'apollo-redux-local';
// Assume you've created your Store using this middleware
import store from './store';

store.dispatch(
  registerResolvers({
    Query: {
      // Queries have access to `getState`
      count: (_0, _1, { getState }) => getState().count,
    },
    Mutation: {
      // Mutations have access to `dispatch` and `getState`
      increment: (_0, _1, { dispatch, getState }) => {
        dispatch({ type: 'COUNT', payload: 1 });
        return getState().count;
      },
    },
  })
);
```

You can attach all your resolvers at application initialization time, but if you code-split, you'll be able to register resolvers as you need them.

[semantic-release-image]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg

[semantic-release-url]: https://github.com/semantic-release/semantic-release

[maint-image]: https://img.shields.io/maintenance/yes/2020.svg

[github-image]: https://img.shields.io/github/stars/ryaninvents/apollo-redux-local.svg?style=social

[github-url]: https://github.com/ryaninvents/apollo-redux-local

[circleci-image]: https://img.shields.io/circleci/project/github/ryaninvents/apollo-redux-local/master.svg?logo=circleci

[circleci-url]: https://circleci.com/gh/ryaninvents/apollo-redux-local
