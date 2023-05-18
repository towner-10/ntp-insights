import { signIn } from 'next-auth/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useForm } from 'react-hook-form';
import { type FormEvent } from 'react';
import { Toaster } from './ui/toaster';
import { useToast } from './ui/use-toast';

type EmailInputs = {
	email: string;
};

export function EmailSignIn() {
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<EmailInputs>();

	const toaster = useToast();

	const onSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		void handleSubmit(async (data) => {
			const result = await signIn('email', {
				email: data.email,
				redirect: false,
			});
			if (result?.ok) {
				toaster.toast({
					title: 'Email sent',
					description:
						'Check your email for the sign-in link. You can now close this window.',
					variant: 'default',
				});

				reset({
					email: '',
				});
			}
		})(event);
	};

	return (
		<>
			<Toaster />
			<form
				onSubmit={onSubmit}
				className="flex w-full flex-col items-center justify-center gap-2"
			>
				<Input
					type="email"
					placeholder="Email"
					aria-invalid={errors.email ? 'true' : 'false'}
					{...register('email', { required: 'Required' })}
				/>
				{errors.email && <span role="alert">This field is required</span>}
				<Button type="submit" className="w-full">
					Sign-in with Email
				</Button>
			</form>
		</>
	);
}
