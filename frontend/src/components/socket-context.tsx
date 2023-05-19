import { env } from '@/env.mjs';
import { type Socket, Manager } from 'socket.io-client';
import { createContext, useContext, useEffect, useState, useMemo } from 'react';

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

		return  isBrowser ? manager.socket('/') : null;
	}, []);

	useEffect(() => {
		if (socket === null) return;

		socket.io.on('open', () => {
			console.log('WebSocket connected');
			setState(WebSocket.OPEN);
		});

		socket.io.on('reconnect_attempt', () => {
			console.log('WebSocket reconnecting');
			setState(WebSocket.CONNECTING);
		});

		socket.io.on('close', () => setState(WebSocket.CLOSED));
		socket.io.on('error', () => setState(WebSocket.CLOSED));
	}, [socket]);

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
