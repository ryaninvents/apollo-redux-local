# apollo-redux-local

> Use Redux to provide local GraphQL resolvers

[![CircleCI][circleci-image]][circleci-url]
[![GitHub repository][github-image]][github-url]
[![semantic-release][semantic-release-image]][semantic-release-url]
![Maintenance status as of 2019][maint-image]

## Installation

```bash
npm install --save apollo-redux-local
```

## Usage



```js
const store = createStore(
  reducer,
  {},
  applyMiddleware(createApolloMiddleware())
);

const cache = new InMemoryCache();
const client = new ApolloClient({
  cache,
  link: myApolloLink
});


store.dispatch(registerClient(client));
```

[semantic-release-image]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg

[semantic-release-url]: https://github.com/semantic-release/semantic-release

[maint-image]: https://img.shields.io/maintenance/yes/2019.svg

[github-image]: https://img.shields.io/github/stars/ryaninvents/apollo-redux-local.svg?style=social

[github-url]: https://github.com/ryaninvents/apollo-redux-local

[circleci-image]: https://img.shields.io/circleci/project/github/ryaninvents/apollo-redux-local/master.svg?logo=circleci

[circleci-url]: https://circleci.com/gh/ryaninvents/apollo-redux-local