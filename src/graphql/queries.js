/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const syncItems = /* GraphQL */ `
  query SyncItems(
    $filter: ModelItemFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncItems(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
        id
        name
        caseInsensitiveName
        description
        tag
        rating
        image
        ingredient {
          name
          amount
          unit
          preparation
        }
        ingredientGroup {
          name
        }
        step {
          description
        }
        notes
        forked
        users {
          nextToken
          startedAt
        }
        _version
        _deleted
        _lastChangedAt
        createdAt
        updatedAt
      }
      nextToken
      startedAt
    }
  }
`;
export const getItem = /* GraphQL */ `
  query GetItem($id: ID!) {
    getItem(id: $id) {
      id
      name
      caseInsensitiveName
      description
      tag
      rating
      image
      ingredient {
        name
        amount
        unit
        preparation
      }
      ingredientGroup {
        name
        ingredient {
          name
          amount
          unit
          preparation
        }
      }
      step {
        description
      }
      notes
      forked
      users {
        items {
          id
          recipeID
          userID
          liked
          rating
          _version
          _deleted
          _lastChangedAt
          createdAt
          updatedAt
        }
        nextToken
        startedAt
      }
      _version
      _deleted
      _lastChangedAt
      createdAt
      updatedAt
    }
  }
`;
export const listItems = /* GraphQL */ `
  query ListItems(
    $filter: ModelItemFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listItems(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        caseInsensitiveName
        description
        tag
        rating
        image
        ingredient {
          name
          amount
          unit
          preparation
        }
        ingredientGroup {
          name
        }
        step {
          description
        }
        notes
        forked
        users {
          nextToken
          startedAt
        }
        _version
        _deleted
        _lastChangedAt
        createdAt
        updatedAt
      }
      nextToken
      startedAt
    }
  }
`;
export const syncUsers = /* GraphQL */ `
  query SyncUsers(
    $filter: ModelUserFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncUsers(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
        id
        username
        recipes {
          nextToken
          startedAt
        }
        email
        provider
        _version
        _deleted
        _lastChangedAt
        createdAt
        updatedAt
      }
      nextToken
      startedAt
    }
  }
`;
export const getUser = /* GraphQL */ `
  query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      username
      recipes {
        items {
          id
          recipeID
          userID
          liked
          rating
          _version
          _deleted
          _lastChangedAt
          createdAt
          updatedAt
        }
        nextToken
        startedAt
      }
      email
      provider
      _version
      _deleted
      _lastChangedAt
      createdAt
      updatedAt
    }
  }
`;
export const listUsers = /* GraphQL */ `
  query ListUsers(
    $filter: ModelUserFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listUsers(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        username
        recipes {
          nextToken
          startedAt
        }
        email
        provider
        _version
        _deleted
        _lastChangedAt
        createdAt
        updatedAt
      }
      nextToken
      startedAt
    }
  }
`;
export const syncUserRecipes = /* GraphQL */ `
  query SyncUserRecipes(
    $filter: ModelUserRecipeFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncUserRecipes(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
        id
        recipeID
        userID
        recipes {
          id
          name
          caseInsensitiveName
          description
          tag
          rating
          image
          notes
          forked
          _version
          _deleted
          _lastChangedAt
          createdAt
          updatedAt
        }
        user {
          id
          username
          email
          provider
          _version
          _deleted
          _lastChangedAt
          createdAt
          updatedAt
        }
        liked
        rating
        _version
        _deleted
        _lastChangedAt
        createdAt
        updatedAt
      }
      nextToken
      startedAt
    }
  }
`;
