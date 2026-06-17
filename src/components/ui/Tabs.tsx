import { useState } from "react";

type TabsProps = {
  tabs: string[];
};

export default function Tabs({
  tabs,
}: TabsProps) {
  const [active, setActive] = useState(tabs[0]);

  return (
    <div>
      <div className="flex gap-2 border-b mb-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`px-4 py-2 ${
              active === tab
                ? "border-b-2 border-cixio-blue text-cixio-blue"
                : "text-gray-500"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div>
        Active Tab: {active}
      </div>
    </div>
  );
}