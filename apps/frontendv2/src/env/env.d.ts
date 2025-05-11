interface RuntimeEnv {
  VITE_API_URL?: string;
  VITE_WS_URL?: string;
}

interface Window {
  ENV?: RuntimeEnv;
}
