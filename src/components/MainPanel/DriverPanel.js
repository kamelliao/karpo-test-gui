import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import BeatLoader from 'react-spinners/BeatLoader';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { RepeatIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Flex,
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
import { UserBox } from '../Sidebar';

function PostRideSection() {
  const dispatch = useDispatch();
  const user = useSelector(state => selectCurrentUser(state));
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
      <Heading size="md" py={2}>
        發布共乘行程
      </Heading>
      <VStack alignItems="stretch">
        <Box width="100%" maxH="20rem" overflowY="scroll">
          <CodeEditor value={rideBody} onValueChange={setRideBody} />
        </Box>
        <Button
          onClick={handlePostRide}
          isDisabled={!user}
          isLoading={isPostRideLoading}
          spinner={<BeatLoader size={8} color="white" />}
        >
          發布行程
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

  const [selectedJoin, setSelectedJoun] = useState(-1);

  const handleGetJoins = () => {
    DriverAPI.getJoins({ rideId, status: 'pending' })
      .then(({ data }) => {
        dispatch(getJoins({ id: user.id, joins: data.joins }));
      })
      .catch(console.log);
  };

  const handleRespondJoin = (action) => () => {
      DriverAPI.respondJoin({rideId, joinId: joins[selectedJoin].joinId, action})
  }

  return (
    <>
      <PostRideSection />
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
              {joins?.map(({ passengerInfo }, index) => (
                <UserBox
                  key={`join-${user?.id}-${index}`}
                  user={passengerInfo}
                  isActive={index === selectedJoin}
                  onClick={() => setSelectedJoun(index)}
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
                <Text fontSize="sm">{user?.activity?.rideId}</Text>
              </HStack>
            </Box>
            <SyntaxHighlighter
              language="json"
              style={oneLight}
              customStyle={{ height: '17rem', fontSize: 12 }}
            >
              {selectedJoin >= 0 &&
                JSON.stringify(joins[selectedJoin], null, 4)}
            </SyntaxHighlighter>
            <HStack>
              <Button onClick={handleRespondJoin('accept')} flex={2} isDisabled={selectedJoin === -1}>
                同意
              </Button>
              <Button onClick={handleRespondJoin('reject')}  flex={1} isDisabled={selectedJoin === -1}>
                拒絕
              </Button>
            </HStack>
          </VStack>
        </HStack>
      </Box>
    </>
  );
}