// frontend/src/components/reports/DonutChart.jsx

import React from "react";

function polarToCartesian(
  cx,
  cy,
  radius,
  angle
) {
  const angleInRadians =
    ((angle - 90) *
      Math.PI) /
    180;

  return {
    x:
      cx +
      radius *
        Math.cos(
          angleInRadians
        ),

    y:
      cy +
      radius *
        Math.sin(
          angleInRadians
        ),
  };
}

function describeArc(
  cx,
  cy,
  radius,
  startAngle,
  endAngle
) {
  const start =
    polarToCartesian(
      cx,
      cy,
      radius,
      endAngle
    );

  const end =
    polarToCartesian(
      cx,
      cy,
      radius,
      startAngle
    );

  const largeArcFlag =
    endAngle -
      startAngle <=
    180
      ? "0"
      : "1";

  return [
    "M",
    start.x,
    start.y,
    "A",
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
  ].join(" ");
}

export default function DonutChart({
  data = [],
  centerValue = "",
  centerLabel = "",
  size = 220,
  strokeWidth = 30,
}) {
  const total =
    data.reduce(
      (sum, item) =>
        sum +
        (Number(
          item.value
        ) || 0),
      0
    );

  const safeTotal =
    total || 1;

  let currentAngle = 0;

  const segments =
    data
      .filter(
        (item) =>
          Number(
            item.value
          ) > 0
      )
      .map((item) => {
        const value =
          Number(
            item.value
          );

        const angle =
          (value /
            safeTotal) *
          360;

        const startAngle =
          currentAngle;

        const endAngle =
          currentAngle +
          angle;

        currentAngle =
          endAngle;

        return {
          ...item,
          startAngle,
          endAngle,
          percentage:
            total > 0
              ? (value /
                  total) *
                100
              : 0,
        };
      });

  const center =
    size / 2;

  const radius =
    (size -
      strokeWidth) /
    2;

  return (
    <div
      style={{
        display: "flex",
        flexDirection:
          "column",
        alignItems:
          "center",
        gap: "18px",
      }}
    >
      <div
        style={{
          position:
            "relative",
          width:
            `${size}px`,
          height:
            `${size}px`,
        }}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
        >
          {/* Background */}

          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={
              strokeWidth
            }
          />

          {segments.map(
            (
              segment,
              index
            ) => {
              const gap =
                segments.length >
                1
                  ? 1.5
                  : 0;

              const start =
                segment.startAngle +
                gap;

              const end =
                segment.endAngle -
                gap;

              return (
                <path
                  key={`${segment.label}-${index}`}
                  d={describeArc(
                    center,
                    center,
                    radius,
                    start,
                    end
                  )}
                  fill="none"
                  stroke={
                    segment.color
                  }
                  strokeWidth={
                    strokeWidth
                  }
                  strokeLinecap="butt"
                  style={{
                    filter:
                      `drop-shadow(0 0 6px ${segment.color}55)`,
                  }}
                />
              );
            }
          )}
        </svg>

        {/* CENTER */}

        <div
          style={{
            position:
              "absolute",
            inset: 0,
            display:
              "flex",
            flexDirection:
              "column",
            alignItems:
              "center",
            justifyContent:
              "center",
            textAlign:
              "center",
          }}
        >
          <div
            style={{
              fontSize:
                "31px",
              fontWeight:
                "900",
              color:
                "#fff",
              lineHeight:
                1,
            }}
          >
            {centerValue}
          </div>

          {centerLabel && (
            <div
              style={{
                marginTop:
                  "7px",
                fontSize:
                  "12px",
                color:
                  "#888",
              }}
            >
              {centerLabel}
            </div>
          )}
        </div>
      </div>

      {/* Legend */}

      <div
        style={{
          width:
            "100%",
          display:
            "grid",
          gridTemplateColumns:
            "repeat(2,minmax(0,1fr))",
          gap:
            "10px",
        }}
      >
        {data.map(
          (item) => (
            <div
              key={
                item.label
              }
              style={{
                display:
                  "flex",
                alignItems:
                  "center",
                gap:
                  "8px",
                color:
                  "#ddd",
                fontSize:
                  "12px",
              }}
            >
              <span
                style={{
                  width:
                    "10px",
                  height:
                    "10px",
                  borderRadius:
                    "50%",
                  background:
                    item.color,
                  boxShadow:
                    `0 0 8px ${item.color}`,
                  flexShrink: 0,
                }}
              />

              <span
                style={{
                  flex: 1,
                }}
              >
                {item.label}
              </span>

              <strong
                style={{
                  color:
                    item.color,
                }}
              >
                {total > 0
                  ? `${Math.round(
                      (Number(
                        item.value
                      ) /
                        total) *
                        100
                    )}%`
                  : "0%"}
              </strong>
            </div>
          )
        )}
      </div>
    </div>
  );
}