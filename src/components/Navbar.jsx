function Navbar({ items, activePage, onNavigate }) {
  return (
    <nav className="navbar">
      {items.map((item) => (
        <button
          key={item.key}
          className={item.key === activePage ? "nav-button active" : "nav-button"}
          onClick={() => onNavigate(item.key)}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}

export default Navbar;
