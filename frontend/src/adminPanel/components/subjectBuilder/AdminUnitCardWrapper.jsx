import PropTypes from "prop-types";

/* 🔒 Component محلي للمعاينة فقط */
function UnitCardWrapper({
  unit,
  onOpen,
  onEdit,
  onDelete,
  canEdit = false,
  canDelete = false,
}) {
  if (!unit) return null;

  const { order, title } = unit;

  return (
    <div style={{ position: "relative" }}>
      <div className="unit-card" onClick={onOpen}>
        <div className="unit-badge">
          <span className="unit-shine" />
          UNIT {order}
        </div>

        <div className="unit-title-plate">
          <span className="unit-title-text">
            {title || "وحدة بدون عنوان"}
          </span>
        </div>
      </div>

      {(canEdit || canDelete) && (
        <div
          style={{
            position: "absolute",
            top: 12,
            right: 16,
            display: "flex",
            gap: "8px",
            zIndex: 10,
          }}
        >
          {canEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              style={btnStyle}
            >
              ✏️
            </button>
          )}

          {canDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              style={{ ...btnStyle, color: "#ffb703" }}
            >
              🗑️
            </button>
          )}
        </div>
      )}
    </div>
  );
}

const btnStyle = {
  background: "rgba(0,0,0,0.85)",
  border: "1px solid #d4af37",
  borderRadius: "10px",
  padding: "6px 8px",
  cursor: "pointer",
  color: "#d4af37",
  fontSize: "14px",
};

UnitCardWrapper.propTypes = {
  unit: PropTypes.object.isRequired,
  onOpen: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  canEdit: PropTypes.bool,
  canDelete: PropTypes.bool,
};

export default function UnitCardPreview() {
  const fakeUnit = {
    order: 1,
    title: "الوحدة التجريبية – جبر",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#000",
        padding: "40px",
      }}
    >
      <h2 style={{ color: "#d4af37", marginBottom: "30px" }}>
        🎛️ معاينة كارت الوحدة الإداري
      </h2>

      <UnitCardWrapper
        unit={fakeUnit}
        canEdit
        canDelete
        onOpen={() => alert("فتح")}
        onEdit={() => alert("تعديل")}
        onDelete={() => alert("حذف")}
      />
    </div>
  );
}
