import { useFrame } from '@react-three/fiber';
import { useXR, useController } from '@react-three/xr';

// Mapping
// 1: Trigger
// 2: Grip
// 4: Stick Buttons
// 5: A/X
// 6: B/Y

// Axes
// 2: XStick
// 3: YStick

export const MovementController = (props: {
    hand?: 'left' | 'right',
    on1: () => void,
    on2: () => void,
}) => {
	const { player } = useXR();
	const controller = useController(props.hand);

	useFrame(() => {
		if (controller && player) {
			const { buttons } = controller.inputSource.gamepad;

            if (buttons[5].pressed) {
                props.on1();
            }
            
            if (buttons[6].pressed) {
                props.on2();
            }
		}
	});

	return <></>;
}