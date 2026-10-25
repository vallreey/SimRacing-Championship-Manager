import logo from "../assets/logo.png";

function Header() {
  return (
    <header className="header">
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
