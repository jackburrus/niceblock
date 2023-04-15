import * as React from "react";

const PlusIcon = props => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    className="w-6 h-6 ml-2"
    viewBox="0 0 24 24"
    {...props}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
  </svg>
);
export default PlusIcon;
