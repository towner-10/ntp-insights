import mapboxgl from 'mapbox-gl';
import Map, { Layer, MapRef, Marker, Source } from 'react-map-gl';
import { useRef, useEffect, useState } from 'react';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from './ui/card';
import { useTheme } from 'next-themes';
import { LucideCircleDot, LucideNavigation2 } from 'lucide-react';
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

interface SearchViewMapProps extends DefaultProps {
	start?: {
		lng: number;
		lat: number;
		radius: number;
	};
	points?: mapboxgl.LngLat[];
}

interface MapCardProps extends SearchViewMapProps {
	title: string;
	description: string;
}

interface StaticMapProps extends DefaultProps {
	lng: number;
	lat: number;
}

interface View360MapProps extends DefaultProps {
	currentIndex: number;
	points: mapboxgl.LngLat[];
}

interface MapCardMarkerProps extends MapCardProps {
	onChange?: ({ lng, lat }: mapboxgl.LngLat) => void;
	value?: {
		lng: number;
		lat: number;
	};
}

export function MapCard(props: MapCardProps) {
	console.log(props.start);

	return (
		<Card className={props.className}>
			<CardHeader>
				<CardTitle>{props.title}</CardTitle>
				<CardDescription>{props.description}</CardDescription>
			</CardHeader>
			<CardContent>
				<SearchViewMap
					className="h-[600px]"
					start={props.start}
					points={props.points}
				/>
			</CardContent>
		</Card>
	);
}

export function MapWithMarkerCard(props: MapCardMarkerProps) {
	const mapRef = useRef<MapRef>();
	const { resolvedTheme } = useTheme();
	const [lng, setLng] = useState(props.value?.lng || -81.3);
	const [lat, setLat] = useState(props.value?.lat || 42.97);
	const [rotation, setRotation] = useState(0);

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
							if (!mapRef.current) return;
							mapRef.current.flyTo({
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
									className="bg-background/60 absolute z-10 m-2 flex max-w-xs cursor-pointer select-none flex-col gap-2 rounded-lg p-2 backdrop-blur"
									onClick={
										void (async () => {
											if (typeof window != 'undefined') {
												await navigator.clipboard.writeText(`${lat}, ${lng}`);
											}
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
					<div className="bg-background/60 hover:bg-foreground/40 hover:text-background absolute right-0 z-10 m-2 flex max-w-xs flex-col gap-2 rounded-lg p-2 backdrop-blur transition hover:cursor-pointer">
						<LucideNavigation2
							onClick={() => {
								if (!mapRef.current) return;
								mapRef.current.resetNorthPitch();
							}}
							className="transform-gpu"
							style={{
								transform: `rotate(${-rotation}deg)`,
							}}
						/>
					</div>
					<Map
						ref={mapRef}
						initialViewState={{
							latitude: 42.97,
							longitude: -81.3,
							zoom: 9,
							bearing: 0,
						}}
						style={{
							height: '600px',
						}}
						onRotate={(event) => setRotation(event.viewState.bearing)}
						mapStyle={
							resolvedTheme === 'light'
								? 'mapbox://styles/mapbox/streets-v11'
								: 'mapbox://styles/mapbox/dark-v10'
						}
						mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''}
					>
						<Marker
							draggable
							longitude={lng}
							latitude={lat}
							onDragEnd={(event) => {
								const { lng, lat } = event.lngLat;
								setLng(Number(lng.toFixed(5)));
								setLat(Number(lat.toFixed(5)));
								if (props.onChange) props.onChange(event.lngLat);
							}}
						>
							<div className="text-foreground h-6 w-6">
								<LucideCircleDot />
							</div>
						</Marker>
					</Map>
				</div>
			</CardContent>
		</Card>
	);
}

export function View360Map(props: View360MapProps) {
	const { resolvedTheme } = useTheme();
	const mapRef = useRef<MapRef>();
	const [currentPosition, setCurrentPosition] = useState<mapboxgl.LngLat>(
		mapboxgl.LngLat.convert({
			lng: -81.3,
			lat: 42.97,
		})
	);

	useEffect(() => {
		setCurrentPosition(props.points[props.currentIndex]);
	}, [props.currentIndex, props.points]);

	useEffect(() => {
		const getBounds = (points: mapboxgl.LngLat[]) => {
			const bounds = new mapboxgl.LngLatBounds();
			points.forEach((point) => bounds.extend(point));
			return bounds;
		};

		if (!mapRef.current || props.points.length === 0) return;

		mapRef.current.fitBounds(getBounds(props.points), {
			padding: 20,
			maxZoom: 20,
		});
	});

	return (
		<div className={props.className}>
			<Map
				ref={mapRef}
				reuseMaps
				initialViewState={{
					longitude: -81.3,
					latitude: 42.97,
					zoom: 9,
				}}
				mapStyle={
					resolvedTheme === 'light'
						? 'mapbox://styles/mapbox/streets-v11'
						: 'mapbox://styles/mapbox/dark-v10'
				}
				mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''}
			>
				<Source
					id="route"
					type="geojson"
					data={{
						type: 'Feature',
						properties: {},
						geometry: {
							type: 'LineString',
							coordinates: props.points.map((point) => [point.lng, point.lat]),
						},
					}}
				>
					<Layer
						id="route"
						type="line"
						layout={{
							'line-join': 'round',
							'line-cap': 'round',
						}}
						paint={{
							'line-color': '#888',
							'line-width': 3,
						}}
					/>
				</Source>
				<Marker
					longitude={currentPosition.lng}
					latitude={currentPosition.lat}
					color="black"
				/>
			</Map>
		</div>
	);
}

export function StaticMap(props: StaticMapProps) {
	const { resolvedTheme } = useTheme();

	return (
		<Map
			longitude={props.lng}
			latitude={props.lat}
			zoom={9}
			bearing={0}
			interactive={false}
			mapStyle={
				resolvedTheme === 'light'
					? 'mapbox://styles/mapbox/streets-v11'
					: 'mapbox://styles/mapbox/dark-v10'
			}
			mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''}
		/>
	);
}

export function SearchViewMap(props: SearchViewMapProps) {
	const { resolvedTheme } = useTheme();
	const [viewState, setViewState] = useState(props.start ? {
		longitude: props.start.lng,
		latitude: props.start.lat,
	} : {
		longitude: -81.3,
		latitude: 42.97,
	});

	return (
		<div className={props.className}>
			<div className="bg-background/60 absolute z-10 m-2 flex max-w-xs flex-col items-center justify-center rounded-lg p-2 backdrop-blur">
				Longitude: {viewState.longitude.toFixed(5)} | Latitude:{' '}
				{viewState.latitude.toFixed(5)}
			</div>
			<Map
				initialViewState={{
					bounds: props.start
						? new mapboxgl.LngLat(props.start.lng, props.start.lat).toBounds(
								props.start.radius * 1000
						  )
						: undefined,
					fitBoundsOptions: {
						animate: true,
						duration: 1000,
						padding: 20,
						maxZoom: 20,
					},
				}}
				onMove={(event) => setViewState(event.viewState)}
				mapStyle={
					resolvedTheme === 'light'
						? 'mapbox://styles/mapbox/streets-v11'
						: 'mapbox://styles/mapbox/dark-v10'
				}
				mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''}
			/>
		</div>
	);
}
