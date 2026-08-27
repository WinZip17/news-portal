declare module '*.css' {
  const content: string;
  export default content;
}

declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

interface ImportMetaEnv {
  readonly [key: string]: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly MODE: string;
  readonly SSR: boolean;
}
