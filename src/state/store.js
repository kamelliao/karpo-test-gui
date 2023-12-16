import { configureStore } from '@reduxjs/toolkit';

import activityReducer from './activity';
import usersReducer from './users';

export const store = configureStore({
  reducer: {
    users: usersReducer,
    activity: activityReducer,
  },
});
