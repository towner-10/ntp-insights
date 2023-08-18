import { useRef, useEffect } from 'react';
import { env } from '@/env.mjs';

const useScript = (url: string, async: boolean = false) => {
    useEffect(() => {
      const script = document.createElement("script");
      script.src = url;
      script.async = async;
  
      document.head.appendChild(script);
      return () => {
        document.head.removeChild(script);
      };
    }, [url]);
  };
    
const PotreeViewer = ({
  scan_location,
	shape_type,
	size_mode,
	size,
}: {
  scan_location: string;
	shape_type: number;
	size_mode: number;
	size: number;
}) => {

    const scripts = [
        "/potree_libs/jquery/jquery-3.1.1.min.js",
        "/potree_libs/other/BinaryHeap.js",
        "/potree_libs/tween/tween.min.js",
        "/potree_libs/proj4/proj4.js",
        "/potree_libs/potree/potree.js"
      ];
    
    scripts.forEach(script => {
        useScript(script)
    })
  
    const elementRef = useRef();
  
    useEffect(() => {
  
      // Waits for all scripts to load in
      const timer = setTimeout(() => {
        const divElement = elementRef.current;
  
        window.viewer = new Potree.Viewer(divElement);
          
          viewer.setEDLEnabled(false);
          viewer.setFOV(90);
          viewer.setPointBudget(2_000_000);
          viewer.loadSettingsFromURL();
          viewer.setBackground("skybox");
  
          viewer.setControls(viewer.earthControls)

          Potree.loadPointCloud(`${env.NEXT_PUBLIC_BACKEND_URL}/pointclouds/${scan_location}/metadata.json`, "TEST", e => {
              let scene = viewer.scene;
              let pointcloud = e.pointcloud;
              
              let material = pointcloud.material;
              material.size = size;
              material.pointSizeType = Potree.PointSizeType.ADAPTIVE;
              material.shape = Potree.PointShape.CIRCLE;
              material.activeAttributeName = "rgba";
              
              scene.addPointCloud(pointcloud);
              
              viewer.fitToScreen();
          });
        
      }, 500);
  
      return () => clearTimeout(timer);
    }, [size]);
  
    return (
      <div className="potree_container">
        <div ref={elementRef} id="potree_render_area" className="w-screen h-screen"></div>
      </div>
      
    )
}

export default PotreeViewer;