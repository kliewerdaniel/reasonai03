import { Object3DNode } from '@react-three/fiber';
import { Material, Mesh, BufferGeometry } from 'three';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      mesh: Object3DNode<Mesh, typeof Mesh>;
      boxGeometry: Object3DNode<BufferGeometry, typeof BufferGeometry>;
      sphereGeometry: Object3DNode<BufferGeometry, typeof BufferGeometry>;
      torusGeometry: Object3DNode<BufferGeometry, typeof BufferGeometry>;
      tetrahedronGeometry: Object3DNode<BufferGeometry, typeof BufferGeometry>;
      octahedronGeometry: Object3DNode<BufferGeometry, typeof BufferGeometry>;
      ambientLight: Object3DNode<THREE.AmbientLight, typeof THREE.AmbientLight>;
      pointLight: Object3DNode<THREE.PointLight, typeof THREE.PointLight>;
      meshStandardMaterial: Object3DNode<Material, typeof Material>;
    }
  }
}
