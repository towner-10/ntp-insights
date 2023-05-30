import mapboxgl, { type LngLat } from 'mapbox-gl';
import { useRef, useEffect, useState } from 'react';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from './ui/card';
import { renderToString } from 'react-dom/server';
import { useTheme } from 'next-themes';
import { LucideArrowUp, LucideCircleDot } from 'lucide-react';
import { Button } from './ui/button';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from './ui/tooltip';

interface DefaultProps {
	className?: string;
}

interface MapCardProps extends DefaultProps {
	title: string;
	description: string;
}

interface StaticMapProps extends DefaultProps {
	lng: number;
	lat: number;
}

interface View360MapProps extends DefaultProps {
	points: LngLat[];
}

interface MapCardMarkerProps extends MapCardProps {
	onChange?: ({ lng, lat }: mapboxgl.LngLat) => void;
	value?: {
		lng: number;
		lat: number;
	};
}

export function MapCard(props: MapCardProps) {
	return (
		<Card className={props.className}>
			<CardHeader>
				<CardTitle>{props.title}</CardTitle>
				<CardDescription>{props.description}</CardDescription>
			</CardHeader>
			<CardContent>
				<MapDebug className="h-[600px]" />
			</CardContent>
		</Card>
	);
}

export function MapWithMarkerCard(props: MapCardMarkerProps) {
	const mapContainer = useRef<HTMLDivElement | null>(null);
	const map = useRef<mapboxgl.Map | null>(null);
	const { resolvedTheme } = useTheme();

	const [lng, setLng] = useState(props.value?.lng || -81.3);
	const [lat, setLat] = useState(props.value?.lat || 42.97);
	const [rotation, setRotation] = useState(0);

	let lastTheme: string | undefined = undefined;

	mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

	useEffect(() => {
		if (mapboxgl.accessToken === '') return;
		if (map.current && lastTheme === resolvedTheme) return;
		else if (map.current) map.current.remove();

		// eslint-disable-next-line react-hooks/exhaustive-deps
		lastTheme = resolvedTheme;

		map.current = new mapboxgl.Map({
			container: mapContainer.current || '',
			style:
				resolvedTheme === 'light'
					? 'mapbox://styles/mapbox/streets-v11'
					: 'mapbox://styles/mapbox/dark-v10',
			center: [lng, lat],
			zoom: 9,
			bearing: 0,
		});

		if (!map.current) return;

		map.current.on('rotate', () => {
			setRotation(map.current?.getBearing() || 0);
		});

		const el = document.createElement('div');
		el.className = 'w-6 h-6 text-foreground';
		el.innerHTML = renderToString(<LucideCircleDot />);

		const marker = new mapboxgl.Marker(el, {
			draggable: true,
		})
			.setLngLat([lng, lat])
			.addTo(map.current);

		marker.on('dragend', () => {
			const lngLat = marker.getLngLat();
			if (!lngLat) return;
			setLng(Number(lngLat.lng.toFixed(5)));
			setLat(Number(lngLat.lat.toFixed(5)));
			if (props.onChange) props.onChange(lngLat);
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [resolvedTheme]);

	return (
		<Card className={props.className}>
			<CardHeader>
				<div className="flex flex-row justify-between">
					<div className="flex flex-col">
						<CardTitle>{props.title}</CardTitle>
						<CardDescription>{props.description}</CardDescription>
					</div>
					<Button
						type="button"
						variant="outline"
						onClick={() => {
							if (!map.current) return;
							map.current.flyTo({
								center: [lng, lat],
								zoom: 9,
								bearing: 0,
								pitch: 0,
							});
						}}
					>
						Snap to Point
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				<div className="relative w-full">
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<div
									className="absolute z-10 m-2 flex max-w-xs cursor-pointer select-none flex-col gap-2 rounded-lg bg-background/60 p-2 backdrop-blur"
									onClick={
										void (async () => {
											await navigator.clipboard.writeText(`${lat}, ${lng}`);
										})()
									}
								>
									<span>Latitude: {lat}</span>
									<span>Longitude: {lng}</span>
								</div>
							</TooltipTrigger>
							<TooltipContent>
								<p>Copy to clipboard</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
					<div className="absolute right-0 z-10 m-2 flex max-w-xs flex-col gap-2 rounded-lg bg-background/60 p-2 backdrop-blur transition hover:cursor-pointer hover:bg-foreground/40 hover:text-background">
						<LucideArrowUp
							onClick={() => {
								if (!map.current) return;
								map.current.resetNorthPitch();
							}}
							className="transform-gpu"
							style={{
								transform: `rotate(${-rotation}deg)`,
							}}
						/>
					</div>
					<div ref={mapContainer} className="h-[600px]" />
				</div>
			</CardContent>
		</Card>
	);
}

export function View360Map(props: View360MapProps) {
	const mapContainer = useRef<HTMLDivElement | null>(null);
	const map = useRef<mapboxgl.Map | null>(null);

	mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

	useEffect(() => {
		if (mapboxgl.accessToken === '') return;
		if (map.current) return;

		map.current = new mapboxgl.Map({
			container: mapContainer.current || '',
			style: 'mapbox://styles/mapbox/streets-v11',
			center: [-81.3, 42.97],
			zoom: 9,
		});

		if (!map.current) return;

		map.current.on('load', () => {
			map.current?.addSource('route', {
				type: 'geojson',
				data: {
					type: 'Feature',
					properties: {},
					geometry: {
						type: 'LineString',
						coordinates: props.points.map((point) => [point.lng, point.lat]),
					},
				},
			});

			map.current?.addLayer({
				id: 'route',
				type: 'line',
				source: 'route',
				layout: {
					'line-join': 'round',
					'line-cap': 'round',
				},
				paint: {
					'line-color': '#888',
					'line-width': 8,
				},
			});

			const getBounds = (points: LngLat[]) => {
				const bounds = new mapboxgl.LngLatBounds();
				points.forEach((point) => {
					bounds.extend(point);
				});
				return bounds;
			}

			map.current?.fitBounds(getBounds(props.points), {
				padding: 20,
				maxZoom: 15
			});
		});
	});

	return (
		<div>
			<div ref={mapContainer} className={props.className} />
		</div>
	);
}

export function StaticMap(props: StaticMapProps) {
	const mapContainer = useRef<HTMLDivElement | null>(null);
	const map = useRef<mapboxgl.Map | null>(null);
	const { resolvedTheme } = useTheme();

	let lastTheme: string | undefined = undefined;

	mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

	useEffect(() => {
		if (mapboxgl.accessToken === '') return;
		if (map.current && lastTheme === resolvedTheme) return;
		else if (map.current) map.current.remove();

		// eslint-disable-next-line react-hooks/exhaustive-deps
		lastTheme = resolvedTheme;

		map.current = new mapboxgl.Map({
			container: mapContainer.current || '',
			style:
				resolvedTheme === 'light'
					? 'mapbox://styles/mapbox/streets-v11'
					: 'mapbox://styles/mapbox/dark-v10',
			center: [props.lng, props.lat],
			zoom: 9,
			bearing: 0,
			interactive: false,
		});
	}, [resolvedTheme]);

	return <div ref={mapContainer} className={props.className} />;
}

export function MapDebug(props: DefaultProps) {
	const mapContainer = useRef<HTMLDivElement | null>(null);
	const map = useRef<mapboxgl.Map | null>(null);
	const [lng, setLng] = useState(-81.3);
	const [lat, setLat] = useState(42.97);
	const [zoom, setZoom] = useState(9);

	mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

	useEffect(() => {
		if (mapboxgl.accessToken === '') return;
		if (map.current) return;

		map.current = new mapboxgl.Map({
			container: mapContainer.current || '',
			style: 'mapbox://styles/mapbox/streets-v11',
			center: [lng, lat],
			zoom: zoom,
		});

		if (!map.current) return;

		map.current.on('move', () => {
			if (!map.current) return;
			setLng(Number(map.current.getCenter().lng.toFixed(4)));
			setLat(Number(map.current.getCenter().lat.toFixed(4)));
			setZoom(Number(map.current.getZoom().toFixed(2)));
		});
	});

	return (
		<div>
			<div className="absolute z-10 m-2 flex max-w-xs flex-col items-center justify-center rounded-lg bg-background/60 p-2 backdrop-blur">
				Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
			</div>
			<div ref={mapContainer} className={props.className} />
		</div>
	);
}
