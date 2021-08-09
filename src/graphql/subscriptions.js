/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateItem = /* GraphQL */ `
  subscription OnCreateItem {
    onCreateItem {
      id
      name
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
      createdAt
      updatedAt
    }
  }
`;
