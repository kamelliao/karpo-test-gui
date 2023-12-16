import React from 'react';
import { useSelector } from 'react-redux';

import {
  Box,
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

  let content;
  if (!user?.activity?.role) {
    content = (
      <Tabs isFitted variant="soft-rounded">
        <TabList>
          <Tab _selected={{ color: 'white', bg: 'green.400' }}>乘客</Tab>
          <Tab _selected={{ color: 'white', bg: 'blue.400' }}>司機</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <PassengerPanel />
          </TabPanel>
          <TabPanel>
            <DriverPanel />
          </TabPanel>
        </TabPanels>
      </Tabs>
    );
  } else {
    if (user.activity.role === 'passenger') {
      content = <PassengerPanel />;
    } else {
      content = <DriverPanel />;
    }
  }

  return (
    <MainPanelContainer>
      <UserCard user={user} />
      <Box mt={5}>{content}</Box>
    </MainPanelContainer>
  );
}
