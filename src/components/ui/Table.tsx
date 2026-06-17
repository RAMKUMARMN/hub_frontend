type TableProps = {
  headers: string[];
  data: string[][];
};

export default function Table({
  headers,
  data,
}: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-200">
        <thead>
          <tr className="bg-cixio-light">
            {headers.map((header) => (
              <th
                key={header}
                className="px-4 py-2 text-left border-b"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              {row.map((cell, i) => (
                <td
                  key={i}
                  className="px-4 py-2 border-b"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}