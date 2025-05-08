interface RuntimeEnv {
  VITE_API_URL?: string;
}

interface Window {
  ENV?: RuntimeEnv;
}
