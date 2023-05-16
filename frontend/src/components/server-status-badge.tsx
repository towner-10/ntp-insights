import { Badge } from './ui/badge';
import { useWebSocketContext } from './websocket-context';

export const isBrowser = typeof window !== 'undefined';

export default function ServerStatusBadge() {
	const wsInstance = useWebSocketContext();

	return (
		<Badge
			variant={
				wsInstance.state === 1
					? 'success'
					: wsInstance.state === 3
					? 'destructive'
					: 'secondary'
			}
		>
			<span className="relative flex h-3 w-3">
				<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75"></span>
				<span className="relative inline-flex h-3 w-3 rounded-full bg-current"></span>
			</span>
			<p className="pl-2">
				{wsInstance.state === 1
					? 'Online'
					: wsInstance.state === 3
					? 'Error'
					: 'Connecting...'}
			</p>
		</Badge>
	);
}
