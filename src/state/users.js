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
      const { id, rideId, ride } = action.payload;
      const user = state.find(user => user.id === id);
      user.activity = { role: 'driver', rideId, ride };
    },
    getJoins: (state, action) => {
      const { id, joins } = action.payload;
      const user = state.find(user => user.id === id);
      user.activity.joins = joins;
      // user.activity.joins = {
      //   [status]: joins.map(join => ({ status, ...join })),
      // };
    },
    getRide: (state, action) => {
      const { id, rideId, ride } = action.payload;
      const user = state.find(user => user.id === id);
      user.activity = { ...user.activity, role: 'driver', rideId, ride };
    },
    getRequest: (state, action) => {
      const { id, requestId, request } = action.payload;
      const user = state.find(user => user.id === id);
      user.activity = {
        ...user.activity,
        role: 'passenger',
        requestId,
        request,
      };
    },
  },
});

export const {
  addNewUser,
  setMatcheRides,
  postRide,
  getJoins,
  getRide,
  getRequest,
} = usersSlice.actions;

export default usersSlice.reducer;
