import React, { useEffect, useRef, useState } from 'react';
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
import { toPng } from 'html-to-image';

import { login, register } from '../../api';
import { selectCurrentUser, selectUser } from '../../state/activity';
import { addNewUser } from '../../state/users';
import { genUser } from '../../utils/generator';
import { UserBox } from '../UserBox';

function SideBarContainer({ children }) {
  return (
    <Box position="fixed" backgroundColor="white">
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

const AvatarSource = ({ id, name }) => {
  const [config, setConfig] = useState(genConfig(name));

  useEffect(() => {
    setConfig(genConfig(name));
  }, [name]);

  return (
    <Flex style={{ zIndex: -1, position: 'absolute' }}>
      <Avatar id={id} style={{ width: '200px', height: '200px' }} {...config} />
    </Flex>
  );
};

export default function Sidebar() {
  const dispatch = useDispatch();
  const users = useSelector(state => state.users);
  const currentUser = useSelector(state => selectCurrentUser(state));
  const [isRegisterLoading, setIsRegisterLoading] = useBoolean(false);

  const [user, setUser] = useState(genUser());

  const onNewUser = async () => {
    setIsRegisterLoading.on();
    try {
      const node = document.getElementById('avatar-source');
      const avatar = await toPng(node);
      const { data: userData } = await register({
        ...user,
        avatar: avatar.split(',')[1],
      });
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
    setUser(genUser());
    setIsRegisterLoading.off();
  };

  const onSelectUser = user => {
    dispatch(selectUser(user));
  };

  return (
    <>
      <AvatarSource id="avatar-source" name={user.name} />
      <SideBarContainer>
        <Flex
          flex={1}
          gap={3}
          direction="column"
          justifyContent="space-between"
        >
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
    </>
  );
}
