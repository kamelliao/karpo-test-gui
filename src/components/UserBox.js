import React from 'react';
import Avatar, { genConfig } from 'react-nice-avatar';

import { Flex, HStack, Text } from '@chakra-ui/react';

export const UserBox = ({ user, isActive, role, onClick, accessoryRight }) => {
  const { name, email } = user;
  const config = genConfig(name);

  return (
    <HStack
      onClick={onClick}
      paddingX={3}
      paddingY={3}
      borderRadius="lg"
      {...(!role
        ? null
        : {
            borderWidth: 1,
            borderColor: role === 'passenger' ? 'green.400' : 'blue.400',
          })}
      backgroundColor={!isActive ? 'gray.50' : 'gray.200'}
      transition=".3s"
      _hover={{
        backgroundColor: 'gray.200',
        cursor: 'pointer',
      }}
      justifyContent="space-between"
    >
      <HStack>
        <Avatar style={{ width: '40px', height: '40px' }} {...config} />
        <Flex direction="column">
          <Text fontSize="sm">{name}</Text>
          <Text fontSize="xs">{email}</Text>
        </Flex>
      </HStack>
      {accessoryRight}
    </HStack>
  );
};
