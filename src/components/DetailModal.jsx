import { useEffect } from "react";

function DetailModal({ title, subtitle, image, imageAlt, imageFit = "cover", details, onClose }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="detail-modal-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <section
        className="detail-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button className="detail-modal-close" type="button" onClick={onClose} aria-label="Tutup detail">
          ×
        </button>
        {image ? (
          <img className={`detail-modal-image detail-modal-image-${imageFit}`} src={image} alt={imageAlt} />
        ) : (
          <div className="detail-modal-image detail-modal-placeholder">Gambar belum tersedia</div>
        )}
        <div className="detail-modal-content">
          <p className="car-manufacturer">{subtitle}</p>
          <h2 id="detail-modal-title">{title}</h2>
          <dl className="detail-list">
            {details.map(({ label, value }) => (
              <div className="detail-row" key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </div>
  );
}

export default DetailModal;
