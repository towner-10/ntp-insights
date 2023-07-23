import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';
import Map, {
	Layer,
	MapRef,
	Marker,
	Source,
	type MarkerDragEvent,
	type ViewState,
} from 'react-map-gl';
import { useRef, useEffect, useState, useMemo } from 'react';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from './ui/card';
import { useTheme } from 'next-themes';
import { LucideCircleDot, LucideDot, LucideNavigation2 } from 'lucide-react';
import { Button } from './ui/button';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from './ui/tooltip';
import { api } from '@/utils/api';
import { KeywordInput } from './input/keyword-input';
import { Label } from './ui/label';
import { KeywordsInfo } from './dialogs/info-dialogs';
import { cn } from '@/lib/utils';

export type SearchViewBox = {
	id: string;
	geo: {
		bbox: [number, number, number, number];
		type: 'Feature';
		properties: {};
		geometry: {};
	};
	country: string;
	full_name: string;
	country_code: string;
};

interface DefaultProps {
	className?: string;
}

interface SearchViewMapProps extends DefaultProps {
	start?: {
		lng: number;
		lat: number;
	};
	boxes?: SearchViewBox[];
}

interface SearchViewMapCardProps extends SearchViewMapProps {
	title: string;
	description: string;
}

interface SearchDashboardMapProps extends DefaultProps {
	points: {
		lng: number;
		lat: number;
	}[];
}

interface SearchDashboardMapCardProps extends SearchDashboardMapProps {
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
	onIndexChange?: (index: number) => void;
}

interface NewSearchMapProps extends SearchViewMapCardProps {
	onChange?: ({ lng, lat, keywords }) => void;
	value?: {
		lng: number;
		lat: number;
		keywords: string[];
	};
}

export function SearchViewMapCard(props: SearchViewMapCardProps) {
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
					boxes={props.boxes}
				/>
			</CardContent>
		</Card>
	);
}

export function SearchDashboardMapCard(props: SearchDashboardMapCardProps) {
	return (
		<Card className={props.className}>
			<CardHeader>
				<CardTitle>{props.title}</CardTitle>
				<CardDescription>{props.description}</CardDescription>
			</CardHeader>
			<CardContent>
				<SearchDashboardMap className="h-[600px]" points={props.points} />
			</CardContent>
		</Card>
	);
}

export function NewSearchMapCard(props: NewSearchMapProps) {
	const mapRef = useRef<MapRef>();
	const { resolvedTheme } = useTheme();
	const [lng, setLng] = useState(props.value?.lng || -81.3);
	const [lat, setLat] = useState(props.value?.lat || 42.97);
	const geocodeKeywords = api.searches.geocodeKeywords.useQuery({
		lng,
		lat,
	});
	const [userKeywords, setUserKeywords] = useState<string[]>([]);
	const [rotation, setRotation] = useState(0);

	const onDragEnd = (event: MarkerDragEvent) => {
		const { lng, lat } = event.lngLat;
		setLng(Number(lng.toFixed(5)));
		setLat(Number(lat.toFixed(5)));

		void (async () => {
			await geocodeKeywords.refetch();

			if (!geocodeKeywords.data) {
				if (props.onChange)
					props.onChange({ lng, lat, keywords: userKeywords });
				return;
			}
			if (props.onChange)
				props.onChange({
					lng,
					lat,
					keywords: [...geocodeKeywords.data, ...userKeywords],
				});
		})();
	};

	return (
		<Card className={cn('flex flex-col', props.className)}>
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
									onClick={() => {
										void (async () => {
											if (typeof window != 'undefined') {
												await navigator.clipboard.writeText(`${lat}, ${lng}`);
											}
										})();
									}}
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
							height: '650px',
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
							onDragEnd={onDragEnd}
						>
							<div className="text-foreground h-6 w-6">
								<LucideCircleDot />
							</div>
						</Marker>
					</Map>
				</div>
			</CardContent>
			<CardFooter className="flex-grow items-end">
				<div className="flex flex-grow flex-col gap-2">
					<div className="flex flex-row items-center gap-2">
						<Label>Location Keywords</Label>
						<KeywordsInfo />
					</div>
					<KeywordInput
						onChange={setUserKeywords}
						value={userKeywords}
						lockedKeywords={geocodeKeywords.data}
					/>
				</div>
			</CardFooter>
		</Card>
	);
}

export function View360Map(props: View360MapProps) {
	const mapRef = useRef<MapRef>();
	const { resolvedTheme } = useTheme();
	const [loaded, setLoaded] = useState(false);
	const [currentPosition, setCurrentPosition] = useState<mapboxgl.LngLat>(
		mapboxgl.LngLat.convert({
			lng: -81.3,
			lat: 42.97,
		})
	);

	const markers = useMemo(
		() =>
			props.points
				.filter((_, index) => {
					if (index === 0) return true;
					return index % 5 === 0;
				})
				.map((point, index) => (
					<Marker
						key={index}
						longitude={point.lng}
						latitude={point.lat}
						onClick={() => {
							props.onIndexChange(index * 5);
						}}
					>
						<div className="bg-foreground rounded-full">
							<div className="h-3 w-3" />
						</div>
					</Marker>
				)),
		[props]
	);

	useEffect(() => {
		setCurrentPosition(props.points[props.currentIndex]);
	}, [props.currentIndex, props.points]);

	// Fit bounds to the path on first render
	useEffect(() => {
		if (!props.points.length || !mapRef.current) return;

		if (loaded) return;
		else setLoaded(true);

		const boundingBox = getBoundingBox(
			props.points.map((point) => new mapboxgl.LngLat(point.lng, point.lat))
		);

		mapRef.current.fitBounds(boundingBox, {
			animate: false,
			duration: 0,
			padding: 20,
			maxZoom: 20,
		});
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [loaded, props.points, mapRef.current]);

	return (
		<div className={props.className}>
			<Map
				ref={mapRef}
				initialViewState={{
					longitude: -81.3,
					latitude: 42.97,
					zoom: 9,
					bearing: 0,
				}}
				mapStyle={
					resolvedTheme === 'light'
						? 'mapbox://styles/mapbox/streets-v11'
						: 'mapbox://styles/mapbox/dark-v10'
				}
				mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''}
			>
				<Source
					id="path"
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
							'line-color': '#ddd',
							'line-width': 2,
						}}
					/>
				</Source>
				{markers}
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
	const [viewState, setViewState] = useState(
		props.start
			? {
					longitude: props.start.lng,
					latitude: props.start.lat,
			  }
			: {
					longitude: -81.3,
					latitude: 42.97,
			  }
	);

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
								5000
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
			>
				<Source
					id="search-area"
					type="geojson"
					data={{
						type: 'FeatureCollection',
						features: props.boxes?.map((box) => {
							return {
								type: 'Feature',
								properties: {},
								geometry: {
									type: 'LineString',
									coordinates: [
										[box.geo.bbox[0], box.geo.bbox[1]],
										[box.geo.bbox[0], box.geo.bbox[3]],
										[box.geo.bbox[2], box.geo.bbox[3]],
										[box.geo.bbox[2], box.geo.bbox[1]],
										[box.geo.bbox[0], box.geo.bbox[1]],
									],
								},
							};
						}),
					}}
				>
					<Layer
						id="search-area-layer"
						type="fill"
						paint={{
							'fill-color': '#088',
							'fill-opacity': 0.8,
						}}
					/>
				</Source>
			</Map>
		</div>
	);
}

export function SearchDashboardMap(props: SearchDashboardMapProps) {
	const { resolvedTheme } = useTheme();
	const mapRef = useRef<MapRef>();
	const [viewState, setViewState] = useState<Partial<ViewState>>({
		longitude: -81.3,
		latitude: 42.97,
	});

	const markers = useMemo(() => {
		if (props.points.length === 0) return [];

		const boundingBox = getBoundingBox(
			props.points.map((point) => new mapboxgl.LngLat(point.lng, point.lat))
		);

		setViewState({
			longitude: boundingBox.getCenter().lng,
			latitude: boundingBox.getCenter().lat,
		});

		mapRef.current?.fitBounds(boundingBox, {
			animate: true,
			duration: 1000,
			padding: 20,
			maxZoom: 20,
		});

		return props.points.map((point, index) => {
			return (
				<Marker
					key={index}
					longitude={point.lng}
					latitude={point.lat}
					color="black"
					draggable={false}
				/>
			);
		});
	}, [props.points]);

	return (
		<div className={props.className}>
			<div className="bg-background/60 absolute z-10 m-2 flex max-w-xs flex-col items-center justify-center rounded-lg p-2 backdrop-blur">
				Longitude: {viewState.longitude.toFixed(5)} | Latitude:{' '}
				{viewState.latitude.toFixed(5)}
			</div>
			<Map
				ref={mapRef}
				initialViewState={{
					longitude: -81.3,
					latitude: 42.97,
					zoom: 9,
					bounds: props.points.length
						? getBoundingBox(
								props.points.map(
									(point) => new mapboxgl.LngLat(point.lng, point.lat)
								)
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
			>
				{markers}
			</Map>
		</div>
	);
}

function getBoundingBox(points: mapboxgl.LngLat[]) {
	const bounds = new mapboxgl.LngLatBounds();
	points.forEach((point) => bounds.extend(point));
	return bounds;
}
