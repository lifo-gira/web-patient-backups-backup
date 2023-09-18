import { Route, Routes } from "react-router-dom";
import Login from "./Login.js";
import Home from "./Home.js";
import Header from "./Componenets/Header.jsx";
import { useEffect, useState } from "react";
import Diagno from "./Componenets/Diagno.jsx";
import Live from "./Componenets/Live.jsx";
import Test from "./Componenets/Test.jsx"

function App() {
  const [status, setStatus] = useState(localStorage.getItem("isLoggedIn"));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));

  return (
    <Routes>
      {/* <Route path="*" element={<App />} /> */}
      <Route path="/" element={<Header />} />
      <Route element={<Home />} path="/home" />
      <Route element={<Login />} path="/login" />
      <Route element={<Diagno />} path="/diagnostics" />
      {/* <Route element={<Live />} path="/live" /> */}
    </Routes>
  );
}

export default App;
