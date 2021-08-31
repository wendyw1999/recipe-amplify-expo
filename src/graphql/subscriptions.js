/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateItem = /* GraphQL */ `
  subscription OnCreateItem {
    onCreateItem {
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
export const onUpdateItem = /* GraphQL */ `
  subscription OnUpdateItem {
    onUpdateItem {
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
export const onDeleteItem = /* GraphQL */ `
  subscription OnDeleteItem {
    onDeleteItem {
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
export const onCreateUser = /* GraphQL */ `
  subscription OnCreateUser {
    onCreateUser {
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
export const onUpdateUser = /* GraphQL */ `
  subscription OnUpdateUser {
    onUpdateUser {
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
export const onDeleteUser = /* GraphQL */ `
  subscription OnDeleteUser {
    onDeleteUser {
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
export const onCreateUserRecipe = /* GraphQL */ `
  subscription OnCreateUserRecipe {
    onCreateUserRecipe {
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
export const onUpdateUserRecipe = /* GraphQL */ `
  subscription OnUpdateUserRecipe {
    onUpdateUserRecipe {
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
export const onDeleteUserRecipe = /* GraphQL */ `
  subscription OnDeleteUserRecipe {
    onDeleteUserRecipe {
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
