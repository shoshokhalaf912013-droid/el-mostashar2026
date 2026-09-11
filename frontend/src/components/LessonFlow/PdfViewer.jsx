import PropTypes from "prop-types";

export default function PdfViewer({ src }) {
  if (!src) {
    return null; // أمان: لو مفيش PDF
  }

  return (
    <div className="pdf-wrapper">
      <iframe
        src={src}
        title="lesson-pdf"
        width="100%"
        height="600"
        style={{ border: "none", borderRadius: "12px" }}
        loading="lazy"
      />
    </div>
  );
}

PdfViewer.propTypes = {
  src: PropTypes.string,
};
