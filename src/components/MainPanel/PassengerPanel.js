import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import BeatLoader from 'react-spinners/BeatLoader';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { CheckIcon, RepeatIcon } from '@chakra-ui/icons';
import {
  Badge,
  Box,
  Button,
  HStack,
  Heading,
  Tag,
  Text,
  VStack,
  useBoolean,
} from '@chakra-ui/react';

import { PassengerAPI } from '../../api';
import { requestTemplates } from '../../data/requestTemplates';
import {
  selectCurrentUser,
  selectCurrentUserPassengerActivity,
} from '../../state/activity';
import { setMatcheRides } from '../../state/users';
import CodeEditor from '../CodeEditor';
import { UserBox } from '../UserBox';

export default function PassengerPanel() {
  const [requestBody, setRequestBody] = useState(
    JSON.stringify(requestTemplates[0], null, 2),
  );
  const [isPostRequestLoading, setIsPostRequestLoading] = useBoolean(false);
  const [isPostJoinLoading, setIsPostJoinLoading] = useBoolean(false);

  const [selectedRide, setSelectedRide] = useState(-1);

  const dispatch = useDispatch();
  const user = useSelector(state => selectCurrentUser(state));
  const { requestId, matches } = useSelector(state =>
    selectCurrentUserPassengerActivity(state),
  );

  useEffect(() => {
    setSelectedRide(-1);
  }, [user]);

  const handlePostRequest = async () => {
    setIsPostRequestLoading.on();
    try {
      const {
        data: { requestId, matches },
      } = await PassengerAPI.postRequest(JSON.parse(requestBody));
      dispatch(
        setMatcheRides({
          id: user.id,
          requestId,
          matches,
        }),
      );
    } catch (error) {
      console.log(error);
    }
    setIsPostRequestLoading.off();
  };

  const handlePostJoin = async () => {
    setIsPostJoinLoading.on();
    const ride = matches[selectedRide];
    try {
      await PassengerAPI.postJoin({
        rideId: ride.rideId,
        requestId: requestId,
      });
    } catch (error) {
      console.log(error);
    }
    handleGetMatches();
    setIsPostJoinLoading.off();
  };

  const handleGetMatches = async () => {
    try {
      const {
        data: { matches },
      } = await PassengerAPI.getMatches({ requestId });
      dispatch(
        setMatcheRides({
          id: user.id,
          requestId,
          matches,
        }),
      );
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Box>
        <VStack alignItems="stretch">
          <Box width="100%">
            <CodeEditor value={requestBody} onValueChange={setRequestBody} />
          </Box>
          {!requestId ? (
            <Button
              onClick={handlePostRequest}
              isDisabled={!user}
              isLoading={isPostRequestLoading}
              spinner={<BeatLoader size={8} color="white" />}
            >
              發出需求
            </Button>
          ) : (
            <Button isDisabled colorScheme="green" rightIcon={<CheckIcon />}>
              已成功發出需求
            </Button>
          )}
        </VStack>
      </Box>
      {requestId && (
        <Box my={5}>
          <HStack>
            <VStack
              h="24em"
              w="20em"
              p={3}
              overflowY="scroll"
              borderRadius="md"
              borderWidth={1}
              alignItems="stretch"
            >
              <HStack>
                <Heading flex={1} size="sm" textAlign="center">
                  匹配司機列表
                </Heading>
                <Button
                  onClick={handleGetMatches}
                  size="sm"
                  rightIcon={<RepeatIcon />}
                >
                  刷新
                </Button>
              </HStack>
              <VStack overflowY="scroll" alignItems="stretch">
                {matches?.map(({ status, driverInfo }, index) => (
                  <UserBox
                    key={`match-${user?.id}-${index}`}
                    user={driverInfo}
                    isActive={index === selectedRide}
                    onClick={() => setSelectedRide(index)}
                    accessoryRight={
                      status === 'unasked' ? (
                        <Badge>unasked</Badge>
                      ) : status === 'accepted' ? (
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
              <HStack
                w="full"
                borderRadius="md"
                backgroundColor="gray.50"
                px={3}
                py={3}
              >
                <HStack>
                  <Tag size="sm">request_id</Tag>
                  <Text fontSize="sm">{requestId}</Text>
                </HStack>
              </HStack>
              <SyntaxHighlighter
                language="json"
                style={oneLight}
                customStyle={{
                  height: '17rem',
                  maxWidth: '45rem',
                  fontSize: 12,
                }}
              >
                {selectedRide >= 0 &&
                  JSON.stringify(matches[selectedRide], null, 4)}
              </SyntaxHighlighter>
              {selectedRide === -1 || !matches[selectedRide]?.joinId ? (
                <Button
                  isDisabled={selectedRide === -1}
                  onClick={handlePostJoin}
                  isLoading={isPostJoinLoading}
                  spinner={<BeatLoader size={8} color="white" />}
                >
                  請求共乘
                </Button>
              ) : (
                <Button
                  isDisabled
                  colorScheme="green"
                  rightIcon={<CheckIcon />}
                >
                  已成功發出請求
                </Button>
              )}
            </VStack>
          </HStack>
        </Box>
      )}
    </>
  );
}
