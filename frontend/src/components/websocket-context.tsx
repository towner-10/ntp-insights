import { env } from '@/env.mjs';
import { createContext, useContext, useEffect, useState, useMemo } from 'react';

type WebSocketContextType = {
	websocket: WebSocket | null;
	state: number;
};

const WebSocketContext = createContext<WebSocketContextType>({
	websocket: null,
	state: WebSocket.CONNECTING,
});

const isBrowser = typeof window !== 'undefined';
const RECONNECT_TIMEOUT = 10000;

/**
 * Provider to wrap the WebSocket context around the app tree and provide the WebSocket instance and state globally.
 */
export function WebSocketProvider({ children }: { children: React.ReactNode }) {
	const [state, setState] = useState<number>(WebSocket.CONNECTING);
	const isClosed = state === WebSocket.CLOSED;

	const websocket = useMemo(
		() =>
			isBrowser && !isClosed
				? new WebSocket(env.NEXT_PUBLIC_BACKEND_WS_URL)
				: null,
		[isClosed]
	);

	useEffect(() => {
		if (websocket === null) return;

		websocket.onopen = () => {
			console.log('WebSocket connected');
			setState(WebSocket.OPEN);
		};

		websocket.onclose = () => {
			console.log('WebSocket disconnected');
			setState(WebSocket.CLOSED);

			setTimeout(() => {
				console.log('WebSocket reconnecting');
				setState(WebSocket.CONNECTING);
			}, RECONNECT_TIMEOUT);
		};

		websocket.onerror = (ev: Event) => {
			console.log(`WebSocket error at ${ev.timeStamp}`);
			setState(WebSocket.CLOSED);
		};
	}, [websocket]);

	return (
		<WebSocketContext.Provider
			value={{
				websocket,
				state,
			}}
		>
			{children}
		</WebSocketContext.Provider>
	);
}

/**
 * Get the WebSocket context
 */
export function useWebSocketContext() {
	return useContext(WebSocketContext);
}
