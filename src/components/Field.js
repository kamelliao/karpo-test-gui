import { HStack, Tag, Text, Tooltip, useClipboard } from '@chakra-ui/react';

export function Field({ field, value, size = 'sm' }) {
  const { onCopy, hasCopied } = useClipboard(value);
  return (
    <HStack>
      <Tag size={size}>{field}</Tag>
      <Tooltip label="已複製" isOpen={hasCopied}>
        <Text
          fontSize={size}
          whiteSpace="nowrap"
          _hover={{ cursor: 'pointer' }}
          onClick={onCopy}
        >
          {value}
        </Text>
      </Tooltip>
    </HStack>
  );
}
