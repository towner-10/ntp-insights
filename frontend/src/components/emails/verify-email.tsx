import { Button } from "@react-email/button";
import { Html } from "@react-email/html";

type Props = {
    recipient: string;
    verification: string;
}

export function VeifyEmail(props: Props) {
    return (
        <Html lang="en" dir="ltr">
            <Button href="https://example.com" style={{ color: '#61dafb' }}>
                Click me
            </Button>
        </Html>
    );
}