//@ts-nocheck

import { env } from '@/env.mjs';
import { useRef, useEffect } from 'react';

const PotreeScript = (url: string) => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = url;
    script.async = false;

    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, [url]);
};

const CSS = (url: string) => {
  useEffect(() => {
    const sheet = document.createElement("link");
    sheet.rel = "stylesheet";
    sheet.type = "text/css";
    sheet.href = url;
    sheet.async = false;

    document.head.appendChild(sheet);
    return () => {
      document.head.removeChild(sheet);
    };
  }, [url]);
};

const PotreeViewer = ({
  scan_location,
  script_loaded,
  set_script_loaded,
  set_viewer_loaded,
}: {
  scan_location: string;
  script_loaded: boolean;
  set_script_loaded;
  set_viewer_loaded;
}) => {

  // Essential potree external scripts
  const scripts = [
    "/potree-fork/libs/jquery/jquery-3.1.1.min.js",
    "/potree-fork/libs/other/BinaryHeap.js",
    "/potree-fork/libs/tween/tween.min.js",
    "/potree-fork/libs/d3/d3.js",
    "/potree-fork/libs/proj4/proj4.js",
    "/potree-fork/libs/potree/potree.js",
];

  const stylesheets = [
        "/potree-fork/libs/potree/potree.css",
  ]
  
  stylesheets.forEach(stylesheet => {
    CSS(stylesheet);
  })

  scripts.forEach(script => {
    PotreeScript(script);
  })

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "/potree-fork/libs/potree/potree.js";
    script.addEventListener('load', () => set_script_loaded(true));
    document.head.appendChild(script);
    
  }, [set_script_loaded])

  const elementRef = useRef();
  
  useEffect(() => {
    let pointcloud, scene, material;

    // Only load the Potree viewport when its script is fully loaded.
    if (script_loaded) {
      console.log("script is loaded!")
      const divElement = elementRef.current;

      window.viewer = new Potree.Viewer(divElement);

      viewer.setEDLEnabled(false);
      viewer.setFOV(90);
      viewer.setBackground("black");
      viewer.setControls(viewer.earthControls);

      // Just load the VRButton if VR is supported
      viewer.loadGUI(() => {});

      set_viewer_loaded(true);

      Potree.loadPointCloud(`${env.NEXT_PUBLIC_BACKEND_URL}/pointclouds/${scan_location}/metadata.json`, "POINTCLOUD", e => {
        scene = viewer.scene;
        pointcloud = e.pointcloud;
        material = pointcloud.material;

        material.size = 1;
        material.pointSizeType = Potree.PointSizeType.ADAPTIVE;
        material.shape = Potree.PointShape.CIRCLE;
        material.activeAttributeName = "rgba";

        scene.addPointCloud(pointcloud);
        viewer.fitToScreen();
      });

    }
    else {
      console.log("script is not loaded!")
    }
  }, [script_loaded, set_viewer_loaded, scan_location])

  return (
    <div className="potree_container">
      <div ref={elementRef} id="potree_render_area"></div>
      <div id="potree_sidebar_container"></div>
    </div>

  )
}

export default PotreeViewer;