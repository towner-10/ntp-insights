import { useFrame } from '@react-three/fiber';
import { useXR, useController } from '@react-three/xr';

// Button Mapping
// 1: Trigger
// 2: Grip
// 4: Stick Buttons
// 5: B/Y
// 6: A/X

// Axes
// 2: XStick
// 3: YStick

export const MovementController = (props: {
    hand?: 'left' | 'right',
	on0?: () => void,
    on1?: () => void,
    on5?: () => void,
	on2Right?: () => void,
	on2Left?: () => void,
	on3Fwd?: () => void,
	on3Bwd?: () => void,
}) => {
	const { player } = useXR();
	const controller = useController(props.hand);

	useFrame(() => {
		if (controller && player) {
			const { buttons, axes } = controller.inputSource.gamepad;
			
			// Buttons
			if (buttons[0].pressed) props.on0();
            if (buttons[1].pressed) props.on1();
            if (buttons[5].pressed) props.on5();
			
			// Y-Stick
			if (axes[3] > 0.2) props.on3Fwd();
			if (axes[3] < 0.2) props.on3Bwd();

			// X-Stick
			if (axes[2] > 0.2) props.on2Right();
			if (axes[2] < 0.2) props.on2Left();
		}
	});

	return <></>;
}