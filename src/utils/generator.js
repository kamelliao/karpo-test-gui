import { fakerZH_TW as faker } from '@faker-js/faker';

export const genUser = () => {
  return {
    name: faker.person.fullName(),
    email: faker.internet.email({ provider: 'gmail.com' }),
    password: '000000',
  };
};
