import {
	LucideInfo,
	LucideNavigation2,
	LucideExpand,
	LucideGlasses,
	LucideChevronUp,
	LucideChevronDown,
	LucideChevronsUp,
	LucideChevronsDown,
	LucideShrink,
} from 'lucide-react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '../ui/dialog';

export function KeywordsInfo() {
	return (
		<Dialog>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Keywords Info</DialogTitle>
					<DialogDescription>How to use keywords in search.</DialogDescription>
				</DialogHeader>
				<p>
					Keywords are used to filter the results of a search. For example, if
					you wanted to find all the movies that were directed by Quentin
					Tarantino, you could use the keyword <code>Quentin Tarantino</code>.
				</p>
				<p>
					To use multiple keywords, separate them with a comma. For example, if
					you wanted to find all the movies that were directed by Quentin
					Tarantino and starred Samuel L. Jackson, you could use the keywords{' '}
					<code>Quentin Tarantino, Samuel L. Jackson</code>. This will create
					new badges that you can see above the keyword input field.
				</p>
			</DialogContent>
			<DialogTrigger>
				<LucideInfo size={16} />
			</DialogTrigger>
		</Dialog>
	);
}

export function RadiusInfo() {
	return (
		<Dialog>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Radius Info</DialogTitle>
					<DialogDescription>What does the radius field do?</DialogDescription>
				</DialogHeader>
				<p>
					The radius field is used to filter the results of a search by
					distance. For example, if you wanted to find all the restaurants
					within 5 km of your location, you could use the radius <code>5</code>.
				</p>
			</DialogContent>
			<DialogTrigger>
				<LucideInfo size={16} />
			</DialogTrigger>
		</Dialog>
	);
}

export function VRControls() {
	return (
		<Dialog>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Using NTP 360</DialogTitle>
					<DialogDescription>How to navigate the 360 view</DialogDescription>
				</DialogHeader>
				<h2 className="font-medium underline">Screen Controls</h2>
					<div className="flex flex-row align-middle text-sm">
						<div className='pr-2'><LucideChevronUp/><LucideChevronDown/></div><div className='pt-3.5 pr-10'>Next/Previous Image</div>
						<div className='pr-2'><LucideChevronsUp/><LucideChevronsDown/></div><div className='pt-3.5'>Next/Previous 5 Images</div>
					</div>
					<div className="flex flex-row space-x-10 align-middle text-sm">
						<div className='pr-2'><LucideNavigation2/></div>Recenter North
						<div className='pr-2'><LucideExpand/></div>Enter Fullscreen
						<div className='pr-2'><LucideGlasses/></div>Enter VR
					</div>
				<h2 className="font-medium underline">Keyboard Controls</h2>
				<div className="flex flex-row space-x-10">
					<div className="flex flex-col space-y-2">
						<h2 className='font-medium text-sm'>Arrow Keys</h2>
						<ul>
							<li className='text-sm'>
								<code>Up</code> — Next Image
							</li>
							<li className='text-sm'>
								<code>Down</code> — Previous Image
							</li>
						</ul>
					</div>
					<div className="flex flex-col space-y-2">
						<h2 className='font-medium text-sm'>Other Keys</h2>
						<ul>
							<li className='text-sm'>
								<code>Esc</code> — Exit Fullscreen
							</li>
							<li className='text-sm'>
								<code>Enter</code> — Confirm Panorama Input
							</li>
						</ul>
					</div>
				</div>
				<h2 className="font-medium underline">VR Controls</h2>
				<div className="flex flex-row space-x-10">
					<div className="flex flex-col space-y-2">
						<h2 className='font-medium text-sm'>Left Hand</h2>
						<ul>
						<li className='text-sm'>
								<code>Trigger</code> — Previous Image
							</li>
							<li className='text-sm'>
								<code>Grip</code> — Previous 5 Images
							</li>
							<li className='text-sm'>
								<code>Y</code> — Before Image
							</li>
						</ul>
					</div>
					<div className="flex flex-col space-y-2">
						<h2 className='font-medium text-sm'>Right Hand</h2>
						<ul>
							<li className='text-sm'>
								<code>Trigger</code> — Next Image
							</li>
							<li className='text-sm'>
								<code>Grip</code> — Next 5 Images
							</li>
							<li className='text-sm'>
								<code>B</code> — After Image
							</li>
						</ul>
					</div>
				</div>
			</DialogContent>
			<DialogTrigger>
				<LucideInfo size={16} />
			</DialogTrigger>
		</Dialog>
	);
}
