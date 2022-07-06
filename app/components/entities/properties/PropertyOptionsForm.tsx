import { Dialog, Transition } from "@headlessui/react";
import { Ref, useImperativeHandle, useRef, useState, Fragment, forwardRef } from "react";
import { useTranslation } from "react-i18next";
import { Colors } from "~/application/enums/shared/Colors";
import ColorBadge from "~/components/ui/badges/ColorBadge";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import TrashIcon from "~/components/ui/icons/TrashIcon";
import InputSelector from "~/components/ui/input/InputSelector";
import InputText, { RefInputText } from "~/components/ui/input/InputText";
import ErrorModal, { RefErrorModal } from "~/components/ui/modals/ErrorModal";
import { getColors } from "~/utils/shared/ColorUtils";
import { updateItemByIdx } from "~/utils/shared/ObjectUtils";

export type OptionValue = {
  id: string | null;
  parentId: string | null;
  order: number;
  value: string;
  name: string | null;
  color?: Colors;
  options?: OptionValue[];
};
export interface RefPropertyOptionsForm {
  set: (options: OptionValue[]) => void;
}

interface Props {
  title: string;
  onSet: (items: OptionValue[]) => void;
}

const PropertyOptionsForm = ({ title, onSet }: Props, ref: Ref<RefPropertyOptionsForm>) => {
  useImperativeHandle(ref, () => ({ set }));

  const { t } = useTranslation();

  const errorModal = useRef<RefErrorModal>(null);

  const inputOption = useRef<RefInputText>(null);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<OptionValue[]>([]);

  function set(options: OptionValue[]) {
    setItems(options);
    if (options.length === 0) {
      addOption();
    }

    setOpen(true);
  }

  function close() {
    setOpen(false);
  }

  function save() {
    const emptyItems = items.filter((f) => !f.value || f.value.trim() === "");
    if (emptyItems.length > 0) {
      errorModal.current?.show(t("entities.errors.selectOptionCannotBeEmpty"));
      return;
    }
    onSet(items);
    close();
  }

  function addOption() {
    const maxOrder = items.length === 0 ? 1 : Math.max(...items.map((o) => o.order));
    setItems([
      ...items,
      {
        id: null,
        parentId: null,
        order: maxOrder + 1,
        value: "Option " + (items.length + 1).toString(),
        name: null,
        color: Colors.UNDEFINED,
        options: [],
      },
    ]);

    setTimeout(() => {
      inputOption.current?.input.current?.focus();
    }, 1);
  }

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="fixed z-10 inset-0 overflow-y-auto" onClose={setOpen}>
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm w-full sm:p-6">
              <div>
                <div className="mt-3 sm:mt-5">
                  <Dialog.Title as="h3" className=" capitalize text-lg leading-6 font-medium text-gray-900">
                    {t(title)} Dropdown options
                  </Dialog.Title>
                  <div className="mt-4 space-y-3">
                    <div className="w-full">
                      <label htmlFor="select" className="block text-xs font-medium text-gray-700">
                        Options
                      </label>
                      <div className="mt-1 space-y-2">
                        {items.map((option, idx) => {
                          return (
                            <div key={option.order} className="mt-1 flex items-center space-x-1 rounded-md">
                              <InputText
                                ref={inputOption}
                                type="text"
                                title=""
                                withLabel={false}
                                name={"select-option-" + idx}
                                value={option.value}
                                setValue={(e) =>
                                  updateItemByIdx(items, setItems, idx, {
                                    value: e,
                                  })
                                }
                              />

                              <InputSelector
                                name="color"
                                title={t("models.group.color")}
                                withSearch={false}
                                value={option.color ?? Colors.UNDEFINED}
                                withLabel={false}
                                setValue={(e) =>
                                  updateItemByIdx(items, setItems, idx, {
                                    color: Number(e),
                                  })
                                }
                                selectPlaceholder={""}
                                className="w-20"
                                options={
                                  getColors().map((color) => {
                                    return {
                                      name: <ColorBadge color={color} />,
                                      value: color,
                                    };
                                  }) ?? []
                                }
                              ></InputSelector>

                              <ButtonSecondary
                                disabled={items.length === 1}
                                type="button"
                                onClick={() => setItems([...items.filter((_, index) => index !== idx)])}
                              >
                                <TrashIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                              </ButtonSecondary>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="w-full">
                      <div className="flex space-x-2">
                        <ButtonSecondary onClick={addOption}>
                          <div className="text-xs -mx-1">Add option</div>
                        </ButtonSecondary>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 border-t border-gray-200 pt-3">
                <div className="flex items-center space-x-2 justify-end">
                  <ButtonSecondary onClick={close}>Cancel</ButtonSecondary>
                  <ButtonPrimary onClick={save}>Save</ButtonPrimary>
                </div>
              </div>
              <ErrorModal ref={errorModal} />
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default forwardRef(PropertyOptionsForm);
