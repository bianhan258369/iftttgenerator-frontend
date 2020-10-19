import { NgxMonacoEditorConfig } from "ngx-monaco-editor";

export const MonacoConfig: NgxMonacoEditorConfig = {
  baseUrl: "assets", // configure base path for monaco editor
  defaultOptions: { scrollBeyondLastLine: false }, // pass default options to be used
  onMonacoLoad: monacoOnLoad
};

export function monacoOnLoad() {
  // here monaco object will be available as window.monaco use this function to extend monaco editor functionalities.
  // register Monaco languages
  monaco.languages.register({
    id: "req",
    aliases: ["Req", "req", "req"],
    extensions: [".req"],
    mimetypes: ["text/req"]
  });
  monaco.languages.setMonarchTokensProvider('req', {
    tokenizer: {
      root: [
        [/SHOULD|ALWAYS|BE|ACTIVE|NEVER|HAPPEN|OCCUR|TOGETHER|IF|THEN|FOR|PREFERRED|IS|AND|OR|ABOVE|BELOW/, "req-key"],
      ]
    }
  });
  monaco.editor.defineTheme('reqTheme', {
    base: 'vs',
    inherit: false,
    rules: [
      { token: 'req-key', foreground: '4B0082' },
    ],
    colors: {
      // 'editor.background':'#f4f4f4',
      'editorLineNumber.foreground':'#222222',
      'editor.lineHighlightBackground':'#f4f4f4',
    }
  });
  // monaco.languages.register({
  //     id: 'json',
  //     extensions: ['.json', '.bowerrc', '.jshintrc', '.jscsrc', '.eslintrc', '.babelrc'],
  //     aliases: ['JSON', 'json'],
  //     mimetypes: ['application/json'],
  // });

  // // register Monaco languages
  // monaco.languages.register({
  //     id: 'typescript',
  //     extensions: ['.ts', '.tsc'],
  //     aliases: ['TYPESCRIPT', 'typescript'],
  //     mimetypes: ['text/x-typescript'],
  // });
}
