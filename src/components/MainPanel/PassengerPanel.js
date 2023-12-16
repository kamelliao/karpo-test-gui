import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { RepeatIcon } from '@chakra-ui/icons';
import {
  Badge,
  Box,
  Button,
  HStack,
  Heading,
  Tag,
  Text,
  VStack,
} from '@chakra-ui/react';

import { PassengerAPI } from '../../api';
import { requestTemplates } from '../../data/requestTemplates';
import {
  selectCurrentUser,
  selectCurrentUserPassengerActivity,
} from '../../state/activity';
import { setMatcheRides } from '../../state/users';
import CodeEditor from '../CodeEditor';
import { UserBox } from '../Sidebar';

const defaultRequest = JSON.stringify(requestTemplates[0], null, 2);

const JoinStatusBadge = ({ status }) => (
  <Badge
    fontSize="xs"
    colorScheme={
      status === 'unasked' ? 'gray' : status === 'pending' ? 'yellow' : 'green'
    }
  >
    {status}
  </Badge>
);

export default function PassengerPanel() {
  const [requestBody, setRequestBody] = useState(defaultRequest);
  const [selectedRide, setSelectedRide] = useState(-1);

  const dispatch = useDispatch();
  const user = useSelector(state => selectCurrentUser(state));
  const { requestId, matches } = useSelector(state =>
    selectCurrentUserPassengerActivity(state),
  );

  const handlePostRequest = () => {
    PassengerAPI.postRequest(JSON.parse(requestBody))
      .then(({ data }) => {
        dispatch(
          setMatcheRides({
            id: user.id,
            requestId: data.requestId,
            matches: data.matches,
          }),
        );
      })
      .catch(console.log);
  };

  const handlePostJoin = () => {
    const ride = matches[selectedRide];
    PassengerAPI.postJoin({ rideId: ride.rideId, requestId: requestId })
      .then(({ data }) => {})
      .catch(console.log);
  };

  const handleGetMatches = () => {
    PassengerAPI.getMatches({ requestId })
      .then(({ data }) => {
        dispatch(
          setMatcheRides({
            id: user.id,
            requestId,
            matches: data.matches,
          }),
        );
      })
      .catch(console.log);
  };

  

  return (
    <>
      <Box>
        <Heading size="md" py={2}>
          發布共乘需求
        </Heading>
        <VStack alignItems="stretch">
          <Box width="100%">
            <CodeEditor value={requestBody} onValueChange={setRequestBody} />
          </Box>
          <Button onClick={handlePostRequest} isDisabled={!user}>
            發出需求
          </Button>
        </VStack>
      </Box>
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
              {matches?.map(({ driverInfo }, index) => (
                <UserBox
                  key={`match-${user?.id}-${index}`}
                  user={driverInfo}
                  isActive={index === selectedRide}
                  onClick={() => setSelectedRide(index)}
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
                <Tag size="sm">status</Tag>
                <JoinStatusBadge status={matches?.[selectedRide]?.status} />
              </HStack>
              <HStack>
                <Tag size="sm">request_id</Tag>
                <Text fontSize="sm">{requestId}</Text>
              </HStack>
            </HStack>
            <SyntaxHighlighter
              language="json"
              style={oneLight}
              customStyle={{ height: '17rem', fontSize: 12 }}
            >
              {selectedRide >= 0 &&
                JSON.stringify(matches[selectedRide], null, 4)}
            </SyntaxHighlighter>
            <Button isDisabled={selectedRide === -1} onClick={handlePostJoin}>
              請求共乘
            </Button>
          </VStack>
        </HStack>
      </Box>
    </>
  );
}
