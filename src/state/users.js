import { createSlice } from '@reduxjs/toolkit';

const initialState = [];

export const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    addNewUser: (state, action) => {
      state.push(action.payload);
    },
    setMatcheRides: (state, action) => {
      const { id, requestId, matches } = action.payload;
      const user = state.find(user => user.id === id);
      user.activity = { role: 'passenger', requestId, matches };
    },
    postRide: (state, action) => {
      const { id, rideId } = action.payload;
      const user = state.find(user => user.id === id);
      user.activity = { role: 'driver', rideId };
    },
    getJoins: (state, action) => {
      const { id, joins } = action.payload;
      const user = state.find(user => user.id === id);
      user.activity.joins = joins;
    },
  },
});

export const { addNewUser, setMatcheRides, postRide, getJoins } =
  usersSlice.actions;

export default usersSlice.reducer;
