import React, { useState, useMemo } from "react";
import {
  LayoutList,
  LayoutGrid,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import EmployeeCard from "../EmployeeCard.jsx";

// ------------------------------------------------------------------
// Dummy data - replace this with your API data
// ------------------------------------------------------------------
// const employeeData = Array.from({ length: 87 }).map((_, i) => ({
//   id: i + 1,
//   department: ["IT", "HR", "Finance", "Marketing", "Operations"][i % 5],
//   description: `Handles ${["development", "recruitment", "accounting", "campaigns", "logistics"][i % 5]} tasks`,
//   code: `DEP-${String(i + 1).padStart(3, "0")}`,
//   status: i % 3 === 0 ? "Inactive" : "Active",
// }));

const pageSize = 20;

const EmployeeList = ({employeeData, pageSize=20, }) => {
  const [view, setView] = useState("list"); // "list" | "card"
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(employeeData?.length / pageSize);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return employeeData.slice(start, start + pageSize);
  }, [page, employeeData]);

  const goToPage = (p) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
  };

  // Build a compact page number list e.g. 1 2 3 ... 8 9
  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    pages.push(1);
    let start = Math.max(2, page - 1);
    let end = Math.min(totalPages - 1, page + 1);

    if (start > 2) pages.push("...");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages - 1) pages.push("...");
    pages.push(totalPages);

    return pages;
  }, [page, totalPages]);

  return (
    <div className="space-y-4">
      {/* Header: title + view toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h5 className="text-lg font-semibold text-gray-800">
          Employee List
          <span className="ml-2 text-sm font-normal text-gray-400">
            ({employeeData?.length} total)
          </span>
        </h5>

        <div className="inline-flex rounded-md border border-gray-200 bg-gray-50 p-1">
          <button
            type="button"
            onClick={() => setView("list")}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              view === "list"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <LayoutList className="h-4 w-4" />
            List
          </button>
          <button
            type="button"
            onClick={() => setView("card")}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              view === "card"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
            Card
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------ */}
      {/* LIST / TABLE VIEW */}
      {/* ------------------------------------------------------------ */}
      {view === "list" && (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            {paginatedData?.length >= 0 && <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  {/* <th className="px-4 py-3 font-medium">Employee ID</th> */}
                  <th className="px-4 py-3 font-medium">Description</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-center font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedData.map((emp) => (
                  <tr
                    key={emp.id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {emp.firstName} {emp.lastName}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {emp.email}
                    </td>
                    {/* <td className="px-4 py-3 text-gray-600">{emp.employeeId}</td> */}
                    <td className="px-4 py-3 text-gray-600">{emp.description}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                          emp.employeestatus == "ACTIVE"
                            ? "badge-success"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {emp.employeeStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          title="Edit"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-indigo-50 hover:text-indigo-600"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          title="Delete"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------ */}
      {/* CARD VIEW */}
      {/* ------------------------------------------------------------ */}
      {view === "card" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {paginatedData?.length === 0 ? (
            <p className="col-span-full text-center py-16 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">No Employee Found</p>
          ) : (
            paginatedData.map((emp)=><EmployeeCard key={emp.id} employee={emp} onDelete={fetchEmployees} onEdit = { (e)=>setEditEmployee(e)} />)
          )}

        </div>
      )}

      {/* ------------------------------------------------------------ */}
      {/* PAGINATION */}
      {/* ------------------------------------------------------------ */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
        <p className="text-sm text-gray-500">
          Showing{" "}
          <span className="font-medium text-gray-700">
            {(page - 1) * pageSize + 1}
          </span>{" "}
          to{" "}
          <span className="font-medium text-gray-700">
            {Math.min(page * pageSize, employeeData?.length)}
          </span>{" "}
          of{" "}
          <span className="font-medium text-gray-700">
            {employeeData?.length}
          </span>{" "}
          entries
        </p>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => goToPage(1)}
            disabled={page === 1}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => goToPage(page - 1)}
            disabled={page === 1}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {pageNumbers.map((p, idx) =>
            p === "..." ? (
              <span
                key={`dots-${idx}`}
                className="inline-flex h-8 w-8 items-center justify-center text-sm text-gray-400"
              >
                ...
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => goToPage(p)}
                className={`inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors ${
                  page === p
                    ? "bg-indigo-600 text-white"
                    : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {p}
              </button>
            )
          )}

          <button
            type="button"
            onClick={() => goToPage(page + 1)}
            disabled={page === totalPages}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => goToPage(totalPages)}
            disabled={page === totalPages}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default EmployeeList;