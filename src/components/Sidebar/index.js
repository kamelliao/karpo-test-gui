import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import BeatLoader from 'react-spinners/BeatLoader';

import { Box, Button, Flex, Stack, useMediaQuery } from '@chakra-ui/react';

import { selectCurrentUser, selectUser } from '../../state/activity';
import { UserBox } from '../UserBox';
import UserGenerator from '../UserGenerator';

function SideBarContainer({ width = '300px', children }) {
  return (
    <Box position="fixed">
      <Flex
        backgroundColor="white"
        // transition="0.2s linear"
        w={width}
        maxW={width}
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
  const [isLargerThan992] = useMediaQuery('(min-width: 992px)');

  const onSelectUser = user => {
    dispatch(selectUser(user));
  };

  return (
    <SideBarContainer width={isLargerThan992 ? '300px' : '90px'}>
      <Flex flex={1} gap={3} direction="column" justifyContent="space-between">
        <Stack direction="column-reverse" overflowY="scroll">
          {users.map(user => (
            <UserBox
              key={user.email}
              user={user}
              variant={isLargerThan992 ? 'base' : 'simple'}
              role={user?.activity?.role}
              isActive={user.id === currentUser?.id}
              onClick={() => {
                onSelectUser(user.id);
              }}
            />
          ))}
        </Stack>
        <Flex>
          <UserGenerator
            renderButton={(onClick, isLoading) => (
              <Button
                flex={1}
                onClick={onClick}
                isLoading={isLoading}
                spinner={<BeatLoader size={8} color="white" />}
              >
                {isLargerThan992 ? '新增使用者' : '+'}
              </Button>
            )}
          />
        </Flex>
      </Flex>
    </SideBarContainer>
  );
}
