import axios from 'axios';
import { camelizeKeys, decamelizeKeys } from 'humps';

import { selectCurrentUser } from './state/activity';
import { store } from './state/store';

const api = axios.create({
  baseURL: `${process.env.REACT_APP_BACKEND_API_URL}/api`,
  headers: {
    post: {
      'Content-Type': 'application/json',
    },
  },
});

api.interceptors.response.use(response => {
  if (response.headers['content-type'].includes('application/json')) {
    response.data = camelizeKeys(response.data);
  }
  return response;
});

api.interceptors.request.use(config => {
  const token = selectCurrentUser(store.getState())?.accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.headers['Content-Type'] === 'application/json' && config.data) {
    config.data = decamelizeKeys(config.data);
  }

  return config;
});

export const register = user => {
  return api.post('/auth/register', { ...user });
};

export const login = ({ username, password }) => {
  const params = new URLSearchParams();
  params.append('username', username);
  params.append('password', password);

  return api.post(`/auth/cookie/login`, params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
};

export const PassengerAPI = {
  postRequest: body => {
    return api.post(`/requests`, body);
  },
  postJoin: ({ rideId, requestId }) => {
    return api.post(`/rides/${rideId}/joins`, { requestId });
  },
  getMatches: ({ requestId }) => {
    return api.get(`/requests/${requestId}/matches`);
  },
  getJoinStatus: ({ rideId, joinId }) => {
    return api.get(`/rides/${rideId}/joins/${joinId}/status`);
  },
};

export const DriverAPI = {
  postRide: body => {
    return api.post(`/rides/`, body);
  },
  getJoins: async ({ rideId, status }) => {
    const { data: joinsData } = await api.get(
      `/rides/${rideId}/joins?status=${status}`,
    );
    const joins = await Promise.all(
      joinsData.joins.map(async join => {
        const { data: passenger } = await api.get(
          `/users/${join.passengerId}/profile`,
        );
        return {
          ...join,
          passengerInfo: passenger,
        };
      }),
    );

    return { data: { ...joinsData, joins } };
  },
  respondJoin: ({ rideId, joinId, action }) => {
    return api.put(`/rides/${rideId}/joins/${joinId}/status`, { action });
  },
};
