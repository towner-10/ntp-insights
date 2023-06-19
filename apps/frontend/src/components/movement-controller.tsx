import { useXR, useController, useXRFrame } from '@react-three/xr';

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
    moveAxis?: number,
    rotateAxis?: number,
    onStickUp?: () => void;
    onStickDown?: () => void;
}) => {
	const { player } = useXR();
	const controller = useController(props.hand);

	useXRFrame(() => {
		if (controller && player) {
			const { axes } = controller.inputSource.gamepad;

            // Test
            props.moveAxis = 3;
            props.rotateAxis = 2;

            props.onStickUp = () => { // Joystick moving up, indicating to move to next panorama in the sequence
                if (axes[props.moveAxis] > 0) {
                    return true;
                } else {
                    return false;
                }
            }

            props.onStickDown = () => { // Joystick moving down, indicating to move to previous panorama in the sequence
                if (axes[props.moveAxis] < 0) {
                    return true;
                } else {
                    return false;
                }
            }
		}
	});
	return <></>;
}