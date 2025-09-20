import React from "react";

function Card({ children, className = "", hoverEffect = true }) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-md border border-gray-100 p-6 transition-shadow duration-300 ${
        hoverEffect ? "hover:shadow-lg" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

export default Card;
