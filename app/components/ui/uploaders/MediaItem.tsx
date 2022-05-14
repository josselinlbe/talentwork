import ButtonTertiary from "../buttons/ButtonTertiary";
import TrashIcon from "../icons/TrashIcon";
import InputText from "../input/InputText";

interface Props {
  title: string;
  type: string;
  onChangeTitle: (e: string) => void;
  onDelete: () => void;
  readOnly?: boolean;
}
export default function MediaItem({ title, type, onChangeTitle, onDelete, readOnly }: Props) {
  return (
    <div className="w-full bg-gray-50 text-xs border border-dashed border-gray-300 px-2">
      <div className="flex justify-between space-x-2 items-center select-none py-1">
        <div className="flex flex-grow space-x-1 items-center">
          <InputText
            withLabel={false}
            title="Media"
            readOnly={readOnly}
            required
            name="media-title"
            maxLength={50}
            value={title}
            setValue={(e) => onChangeTitle(e.toString())}
            className="w-full rounded-sm"
          />
          <div className=" text-lg">.{type.split("/")[1]}</div>
        </div>
        <div>
          <ButtonTertiary onClick={() => onDelete()} className="p-2 hover:bg-gray-50 group">
            <TrashIcon className="h-4 w-4 text-gray-500 group-hover:text-red-500" />
          </ButtonTertiary>
        </div>
      </div>
    </div>
  );
}
