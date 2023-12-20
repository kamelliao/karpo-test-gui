import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import BeatLoader from 'react-spinners/BeatLoader';

import { RepeatIcon } from '@chakra-ui/icons';
import { CheckIcon } from '@chakra-ui/icons';
import {
  Badge,
  Box,
  Button,
  ButtonGroup,
  Flex,
  HStack,
  Heading,
  IconButton,
  Text,
  VStack,
  WrapItem,
  useBoolean,
} from '@chakra-ui/react';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';

import { CommonAPI, DriverAPI, PassengerAPI } from '../../api';
import { rideTemplates } from '../../data/rideTemplates';
import {
  selectCurrentUser,
  selectCurrentUserDriverActivity,
  selectInactiveUsers,
} from '../../state/activity';
import { getJoins, getRequest, postRide } from '../../state/users';
import { genRequest } from '../../utils/generator';
import CodeEditor from '../CodeEditor';
import { SyntaxHighlighter } from '../SyntaxHighlighter';
import { UserBox } from '../UserBox';

const RideBox = ({ time, origin, destination, onClick, isActive = false }) => (
  <HStack
    onClick={onClick}
    paddingX={3}
    paddingY={3}
    borderRadius="lg"
    backgroundColor={!isActive ? 'gray.50' : 'gray.200'}
    transition=".3s"
    _hover={{
      backgroundColor: 'gray.200',
      cursor: 'pointer',
    }}
    justifyContent="space-between"
  >
    <VStack alignItems="stretch">
      <Text fontSize="sm">{time}</Text>
      <HStack>
        <Text fontSize="sm" minWidth={180}>
          {origin}
        </Text>
        <Text fontSize="sm">→</Text>
        <Text fontSize="sm">{destination}</Text>
      </HStack>
    </VStack>
  </HStack>
);

function PostRideSection() {
  const dispatch = useDispatch();
  const user = useSelector(state => selectCurrentUser(state));
  const { rideId } = useSelector(state =>
    selectCurrentUserDriverActivity(state),
  );
  const [rideBody, setRideBody] = useState(
    JSON.stringify(rideTemplates[0], null, 2),
  );
  const [isPostRideLoading, setIsPostRideLoading] = useState(false);
  const handlePostRide = async () => {
    setIsPostRideLoading(true);
    try {
      const {
        data: { rideId },
      } = await DriverAPI.postRide(JSON.parse(rideBody));
      const {
        data: { ride },
      } = await CommonAPI.getRide(rideId);
      dispatch(postRide({ id: user.id, rideId, ride }));
    } catch (error) {
      console.log(error);
    }
    setIsPostRideLoading(false);
  };

  return (
    <Box>
      <VStack alignItems="stretch">
        <HStack>
          <VStack
            flex={1}
            h="20em"
            minWidth="18rem"
            p={3}
            borderRadius="md"
            borderWidth={1}
            alignItems="stretch"
          >
            <HStack>
              <Heading flex={1} size="sm" textAlign="center">
                司機邀請範本
              </Heading>
            </HStack>
            <VStack overflowY="scroll" alignItems="stretch">
              {rideTemplates.map((ride, index) => (
                <RideBox
                  key={`request-${index}`}
                  onClick={() => setRideBody(JSON.stringify(ride, null, 2))}
                  time={format(ride.departure_time, 'LLLdo EE p', {
                    locale: zhTW,
                  })}
                  origin={ride.origin.description}
                  destination={ride.destination.description}
                />
              ))}
            </VStack>
          </VStack>
          <Box width="60%" maxH="20rem" overflowY="scroll">
            <CodeEditor value={rideBody} onValueChange={setRideBody} />
          </Box>
        </HStack>

        {!rideId ? (
          <Button
            onClick={handlePostRide}
            isDisabled={!user}
            isLoading={isPostRideLoading}
            spinner={<BeatLoader size={8} color="white" />}
          >
            發布行程
          </Button>
        ) : (
          <Button isDisabled colorScheme="blue" rightIcon={<CheckIcon />}>
            已成功發布行程
          </Button>
        )}
      </VStack>
    </Box>
  );
}

function ActivitySection() {
  const user = useSelector(state => selectCurrentUser(state));
  const inActiveUsers = useSelector(state => selectInactiveUsers(state));
  const dispatch = useDispatch();

  const [isCreatePassengerLoading, setIsCreatePassengerLoading] =
    useBoolean(false);

  const onCreatePassenger = async () => {
    setIsCreatePassengerLoading.on();
    const newUser = inActiveUsers.pop();
    const request = genRequest(user.activity.ride);
    try {
      const {
        data: { requestId },
      } = await PassengerAPI.postRequestAgent({
        token: newUser.accessToken,
        body: request,
      });
      await PassengerAPI.postJoinAgent({
        token: newUser.accessToken,
        rideId: user.activity.rideId,
        requestId,
      });
      dispatch(getRequest({ id: newUser.id, requestId, request }));
    } catch (error) {
      console.log(error);
    }
    setIsCreatePassengerLoading.off();
  };

  return (
    <Box>
      <VStack alignItems="stretch">
        <Box width="100%">
          <SyntaxHighlighter language="json" height="15rem">
            {JSON.stringify(user?.activity?.ride, null, 2)}
          </SyntaxHighlighter>
        </Box>

        <Button
          isDisabled={inActiveUsers.length <= 0}
          isLoading={isCreatePassengerLoading}
          spinner={<BeatLoader size={8} color="white" />}
          onClick={onCreatePassenger}
        >
          產生乘客
        </Button>
      </VStack>
    </Box>
  );
}

export default function DriverPanel() {
  const dispatch = useDispatch();
  const user = useSelector(state => selectCurrentUser(state));
  const { rideId, joins } = useSelector(state =>
    selectCurrentUserDriverActivity(state),
  );

  const [selectedJoin, setSelectedJoin] = useState(-1);

  useEffect(() => {
    setSelectedJoin(-1);
  }, [user]);

  const handleGetJoins = async () => {
    try {
      const {
        data: { joins: acceptedJoins },
      } = await DriverAPI.getJoins({
        rideId,
        status: 'accepted',
      });
      const {
        data: { joins: pendingJoins },
      } = await DriverAPI.getJoins({
        rideId,
        status: 'pending',
      });
      const joins = [
        ...acceptedJoins.map(join => ({ status: 'accepted', ...join })),
        ...pendingJoins.map(join => ({ status: 'pending', ...join })),
      ];
      dispatch(getJoins({ id: user.id, joins }));
    } catch (error) {
      console.log(error);
    }
  };

  const handleRespondJoin = action => async () => {
    try {
      await DriverAPI.respondJoin({
        rideId,
        joinId: joins[selectedJoin].joinId,
        action,
      });
    } catch (error) {
      console.log(error);
    }

    handleGetJoins();
  };

  if (!rideId) {
    return <PostRideSection />;
  }

  return (
    <>
      {!rideId ? (
        <PostRideSection />
      ) : (
        <>
          <ActivitySection />
          <Box my={5}>
            <Flex gap={3} flexWrap="wrap">
              <VStack
                flex={1}
                h="24em"
                minWidth="15rem"
                p={3}
                borderRadius="md"
                borderWidth={1}
                alignItems="stretch"
              >
                <HStack>
                  <Heading flex={1} size="sm" textAlign="center">
                    乘客邀請列表
                  </Heading>
                  <Button
                    onClick={handleGetJoins}
                    size="sm"
                    rightIcon={<RepeatIcon />}
                  >
                    刷新
                  </Button>
                </HStack>
                <VStack overflowY="scroll" alignItems="stretch">
                  {joins?.map(({ status, passengerInfo }, index) => (
                    <UserBox
                      key={`join-${user?.id}-${index}`}
                      user={passengerInfo}
                      isActive={index === selectedJoin}
                      onClick={() => setSelectedJoin(index)}
                      accessoryRight={
                        status === 'accepted' ? (
                          <Badge colorScheme="green">accepted</Badge>
                        ) : (
                          <Badge colorScheme="yellow">pending</Badge>
                        )
                      }
                    />
                  ))}
                </VStack>
              </VStack>
              <VStack flex={2} alignItems="stretch">
                <SyntaxHighlighter language="json" height="20rem">
                  {selectedJoin >= 0 &&
                    JSON.stringify(joins?.[selectedJoin], null, 4)}
                </SyntaxHighlighter>
                <ButtonGroup
                  isDisabled={
                    selectedJoin === -1 ||
                    joins[selectedJoin].status === 'accepted'
                  }
                >
                  <Button onClick={handleRespondJoin('accept')} flex={2}>
                    同意
                  </Button>
                  <Button onClick={handleRespondJoin('reject')} flex={1}>
                    拒絕
                  </Button>
                </ButtonGroup>
              </VStack>
            </Flex>
          </Box>
        </>
      )}
    </>
  );
}
