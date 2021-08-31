/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createItem = /* GraphQL */ `
  mutation CreateItem(
    $input: CreateItemInput!
    $condition: ModelItemConditionInput
  ) {
    createItem(input: $input, condition: $condition) {
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
        image
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
      creator
      _version
      _deleted
      _lastChangedAt
      createdAt
      updatedAt
    }
  }
`;
export const updateItem = /* GraphQL */ `
  mutation UpdateItem(
    $input: UpdateItemInput!
    $condition: ModelItemConditionInput
  ) {
    updateItem(input: $input, condition: $condition) {
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
        image
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
      creator
      _version
      _deleted
      _lastChangedAt
      createdAt
      updatedAt
    }
  }
`;
export const deleteItem = /* GraphQL */ `
  mutation DeleteItem(
    $input: DeleteItemInput!
    $condition: ModelItemConditionInput
  ) {
    deleteItem(input: $input, condition: $condition) {
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
        image
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
      creator
      _version
      _deleted
      _lastChangedAt
      createdAt
      updatedAt
    }
  }
`;
export const createUser = /* GraphQL */ `
  mutation CreateUser(
    $input: CreateUserInput!
    $condition: ModelUserConditionInput
  ) {
    createUser(input: $input, condition: $condition) {
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
      createdRecipes {
        items {
          id
          name
          caseInsensitiveName
          description
          tag
          rating
          image
          notes
          forked
          creator
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
export const updateUser = /* GraphQL */ `
  mutation UpdateUser(
    $input: UpdateUserInput!
    $condition: ModelUserConditionInput
  ) {
    updateUser(input: $input, condition: $condition) {
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
      createdRecipes {
        items {
          id
          name
          caseInsensitiveName
          description
          tag
          rating
          image
          notes
          forked
          creator
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
export const deleteUser = /* GraphQL */ `
  mutation DeleteUser(
    $input: DeleteUserInput!
    $condition: ModelUserConditionInput
  ) {
    deleteUser(input: $input, condition: $condition) {
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
      createdRecipes {
        items {
          id
          name
          caseInsensitiveName
          description
          tag
          rating
          image
          notes
          forked
          creator
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
export const createUserRecipe = /* GraphQL */ `
  mutation CreateUserRecipe(
    $input: CreateUserRecipeInput!
    $condition: ModelUserRecipeConditionInput
  ) {
    createUserRecipe(input: $input, condition: $condition) {
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
          image
        }
        notes
        forked
        users {
          nextToken
          startedAt
        }
        creator
        _version
        _deleted
        _lastChangedAt
        createdAt
        updatedAt
      }
      user {
        id
        username
        recipes {
          nextToken
          startedAt
        }
        email
        provider
        createdRecipes {
          nextToken
          startedAt
        }
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
  }
`;
export const updateUserRecipe = /* GraphQL */ `
  mutation UpdateUserRecipe(
    $input: UpdateUserRecipeInput!
    $condition: ModelUserRecipeConditionInput
  ) {
    updateUserRecipe(input: $input, condition: $condition) {
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
          image
        }
        notes
        forked
        users {
          nextToken
          startedAt
        }
        creator
        _version
        _deleted
        _lastChangedAt
        createdAt
        updatedAt
      }
      user {
        id
        username
        recipes {
          nextToken
          startedAt
        }
        email
        provider
        createdRecipes {
          nextToken
          startedAt
        }
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
  }
`;
export const deleteUserRecipe = /* GraphQL */ `
  mutation DeleteUserRecipe(
    $input: DeleteUserRecipeInput!
    $condition: ModelUserRecipeConditionInput
  ) {
    deleteUserRecipe(input: $input, condition: $condition) {
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
          image
        }
        notes
        forked
        users {
          nextToken
          startedAt
        }
        creator
        _version
        _deleted
        _lastChangedAt
        createdAt
        updatedAt
      }
      user {
        id
        username
        recipes {
          nextToken
          startedAt
        }
        email
        provider
        createdRecipes {
          nextToken
          startedAt
        }
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
  }
`;
