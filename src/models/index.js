// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';



const { Item, UserRecipe, User, IngredientItem, IngredientGroupItem, StepItem } = initSchema(schema);

export {
  Item,
  UserRecipe,
  User,
  IngredientItem,
  IngredientGroupItem,
  StepItem
};