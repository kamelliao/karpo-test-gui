import React from 'react';
import Avatar, { genConfig } from 'react-nice-avatar';
import { useDispatch, useSelector } from 'react-redux';
import BeatLoader from 'react-spinners/BeatLoader';

import {
  Box,
  Button,
  Flex,
  HStack,
  Stack,
  Text,
  useBoolean,
} from '@chakra-ui/react';

import { login, register } from '../../api';
import { selectCurrentUser, selectUser } from '../../state/activity';
import { addNewUser } from '../../state/users';
import { genUser } from '../../utils/generator';

export const UserBox = ({ user, isActive, role, onClick }) => {
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
    >
      <Avatar style={{ width: '40px', height: '40px' }} {...config} />
      <Flex direction="column">
        <Text fontSize="sm">{name}</Text>
        <Text fontSize="xs">{email}</Text>
      </Flex>
    </HStack>
  );
};

function SideBarContainer({ children }) {
  return (
    <Box position="fixed">
      <Flex
        bg="none"
        transition="0.2s linear"
        w="300px"
        maxW="300px"
        ms={{
          sm: '16px',
        }}
        my={{
          sm: '16px',
        }}
        h="calc(100vh - 32px)"
        py="12px"
        ps="12px"
        pe="12px"
        m="0px"
        borderRadius="10px"
        borderWidth={1}
      >
        {children}
      </Flex>
    </Box>
  );
}

export default function Sidebar() {
  const dispatch = useDispatch();
  const users = useSelector(state => state.users);
  const currentUser = useSelector(state => selectCurrentUser(state));
  const [isRegisterLoading, setIsRegisterLoading] = useBoolean(false);

  const onNewUser = async () => {
    setIsRegisterLoading.on();
    const user = genUser();
    try {
      const { data: userData } = await register(user);
      const {
        data: { accessToken },
      } = await login({ username: user.email, password: user.password });

      dispatch(
        addNewUser({
          ...user,
          ...userData,
          accessToken,
        }),
      );
    } catch (error) {
      console.log(error);
    }
    setIsRegisterLoading.off();
  };

  const onSelectUser = user => {
    dispatch(selectUser(user));
  };

  return (
    <SideBarContainer>
      <Flex flex={1} gap={3} direction="column" justifyContent="space-between">
        <Stack direction="column-reverse" overflowY="scroll">
          {users.map(user => (
            <UserBox
              key={user.email}
              user={user}
              role={user?.activity?.role}
              isActive={user.id === currentUser?.id}
              onClick={() => {
                onSelectUser(user.id);
              }}
            />
          ))}
        </Stack>
        <Flex>
          <Button
            flex={1}
            onClick={onNewUser}
            isLoading={isRegisterLoading}
            spinner={<BeatLoader size={8} color="white" />}
          >
            新增使用者
          </Button>
        </Flex>
      </Flex>
    </SideBarContainer>
  );
}
