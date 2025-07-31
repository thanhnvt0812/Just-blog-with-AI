import React from "react";

const CustomTooltip = ({ active, payload }) => {
  if (
    active &&
    payload &&
    Array.isArray(payload) &&
    payload.length > 0 &&
    payload[0]?.payload
  ) {
    const data = payload[0].payload;
    return (
      <div className="bg-white shadow-md rounded-lg border border-gray-200 px-5 py-2">
        <p className="text-xs font-semibold text-sky-800 mb-1">{data.name}</p>
        <p className="text-sm text-gray-600">
          Count:{" "}
          <span className="text-sm font-medium text-gray-900">
            {data.count}
          </span>
        </p>
      </div>
    );
  }

  return null;
};

export default CustomTooltip;
