/// <reference types="vite/client" />

interface Window {
  MathJax?: {
    typesetPromise?: () => Promise<void>;
    typeset?: () => void;
  };
}

