import { Button } from "../ui/button";
import { Input } from "../ui/input";

export default function EmailSignInForm() {
	return (
		<div className="flex w-full flex-col items-center justify-center gap-2">
			<Input type="email" placeholder="Email" />
			<Button className="w-full">Sign-in with Email</Button>
		</div>
	);
}
