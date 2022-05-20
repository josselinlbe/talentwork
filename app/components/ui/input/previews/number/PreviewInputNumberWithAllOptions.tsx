import { useState } from "react";
import InputNumber from "~/components/ui/input/InputNumber";

export default function PreviewInputNumberWithAllOptions() {
  const [value, setValue] = useState(0);
  return (
    <div id="input-number-with-all-options">
      <div className="bg-white p-6 border-dashed border-gray-300 border">
        <InputNumber name="name" title="Title" value={value} setValue={setValue} min={0} max={10} required step="0.01" />
      </div>
    </div>
  );
}
