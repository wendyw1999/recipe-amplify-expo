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
export const updateItem = /* GraphQL */ `
  mutation UpdateItem(
    $input: UpdateItemInput!
    $condition: ModelItemConditionInput
  ) {
    updateItem(input: $input, condition: $condition) {
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
export const deleteItem = /* GraphQL */ `
  mutation DeleteItem(
    $input: DeleteItemInput!
    $condition: ModelItemConditionInput
  ) {
    deleteItem(input: $input, condition: $condition) {
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
