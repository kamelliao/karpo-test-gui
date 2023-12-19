import React, { useEffect, useState } from 'react';
import Avatar, { genConfig } from 'react-nice-avatar';
import { useDispatch } from 'react-redux';

import { Flex, useBoolean } from '@chakra-ui/react';
import { toPng } from 'html-to-image';

import { login, register } from '../api';
import { addNewUser } from '../state/users';
import { genUser } from '../utils/generator';

const AvatarSource = ({ id, name }) => {
  const [config, setConfig] = useState(genConfig(name));

  useEffect(() => {
    setConfig(genConfig(name));
  }, [name]);

  return (
    <Flex style={{ zIndex: -1, position: 'absolute', left: '-1000px' }}>
      <Avatar id={id} style={{ width: '200px', height: '200px' }} {...config} />
    </Flex>
  );
};

export default function UserGenerator({ renderButton }) {
  const dispatch = useDispatch();

  const [isRegisterLoading, setIsRegisterLoading] = useBoolean(false);

  const [user, setUser] = useState(genUser());
  const [latestUser, setLatestUser] = useState();

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

      setLatestUser({
        ...user,
        ...userData,
        accessToken,
      });
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

  return (
    <>
      <AvatarSource id="avatar-source" name={user.name} />
      <Flex flex={1}>
        {renderButton(onNewUser, isRegisterLoading, latestUser)}
      </Flex>
    </>
  );
}
