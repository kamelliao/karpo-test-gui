import { fakerZH_TW as faker } from '@faker-js/faker';

export const genUser = () => {
  return {
    name: faker.person.firstName(),
    email: faker.internet.email({ provider: 'gmail.com' }),
    password: '000000',
  };
};

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateTwoUniqueNumbers(min, max) {
  let num1 = getRandomInt(min, max);
  let num2 = getRandomInt(min, max);
  while (num2 === num1) {
    num2 = getRandomInt(min, max);
  }

  if (num1 > num2) {
    return [num2, num1];
  }
  return [num1, num2];
}

export const genRequest = ride => {
  const {
    departureTime,
    routeWithTime: { route },
  } = ride;
  const [orgIndex, dstIndex] = generateTwoUniqueNumbers(0, route.length - 1);
  const time = new Date(departureTime);
  return {
    time: time.toISOString(),
    origin: {
      longitude: route[orgIndex][0],
      latitude: route[orgIndex][1],
      description: faker.location.streetAddress(),
    },
    destination: {
      longitude: route[dstIndex][0],
      latitude: route[dstIndex][1],
      description: faker.location.streetAddress(),
    },
    num_passengers: faker.number.int({ min: 1, max: 3 }),
  };
};
