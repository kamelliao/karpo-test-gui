import { createSelector, createSlice } from '@reduxjs/toolkit';

const initialState = {
  userId: '',
};

export const activitySlice = createSlice({
  name: 'activity',
  initialState,
  reducers: {
    selectUser: (state, action) => {
      state.userId = action.payload;
    },
  },
});

export const selectCurrentUser = createSelector(
  state => state.users,
  state => state.activity.userId,
  (users, userId) => users.find(user => user?.id === userId),
);

export const selectCurrentUserPassengerActivity = createSelector(
  state => selectCurrentUser(state)?.activity,
  user => ({
    requestId: user?.requestId,
    matches: user?.matches,
    joinId: user?.joinId,
    rideId: user?.rideId,
  }),
);

export const selectCurrentUserDriverActivity = createSelector(
  state => selectCurrentUser(state)?.activity,
  user => ({
    rideId: user?.rideId,
    joins: user?.joins,
    schedule: user?.schedule,
  }),
);

export const selectInactiveUsers = createSelector(
  state => state.users,
  users => users.filter(user => !user?.activity),
);

export const { selectUser } = activitySlice.actions;

export default activitySlice.reducer;
