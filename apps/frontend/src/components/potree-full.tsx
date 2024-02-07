//@ts-nocheck

import { env } from '@/env.mjs';
import { useRef, useEffect, useState } from 'react';

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
    sheet.async = async;

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

  const [scriptsLoaded, setLoaded] = useState(false);

  const scripts = [
    "/potree-fork/libs/jquery/jquery-3.1.1.min.js",
    "/potree-fork/libs/other/BinaryHeap.js",
    "/potree-fork/libs/tween/tween.min.js",
    "/potree-fork/libs/proj4/proj4.js",
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
    script.addEventListener('load', ()=>setLoaded(true));
    document.head.appendChild(script);
    
  }, [])

  const elementRef = useRef();

  useEffect(() => {

    if (scriptsLoaded) {
      console.log("script is loaded!")
      const divElement = elementRef.current;

      window.viewer = new Potree.Viewer(divElement);

      viewer.setEDLEnabled(false);
      viewer.setFOV(90);
      viewer.setPointBudget(2_000_000);
      viewer.loadSettingsFromURL();
      viewer.setBackground("black");

      viewer.setControls(viewer.earthControls);

      Potree.loadPointCloud(`${env.NEXT_PUBLIC_BACKEND_URL}/pointclouds/${scan_location}/metadata.json`, "POINTCLOUD", e => {
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

    }
    else {
      console.log("script is not loaded!")
    }
  }, [scriptsLoaded])

  return (
    <div className="potree_container">
      <div ref={elementRef} id="potree_render_area"></div>
    </div>

  )
}

export default PotreeViewer;