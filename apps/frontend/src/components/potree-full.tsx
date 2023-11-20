//@ts-nocheck

import { env } from '@/env.mjs';
import { useRef, useEffect } from 'react';

const PotreeScript = (url: string, async: boolean = false) => {
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

  const CSS = (url: string, async: boolean = false) => {
    useEffect(() => {
      const sheet = document.createElement("link");
      sheet.rel = "stylesheet";
      sheet.type = "text/css";
      sheet.href = url;
  
      document.head.appendChild(sheet);
      return () => {
        document.head.removeChild(sheet);
      };
    }, [url]);
  };
    
const PotreeViewer = ({
  scan_location
}: {
  scan_location: string; 
}) => {

    const scripts = [
        "/potree_libs/jquery/jquery-3.1.1.min.js",
        "/potree_libs/spectrum/spectrum.js",
        "/potree_libs/jquery-ui/jquery-ui.min.js",
        "/potree_libs/other/BinaryHeap.js",
        "/potree_libs/tween/tween.min.js",
        "/potree_libs/i18next/i18next.js",
        "/potree_libs/d3/d3.js",
        "/potree_libs/proj4/proj4.js",
        "/potree_libs/openlayers3/ol.js",
        "/potree_libs/jstree/jstree.js",
        "/potree_libs/potree/potree.js",
        "/potree_libs/plasio/js/laslaz.js",
      ];

      const stylesheets = [
        "/potree_libs/potree/potree.css",
        "/potree_libs/jquery-ui/jquery-ui.min.css",
        "/potree_libs/openlayers3/ol.css",
        "/potree_libs/spectrum/spectrum.css",
        "/potree_libs/jstree/themes/mixed/style.css"
      ]
    
    
    scripts.forEach(script => {
        PotreeScript(script);
    })
  
    stylesheets.forEach(stylesheet => {
        CSS(stylesheet);
    })
    
    const elementRef = useRef();

    useEffect(() => {
      const timer = setTimeout(() => {

        const divElement = elementRef.current;

        window.viewer = new Potree.Viewer(divElement);
  
        viewer.setEDLEnabled(false);
        viewer.setFOV(90);
        viewer.setPointBudget(2_000_000);
        viewer.loadSettingsFromURL();
        viewer.setBackground("black");
  
        viewer.setControls(viewer.earthControls);

        viewer.loadGUI(() => {
          //viewer.toggleSidebar();
      });
        
        Potree.loadPointCloud(`${env.NEXT_PUBLIC_BACKEND_URL}/pointclouds/${scan_location}/metadata.json`, "TEST", e => {
          let scene = viewer.scene;
          let pointcloud = e.pointcloud;
          
          let material = pointcloud.material;
          material.size = 1;
          material.pointSizeType = Potree.PointSizeType.ADAPTIVE;
          material.shape = Potree.PointShape.CIRCLE;
          material.activeAttributeName = "rgba";
          
          scene.addPointCloud(pointcloud);
          
          viewer.fitToScreen();
        });
  
      }, 500);
  
      return () => clearTimeout(timer);
    }, [])

    return (
      <div className="potree_container">
        <div ref={elementRef} id="potree_render_area"></div>
        <div id="potree_sidebar_container"></div>
      </div>
      
    )
}

export default PotreeViewer;
