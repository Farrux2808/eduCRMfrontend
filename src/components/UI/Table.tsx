import React, { ReactNode } from 'react';

interface Column {
  key: string;
  title: string;
  render?: (value: any, record: any) => ReactNode;
  width?: string;
}

interface TableProps {
  columns: Column[];
  data: any[];
  loading?: boolean;
  emptyText?: string;
}

export default function Table({ columns, data, loading = false, emptyText = 'Ma\'lumot topilmadi' }: TableProps) {
  if (loading) {
    return (
      <div className="card">
        <div className="card-content">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-primary-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="overflow-x-auto">
        <table className="table">
          <thead className="table-header">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="table-head"
                  style={{ width: column.width }}
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="table-cell text-center py-12 text-gray-500">
                  {emptyText}
                </td>
              </tr>
            ) : (
              data.map((record, index) => (
                <tr key={index} className="table-row">
                  {columns.map((column) => (
                    <td key={column.key} className="table-cell">
                      {column.render
                        ? column.render(record[column.key], record)
                        : record[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}