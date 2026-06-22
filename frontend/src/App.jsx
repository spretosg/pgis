import { useState } from "react";
import Login from "./components/Login";
import MapView from "./components/MapView";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  return loggedIn ? (
    <MapView />
  ) : (
    <Login
      onLogin={() => setLoggedIn(true)}
    />
  );
}
