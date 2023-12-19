import { Prism as BaseSyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { CheckIcon, CopyIcon } from '@chakra-ui/icons';
import { Box, IconButton, useClipboard } from '@chakra-ui/react';

export function SyntaxHighlighter({ language, height = '20rem', children }) {
  const { onCopy, hasCopied } = useClipboard(children);

  return (
    <Box position="relative">
      <IconButton
        onClick={onCopy}
        size="xs"
        position="absolute"
        right="2%"
        top="5%"
        {...(hasCopied
          ? {
              icon: <CheckIcon />,
              colorScheme: 'green',
              variant: 'ghost',
            }
          : {
              icon: <CopyIcon />,
              colorScheme: 'gray',
            })}
      />
      <BaseSyntaxHighlighter
        language={language}
        style={oneLight}
        lineProps={{
          style: { wordBreak: 'break-all', whiteSpace: 'pre-wrap' },
        }}
        wrapLines={true}
        customStyle={{
          height,
          fontSize: 12,
        }}
      >
        {children}
      </BaseSyntaxHighlighter>
    </Box>
  );
}
