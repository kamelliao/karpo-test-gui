import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RepeatIcon } from '@chakra-ui/icons';
import {
  Badge,
  Box,
  Button,
  ButtonGroup,
  HStack,
  IconButton,
  Tag,
  Wrap,
  WrapItem,
  useMediaQuery,
} from '@chakra-ui/react';

import { CommonAPI, UsersAPI } from '../../api';
import { selectCurrentUser } from '../../state/activity';
import { getRequest, getRide } from '../../state/users';
import { Field } from '../Field';
import DriverPanel from './DriverPanel';
import PassengerPanel from './PassengerPanel';

function MainPanelContainer({ props, children }) {
  const [isLargerThan992] = useMediaQuery('(min-width: 992px)');
  const width = isLargerThan992 ? 'calc(100% - 300px)' : 'calc(100% - 90px)';

  return (
    <Box
      {...props}
      w={width}
      __css={{
        float: 'right',
        maxWidth: '100%',
        overflow: 'auto',
        position: 'relative',
        maxHeight: '100%',
        // transition: 'all 0.33s cubic-bezier(0.685, 0.0473, 0.346, 1)',
        // transitionDuration: '.2s, .2s, .35s',
        // transitionProperty: 'top, bottom, width',
        // transitionTimingFunction: 'linear, linear, ease',
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
    <Box
      w="full"
      borderRadius="md"
      backgroundColor="gray.50"
      px={3}
      py={3}
      overflowX="scroll"
    >
      <Wrap>
        <WrapItem>
          <Field field="id" value={id} />
        </WrapItem>
        <WrapItem>
          <Field field="name" value={name} />
        </WrapItem>
        <WrapItem>
          <Field field="email" value={email} />
        </WrapItem>
        <WrapItem>
          <Field field="password" value={password} />
        </WrapItem>
        <WrapItem>
          <Field field="accessToken" value={accessToken} />
        </WrapItem>
      </Wrap>
    </Box>
  );
};

const ActivityBar = ({ user }) => {
  const dispatch = useDispatch();

  const onRefershActivity = async () => {
    try {
      const { data: activeItems } = await UsersAPI.getActivity();
      if (activeItems.driverState) {
        const rideId = activeItems.driverState.rideId;
        const {
          data: { ride },
        } = await CommonAPI.getRide(rideId);
        dispatch(getRide({ id: user.id, rideId, ride }));
      } else if (activeItems.passengerState) {
        const requestId = activeItems.passengerState.requestId;
        const { data: request } = await CommonAPI.getRequest(requestId);
        dispatch(getRequest({ id: user.id, requestId, request }));
      }
    } catch (error) {
      console.log(error);
    }
  };

  let activityFields;
  if (user?.activity) {
    if (user.activity.role === 'driver') {
      activityFields = (
        <WrapItem>
          <Field field="ride_id" value={user.activity.rideId} />
        </WrapItem>
      );
    } else if (user.activity.role === 'passenger') {
      activityFields = (
        <WrapItem>
          <Field field="request_id" value={user.activity.requestId} />
        </WrapItem>
      );
    }
  }
  return (
    <HStack>
      <Box
        w="full"
        borderRadius="md"
        backgroundColor="gray.50"
        px={3}
        py={3}
        overflowX="scroll"
      >
        <HStack>
          <HStack>
            <Tag size="sm">role</Tag>
            <Badge
              colorScheme={
                !user?.activity?.role
                  ? 'gray'
                  : user.activity.role === 'driver'
                    ? 'blue'
                    : 'green'
              }
            >
              {user?.activity?.role}
            </Badge>
          </HStack>
          {activityFields}
        </HStack>
      </Box>
      <IconButton onClick={onRefershActivity} icon={<RepeatIcon />} />
    </HStack>
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
      <Box my={2}>
        <ActivityBar user={user} />
      </Box>
      <Box mt={3}>
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
