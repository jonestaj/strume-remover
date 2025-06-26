import React from "react";
import logo from "../assets/strume-logo.png";

export default function Header() {
  return (
    <header className="w-full py-6 flex justify-center bg-white/30 backdrop-blur-md border-b border-white/20 shadow-sm">
      <img src={logo} alt="Strume Logo" className="h-12" />
    </header>
  );
}
