import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import BeatLoader from 'react-spinners/BeatLoader';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { RepeatIcon } from '@chakra-ui/icons';
import { CheckIcon } from '@chakra-ui/icons';
import {
  Badge,
  Box,
  Button,
  ButtonGroup,
  HStack,
  Heading,
  Tag,
  Text,
  VStack,
} from '@chakra-ui/react';

import { DriverAPI } from '../../api';
import { rideTemplates } from '../../data/rideTemplates';
import {
  selectCurrentUser,
  selectCurrentUserDriverActivity,
} from '../../state/activity';
import { getJoins, postRide } from '../../state/users';
import CodeEditor from '../CodeEditor';
import { UserBox } from '../UserBox';

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
  const handlePostRide = () => {
    setIsPostRideLoading(true);
    DriverAPI.postRide(JSON.parse(rideBody))
      .then(({ data }) => {
        dispatch(
          postRide({
            id: user.id,
            rideId: data.rideId,
          }),
        );
      })
      .catch(console.log)
      .finally(() => {
        setIsPostRideLoading(false);
      });
  };

  return (
    <Box>
      <VStack alignItems="stretch">
        <Box width="100%" maxH="20rem" overflowY="scroll">
          <CodeEditor value={rideBody} onValueChange={setRideBody} />
        </Box>
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

  return (
    <>
      <PostRideSection />
      {rideId && (
        <Box my={5}>
          <HStack>
            <VStack
              h="24em"
              w="20em"
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
            <VStack flex={1} p={3} alignItems="stretch">
              <Box
                w="full"
                borderRadius="md"
                backgroundColor="gray.50"
                px={3}
                py={3}
              >
                <HStack>
                  <Tag size="sm">ride_id</Tag>
                  <Text fontSize="sm">{rideId}</Text>
                </HStack>
              </Box>
              <SyntaxHighlighter
                language="json"
                style={oneLight}
                customStyle={{ height: '17rem', fontSize: 12 }}
              >
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
          </HStack>
        </Box>
      )}
    </>
  );
}
