import { LucideInfo } from 'lucide-react';
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
					<DialogTitle>VR Controls</DialogTitle>
					<DialogDescription>How to use the 360 VR controls.</DialogDescription>
				</DialogHeader>
				<div className="flex flex-row space-x-6">
					<div className="flex flex-col space-y-2">
						<h2 className='underline'>Left Hand</h2>
						<ul>
							<li>
								<code>Trigger</code> - Next image
							</li>
							<li>
								<code>Grip</code> - Previous image
							</li>
						</ul>
					</div>
					<div className="flex flex-col space-y-2">
						<h2 className='underline'>Right Hand</h2>
						<ul>
							<li>
								<code>Trigger</code> - Before/After image
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
