import Constants, { ExecutionEnvironment } from 'expo-constants';

function installDOMExceptionPolyfill(): void {
  const globalObj = global as typeof global & { DOMException?: typeof DOMException };

  if (typeof globalObj.DOMException !== 'undefined') {
    return;
  }

  class PolyfillDOMException extends Error {
    code: number;
    override name: string;

    constructor(message = '', name = 'Error') {
      super(message);
      this.name = name;
      this.code = 0;
      Object.setPrototypeOf(this, PolyfillDOMException.prototype);
    }
  }

  globalObj.DOMException =
    PolyfillDOMException as unknown as typeof DOMException;
}

installDOMExceptionPolyfill();

export function installLiveKitGlobals(): void {
  if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
    return;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { registerGlobals } = require('@livekit/react-native') as {
      registerGlobals: () => void;
    };
    registerGlobals();
  } catch (error) {
    console.warn('[LiveKit] registerGlobals failed:', error);
  }
}

installLiveKitGlobals();

export {};
