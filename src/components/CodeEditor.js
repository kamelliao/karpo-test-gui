import Editor from 'react-simple-code-editor';

import { css } from '@emotion/css';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prism-themes/themes/prism-one-light.css';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-json';

export default function CodeEditor(props) {
  return (
    <Editor
      padding={15}
      className={css`
        font-size: 12px;
        font-family: 'Fira Code', 'Fira Mono', 'Menlo', 'Consolas',
          'DejaVu Sans Mono', 'monospace';
        background-color: #fafafa;
        border-radius: 3px;
        textarea {
          outline: 0;
        }
      `}
      highlight={code => highlight(code, languages.json)}
      {...props}
    />
  );
}
