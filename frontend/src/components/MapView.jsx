import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function MapView() {

  const [coords, setCoords] = useState([]);
  const [pendingPolygon, setPendingPolygon] = useState(null);

  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const coordsRef = useRef([]);

  useEffect(() => {

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: [10.54, 64.37],
      zoom: 10
    });

    mapRef.current = map;

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

      map.addSource("polygon-preview", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: []
        }
      });

      map.addLayer({
        id: "polygon-preview",
        type: "fill",
        source: "polygon-preview",
        paint: {
          "fill-color": "#0080ff",
          "fill-opacity": 0.35
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

      map.addLayer({
        id: "points",
        type: "circle",
        source: "points",
        paint: {
          "circle-radius": 6,
          "circle-color": "#ff0000"
        }
      });

    });

    map.on("click", handleMapClick);

    map.on("dblclick", handleDoubleClick);

    return () => map.remove();

  }, []);

  function handleMapClick(e) {

    if (pendingPolygon) {
      return;
    }

    const map = mapRef.current;

    const newPoint = [
      e.lngLat.lng,
      e.lngLat.lat
    ];

    setCoords(prev => {

      const updated = [...prev, newPoint];

      coordsRef.current = updated;

      updatePoints(updated);

      updateLine(updated);

      return updated;

    });

  }

  function handleDoubleClick() {

    if (pendingPolygon) {
      return;
    }

    const points = coordsRef.current;

    if (points.length < 3) {
      return;
    }

    const polygon = {
      type: "Feature",
      properties: {},
      geometry: {
        type: "Polygon",
        coordinates: [
          [...points, points[0]]
        ]
      }
    };

    const map = mapRef.current;

    map.getSource("polygon-preview").setData({
      type: "FeatureCollection",
      features: [polygon]
    });

    setPendingPolygon(polygon.geometry);

  }

  function updatePoints(points) {

    const map = mapRef.current;

    map.getSource("points").setData({
      type: "FeatureCollection",
      features: points.map(coord => ({
        type: "Feature",
        properties: {},
        geometry: {
          type: "Point",
          coordinates: coord
        }
      }))
    });

  }

  function updateLine(points) {

    const map = mapRef.current;

    map.getSource("line").setData({
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: points
      }
    });

  }

  function clearDrawing() {

    const map = mapRef.current;

    setCoords([]);

    coordsRef.current = [];

    setPendingPolygon(null);

    map.getSource("points").setData({
      type: "FeatureCollection",
      features: []
    });

    map.getSource("line").setData({
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: []
      }
    });

    map.getSource("polygon-preview").setData({
      type: "FeatureCollection",
      features: []
    });

  }

  async function handleConfirmPolygon() {

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
          geometry: pendingPolygon
        })
      }
    );

    const data = await response.json();

    console.log(data);

    if (response.ok) {
      clearDrawing();
    }

  }

  function handleCancelPolygon() {

    clearDrawing();

  }

  return (
    <>
      <div
        ref={mapContainer}
        style={{
          width: "100%",
          height: "100vh"
        }}
      />

      {pendingPolygon && (
        <div
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            display: "flex",
            gap: "10px",
            zIndex: 1000
          }}
        >
          <button onClick={handleConfirmPolygon}>
            Confirm
          </button>

          <button onClick={handleCancelPolygon}>
            Cancel
          </button>
        </div>
      )}
    </>
  );

}