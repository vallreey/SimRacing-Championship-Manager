function PlaceholderPage({title}) {
  return (
    <section>
      <h2 className="page-title">{title}</h2>
      <div className="card">
        <p className="empty">Halaman {title}</p>
      </div>
    </section>
  );
}

export default PlaceholderPage;
