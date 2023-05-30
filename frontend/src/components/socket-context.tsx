import { env } from '@/env.mjs';
import { type Socket, Manager } from 'socket.io-client';
import { createContext, useContext, useState, useMemo } from 'react';

type SocketContextType = {
	socket: Socket | null;
	state: number;
};

const SocketContext = createContext<SocketContextType>({
	socket: null,
	state: WebSocket.CONNECTING,
});

const isBrowser = typeof window !== 'undefined';
const RECONNECT_TIMEOUT = 10000;

/**
 * Provider to wrap the WebSocket context around the app tree and provide the WebSocket instance and state globally.
 */
export function SocketProvider({ children }: { children: React.ReactNode }) {
	const [state, setState] = useState<number>(WebSocket.CONNECTING);

	const socket = useMemo(() => {
		const manager = new Manager(env.NEXT_PUBLIC_BACKEND_WS_URL, {
			reconnectionDelay: RECONNECT_TIMEOUT,
		});

		manager.on('open', () => setState(WebSocket.OPEN));
		manager.on('reconnect', () => setState(WebSocket.OPEN));
		manager.on('reconnect_failed', () => setState(WebSocket.CLOSED));
		manager.on('reconnect_attempt', () => setState(WebSocket.CONNECTING));
		manager.on('close', () => setState(WebSocket.CLOSED));
		manager.on('error', () => setState(WebSocket.CLOSED));

		return isBrowser ? manager.socket('/') : null;
	}, []);

	return (
		<SocketContext.Provider
			value={{
				socket,
				state,
			}}
		>
			{children}
		</SocketContext.Provider>
	);
}

/**
 * Get the WebSocket context
 */
export function useWebSocketContext() {
	return useContext(SocketContext);
}
