import { ThreeElements } from '@react-three/fiber'

declare global {
    namespace JSX {
        // eslint-disable-next-line
        interface IntrinsicElements extends ThreeElements { }
    }
}
