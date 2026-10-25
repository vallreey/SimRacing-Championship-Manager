import { useEffect, useState } from "react";
import logo from "../assets/logo.png";

function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    function updateScrollState() {
      setIsScrolled(window.scrollY > 0);
    }

    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollState);
  }, []);

  return (
    <header className={`header${isScrolled ? " header-scrolled" : ""}`}>
      <div className="header-brand">
        <img className="header-logo" src={logo} alt="Sim Racing" />
        <div>
          <h1>Sim Racing Championship Manager</h1>
          <p>Kelola driver, mobil, sirkuit, jadwal, dan hasil race</p>
        </div>
      </div>
      <span className="header-badge">Season 2026</span>
    </header>
  );
}

export default Header;
