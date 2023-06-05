import * as React from 'react';
import { renderAsync } from '@react-email/render';
import {
	Body,
	Button,
	Container,
	Head,
	Heading,
	Html,
	Link,
	Preview,
	Tailwind,
	Text,
} from '@react-email/components';

type Props = {
	recipient: string;
	url: string;
	host: string;
};

function Email(props: Props) {
	const previewText = `Login with this magic link from NTP (${props.host})`;

	return (
		<Html lang="en" dir="ltr">
			<Html>
				<Head />
				<Preview>{previewText}</Preview>
				<Body>
					<Tailwind>
						<Container>
							<Heading>Login with NTP</Heading>
							<Button
								href={props.url}
								pX={20}
								pY={12}
								className="rounded bg-[#000000] text-center text-[12px] font-semibold text-white no-underline"
							>
								Verify
							</Button>
							<Text>Or, use this hyperlink to login:</Text>
							<Link href={props.url} target="_blank">
								Click here to log in with this magic link
							</Link>
							<Text>
								{
									"If you didn't try to login, you can safely ignore this email."
								}
							</Text>
						</Container>
					</Tailwind>
				</Body>
			</Html>
		</Html>
	);
}

export async function renderEmail({ recipient, url, host }: Props) {
	return await renderAsync(
		<Email recipient={recipient} url={url} host={host} />
	);
}
