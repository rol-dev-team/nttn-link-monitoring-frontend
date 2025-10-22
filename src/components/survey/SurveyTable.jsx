import React from "react";
import DataTable from "../table/DataTable";
import SurveyFilterMenu from "./SurveyFilterMenu";
const SurveyTable = ({
  records,
  onEdit,
  columns,
  onFilterChange,
  dynamicOptions,
  // 🔑 ACCEPT PAGINATION PROPS
  isBackendPagination,
  totalRows,
  page,
  pageSize,
  setPage,
  setPageSize,
}) => {
  return (
    <DataTable
      title="Survey Records"
      data={records}
      columns={columns}
      showId={true}
      searchable={true}
      selection={true}
      filterComponent={
        <SurveyFilterMenu
          records={records}
          onFilterChange={onFilterChange}
          dynamicOptions={dynamicOptions}
        />
      }
      noDataMessage="No survey records found. Click 'Add Survey' to create a new one."

      // 🔑 PASS THROUGH PAGINATION PROPS
      isBackendPagination={isBackendPagination}
      totalRows={totalRows}
      page={page}
      pageSize={pageSize}
      setPage={setPage}
      setPageSize={setPageSize}
      onFilterChange={onFilterChange}
    />
  );
};

export default SurveyTable;