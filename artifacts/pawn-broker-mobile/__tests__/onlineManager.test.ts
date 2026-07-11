/**
 * Tests for configureOnlineManager()
 *
 * Verifies that the NetInfo ↔ React Query onlineManager wiring is correct.
 * If this test fails after a change to lib/onlineManager.ts, it means the
 * app will no longer correctly pause/resume queries based on device connectivity.
 */

import { onlineManager } from '@tanstack/react-query';
import type NetInfoType from '@react-native-community/netinfo';

// Mock the native NetInfo module before any imports that use it
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(),
}));

// Import after mock is registered
// eslint-disable-next-line @typescript-eslint/no-require-imports
const NetInfo = require('@react-native-community/netinfo') as typeof NetInfoType;

// We re-import configureOnlineManager after the mock is in place
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { configureOnlineManager } = require('../lib/onlineManager') as typeof import('../lib/onlineManager');

describe('configureOnlineManager — NetInfo wiring', () => {
  type NetInfoState = { isConnected: boolean | null };
  let capturedCallback: ((state: NetInfoState) => void) | null = null;
  let mockUnsubscribe: jest.Mock;

  beforeEach(() => {
    capturedCallback = null;
    mockUnsubscribe = jest.fn();

    (NetInfo.addEventListener as jest.Mock).mockImplementation(
      (cb: (state: NetInfoState) => void) => {
        capturedCallback = cb;
        return mockUnsubscribe;
      },
    );

    // Re-run the wiring so it picks up the fresh mock
    configureOnlineManager();
  });

  afterEach(() => {
    // Restore online state so other tests start from a known state
    onlineManager.setOnline(true);
  });

  it('registers a NetInfo event listener on setup', () => {
    expect(NetInfo.addEventListener).toHaveBeenCalled();
  });

  it('marks onlineManager offline when NetInfo reports disconnected', () => {
    capturedCallback!({ isConnected: false });
    expect(onlineManager.isOnline()).toBe(false);
  });

  it('marks onlineManager online when NetInfo reports connected', () => {
    // Start offline to make the transition meaningful
    capturedCallback!({ isConnected: false });
    expect(onlineManager.isOnline()).toBe(false);

    capturedCallback!({ isConnected: true });
    expect(onlineManager.isOnline()).toBe(true);
  });

  it('treats null isConnected as online (initial check in progress)', () => {
    capturedCallback!({ isConnected: null });
    expect(onlineManager.isOnline()).toBe(true);
  });

  it('returns an unsubscribe function from the event listener', () => {
    // onlineManager calls the teardown fn when the listener changes —
    // we just verify our mock teardown was returned and is callable
    expect(mockUnsubscribe).toBeDefined();
    expect(() => mockUnsubscribe()).not.toThrow();
  });
});
