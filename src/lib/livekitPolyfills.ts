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

function installEventPolyfill(): void {
  const globalObj = global as typeof global & { Event?: typeof Event };

  if (typeof globalObj.Event !== 'undefined') {
    return;
  }

  class PolyfillEvent {
    type: string;
    bubbles: boolean;
    cancelable: boolean;

    constructor(type: string, eventInitDict?: { bubbles?: boolean; cancelable?: boolean }) {
      this.type = type;
      this.bubbles = eventInitDict?.bubbles ?? false;
      this.cancelable = eventInitDict?.cancelable ?? false;
    }
  }

  globalObj.Event = PolyfillEvent as unknown as typeof Event;
}

installEventPolyfill();

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
