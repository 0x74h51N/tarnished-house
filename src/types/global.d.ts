export {};

declare global {
  interface Navigator {
    keyboard?: {
      lock: (keys?: string[]) => Promise<void>;
      unlock: () => void;
    };
  }
}
