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
    on1?: () => void,
	on3?: () => void,
    on5?: () => void,
}) => {
	const { player } = useXR();
	const controller = useController(props.hand);

	useFrame(() => {
		if (controller && player) {
			const { buttons } = controller.inputSource.gamepad;
            if (buttons[1].pressed) props.on1();
			if (buttons[3].pressed) props.on3();
            if (buttons[5].pressed) props.on5();
		}
	});

	return <></>;
}