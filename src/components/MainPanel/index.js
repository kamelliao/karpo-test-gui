import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import {
  Box,
  Button,
  ButtonGroup,
  HStack,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tag,
  Text,
} from '@chakra-ui/react';

import { selectCurrentUser } from '../../state/activity';
import DriverPanel from './DriverPanel';
import PassengerPanel from './PassengerPanel';

function MainPanelContainer({ props, children }) {
  return (
    <Box
      {...props}
      w="calc(100% - 300px)"
      __css={{
        float: 'right',
        maxWidth: '100%',
        overflow: 'auto',
        position: 'relative',
        maxHeight: '100%',
        transition: 'all 0.33s cubic-bezier(0.685, 0.0473, 0.346, 1)',
        transitionDuration: '.2s, .2s, .35s',
        transitionProperty: 'top, bottom, width',
        transitionTimingFunction: 'linear, linear, ease',
      }}
    >
      <Box __css={{ ms: 'auto', me: 'auto', ps: '15px', pe: '15px' }}>
        <Box __css={{ p: '15px 15px', minHeight: 'calc(100vh - 123px)' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}

const UserCard = ({ user }) => {
  const { id, name, email, password, accessToken } = user ?? {};

  return (
    <Box w="full" borderRadius="md" backgroundColor="gray.50" px={3} py={3}>
      <Stack>
        <HStack>
          <Tag>id</Tag>
          <Text>{id}</Text>
        </HStack>
        <HStack>
          <Tag>name</Tag>
          <Text>{name}</Text>
        </HStack>
        <HStack>
          <Tag>email</Tag>
          <Text>{email}</Text>
        </HStack>
        <HStack>
          <Tag>password</Tag>
          <Text>{password}</Text>
        </HStack>
        <HStack>
          <Tag>accessToken</Tag>
          <Text>{accessToken}</Text>
        </HStack>
      </Stack>
    </Box>
  );
};

export default function MainPanel() {
  const user = useSelector(state => selectCurrentUser(state));
  const [tab, setTab] = useState(0);

  useEffect(() => {
    if (user?.activity?.role) {
      setTab(user?.activity?.role === 'passenger' ? 0 : 1);
    }
  }, [user]);

  return (
    <MainPanelContainer>
      <UserCard user={user} />
      <Box>
        <ButtonGroup width="100%" my={5} isDisabled={user?.activity?.role}>
          <Button
            flex={1}
            colorScheme="green"
            onClick={() => setTab(0)}
            variant={tab === 0 ? 'solid' : 'ghost'}
          >
            乘客
          </Button>
          <Button
            flex={1}
            colorScheme="blue"
            onClick={() => setTab(1)}
            variant={tab === 1 ? 'solid' : 'ghost'}
          >
            司機
          </Button>
        </ButtonGroup>
        <Box>{tab === 0 ? <PassengerPanel /> : <DriverPanel />}</Box>
      </Box>
    </MainPanelContainer>
  );
}
