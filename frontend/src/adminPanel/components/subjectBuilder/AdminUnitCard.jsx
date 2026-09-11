import PropTypes from "prop-types";
import "../../../components/units/UnitCard.css";

export default function AdminUnitCard({ unit, onClick, children }) {
  if (!unit) return null;

  const { order, title } = unit;

  return (
    <div className="unit-card" onClick={onClick}>
      {/* شارة UNIT */}
      <div className="unit-badge">
        <span className="unit-shine" />
        UNIT {order}
      </div>

      {/* عنوان الوحدة */}
      <div className="unit-title-plate">
        <span className="unit-title-text">
          {title || "وحدة بدون عنوان"}
        </span>
      </div>

      {/* مساحة الأزرار (سوبر أدمن / أدمن / مدرس) */}
      {children && (
        <div style={{ marginTop: "18px", width: "100%" }}>
          {children}
        </div>
      )}
    </div>
  );
}

AdminUnitCard.propTypes = {
  unit: PropTypes.shape({
    order: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    title: PropTypes.string,
  }).isRequired,
  onClick: PropTypes.func,
  children: PropTypes.node,
};
