// // // src/components/ui/ExportButton.jsx

// import React from 'react';
// import * as XLSX from 'xlsx';
// import { saveAs } from 'file-saver';
// import { Download } from 'lucide-react';
// import Button from './Button'; 

// const ExportButton = ({ data, columns, fileName = 'data_export', ...props }) => {
//   const exportToExcel = () => {
//     // ... (same exportToExcel logic as before)
//     const exportData = data.map(row => {
//       const exportRow = {};
//       columns.forEach(col => {
//         const value = col.render ? col.render(row[col.key], row) : row[col.key];
//         exportRow[col.header || col.key] = value;
//       });
//       return exportRow;
//     });

//     const ws = XLSX.utils.json_to_sheet(exportData);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
//     const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
//     const blob = new Blob([wbout], { type: 'application/octet-stream' });
//     saveAs(blob, `${fileName}.xlsx`);
//   };

//   return (
//     <Button onClick={exportToExcel} {...props}>
//       {props.children || 'Export'}
//     </Button>
//   );
// };

// export default ExportButton;



import React from "react";
import clsx from "clsx";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const normalizeCellValue = (value) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(normalizeCellValue).join(", ");
  }
  if (React.isValidElement(value)) {
    const child = value.props?.children;
    if (Array.isArray(child)) return child.map(normalizeCellValue).join(" ");
    return normalizeCellValue(child);
  }
  if (value instanceof Date) return value.toISOString();
  return String(value);
};

const ExportButton = ({
  data = [],
  columns = [],
  fileName = "data_export",
  intent = "default",
  className,
  children,
  leftIcon: Icon,
  onClick,
  ...props
}) => {
  const baseClasses = "px-4 py-2 rounded-md font-medium transition inline-flex items-center gap-2";

  const intentClasses =
    intent === "primary"
      ? "bg-blue-600 text-white hover:bg-blue-700"
      : "bg-gray-200 text-black hover:bg-gray-300";

  const exportToExcel = () => {
    const safeColumns = Array.isArray(columns) ? columns : [];
    const safeData = Array.isArray(data) ? data : [];

    if (safeColumns.length === 0 || safeData.length === 0) return;

    const exportData = safeData.map((row) => {
      const exportRow = {};
      safeColumns.forEach((col) => {
        if (!col?.key || col.key === "actions") return;
        const rawValue = col.render ? col.render(row[col.key], row) : row[col.key];
        exportRow[col.header || col.key] = normalizeCellValue(rawValue);
      });
      return exportRow;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    saveAs(blob, `${fileName}.xlsx`);
  };

  const handleClick = (e) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    exportToExcel();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={clsx(baseClasses, intentClasses, className)}
      {...props}
    >
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
};

export default ExportButton;

