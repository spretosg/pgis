import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function MapView() {
  const [coords, setCoords] = useState([]);
  const coordsRef = useRef([]);
  const mapContainer = useRef(null);

  useEffect(() => {
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: [10.54, 64.37],
      zoom: 10
    });

    map.doubleClickZoom.disable();

    map.on("load", () => {
      map.addSource("points", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: []
        }
      });

      map.addSource("line", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: []
          }
        }
      });

      map.addLayer({
        id: "points",
        type: "circle",
        source: "points",
        paint: {
          "circle-radius": 6,
          "circle-color": "#ff0000"
        }
      });

      map.addLayer({
        id: "line",
        type: "line",
        source: "line",
        paint: {
          "line-width": 3,
          "line-color": "#0066ff"
        }
      });
    });

    map.on("click", (e) => {
      const newPoint = [
        e.lngLat.lng,
        e.lngLat.lat
      ];

      setCoords((prev) => {
        const updated = [...prev, newPoint];

        coordsRef.current = updated;

        const pointSource = map.getSource("points");

        if (pointSource) {
          pointSource.setData({
            type: "FeatureCollection",
            features: updated.map((coord) => ({
              type: "Feature",
              properties: {},
              geometry: {
                type: "Point",
                coordinates: coord
              }
            }))
          });
        }

        const lineSource = map.getSource("line");

        if (lineSource) {
          lineSource.setData({
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: updated
            }
          });
        }

        return updated;
      });
    });

    map.on("dblclick", async () => {
      const points = coordsRef.current;

      if (points.length < 3) {
        return;
      }

      const polygonCoords = [
        ...points,
        points[0]
      ];

      const polygonGeoJSON = {
        type: "Polygon",
        coordinates: [
          polygonCoords
        ]
      };

      console.log("SAVING", polygonGeoJSON);

      const response = await fetch(
        "http://localhost:8000/polygons/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify({
            name: "Polygon",
            geometry: polygonGeoJSON
          })
        }
      );

      const data = await response.json();

      console.log("SERVER RESPONSE:", data);
    });

    return () => map.remove();
  }, []);

  return (
    <div
      ref={mapContainer}
      style={{
        width: "100%",
        height: "100vh"
      }}
    />
  );
}
