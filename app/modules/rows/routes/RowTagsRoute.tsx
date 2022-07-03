import { useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Form, useLoaderData, useNavigate, useSubmit, useTransition } from "@remix-run/react";
import { Colors } from "~/application/enums/shared/Colors";
import ColorBadge from "~/components/ui/badges/ColorBadge";
import EmptyState from "~/components/ui/emptyState/EmptyState";
import CheckEmptyCircle from "~/components/ui/icons/CheckEmptyCircleIcon";
import CheckFilledCircleIcon from "~/components/ui/icons/CheckFilledCircleIcon";
import PlusIcon from "~/components/ui/icons/PlusIcon";
import InputSelector from "~/components/ui/input/InputSelector";
import InputText from "~/components/ui/input/InputText";
import OpenModal from "~/components/ui/modals/OpenModal";
import useRouteUtils from "~/utils/data/useRouteUtils";
import RowHelper from "~/utils/helpers/RowHelper";
import { getColors } from "~/utils/shared/ColorUtils";
import { LoaderDataRowTags } from "../loaders/row-tags";

export default function RowTagsRoute() {
  const { t } = useTranslation();
  const submit = useSubmit();
  const navigate = useNavigate();
  const data = useLoaderData<LoaderDataRowTags>();
  const transition = useTransition();
  const { parentRoute } = useRouteUtils();
  // const isLoading = transition.state === "submitting" && ["edit-tag",
  // "set-tag", "delete-tag"].includes(transition.submission.formData.get("action")?.toString() ?? "");
  const isAdding = transition.state === "submitting" && transition.submission.formData.get("action") === "new-tag";

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!isAdding) {
      formRef.current?.reset();
    }
  }, [isAdding]);

  function onChangeTag(id: string, value: string, color: Colors) {
    const form = new FormData();
    form.set("action", "edit-tag");
    form.set("tag-id", id);
    form.set("tag-name", value);
    form.set("tag-color", color.toString());
    submit(form, {
      method: "post",
    });
  }

  function onSetRowTag(id: string, add: any) {
    const form = new FormData();
    form.set("action", "set-tag");
    form.set("tag-id", id);
    form.set("tag-action", add === true ? "add" : "remove");
    submit(form, {
      method: "post",
    });
  }

  // function onDeleteTag(id: string) {
  //   const form = new FormData();
  //   form.set("action", "delete-tag");
  //   form.set("tag-id", id);
  //   submit(form, {
  //     method: "post",
  //   });
  // }

  return (
    <div>
      <OpenModal className="sm:max-w-md" classNameOpacity="bg-opacity-50" onClose={() => navigate(parentRoute)}>
        <div className="space-y-2">
          <div className="flex justify-between">
            <h3 className="font-bold text-sm">{t("models.tag.plural")}</h3>
            <div className="text-gray-500 text-sm italic">{RowHelper.getRowFolio(data.entity, data.item)} </div>
          </div>
          <Form ref={formRef} method="post">
            <input hidden readOnly name="action" value="new-tag" />
            <div className="flex space-x-2">
              <InputText
                className="w-full"
                name="tag-name"
                title="New tag"
                withLabel={false}
                placeholder="New tag name..."
                autoComplete="off"
                required
                button={
                  <div className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5 ">
                    <kbd className="bg-white inline-flex items-center border border-gray-200 rounded px-1 text-sm font-sans font-medium text-gray-500">
                      <button type="submit">
                        <PlusIcon className="h-4 w-4" />
                      </button>
                    </kbd>
                  </div>
                }
              />
            </div>
          </Form>

          {data.tags.length === 0 && (
            <div>
              <EmptyState
                captions={{
                  thereAreNo: t("shared.noTags"),
                }}
              />
            </div>
          )}
          {data.tags.map((tag) => {
            return (
              <div key={tag.id} className="flex space-x-2">
                <InputSelector
                  className="w-full"
                  name="color"
                  title={t("models.group.color")}
                  withSearch={false}
                  withLabel={false}
                  value={tag.color}
                  setValue={(e) => onChangeTag(tag.id, tag.value, Number(e))}
                  options={
                    getColors().map((color) => {
                      return {
                        name: (
                          <div className="flex items-center space-x-2">
                            <ColorBadge color={color} />
                            <div>{t("app.shared.colors." + Colors[color])}</div>
                          </div>
                        ),
                        value: color,
                      };
                    }) ?? []
                  }
                ></InputSelector>
                <InputText
                  className="w-full"
                  name={"tag-name-" + tag.id}
                  title=""
                  withLabel={false}
                  value={tag.value}
                  setValue={(value) => onChangeTag(tag.id, value.toString(), tag.color)}
                />
                {/* <InputCheckbox
                  name={"tag-checked-" + tag.id}
                  title=""
                  value={data.item.tags.find((f) => f.tagId === tag.id) !== undefined}
                  setValue={(e) => onSetRowTag(tag.id, e)}
                /> */}
                <button
                  type="button"
                  onClick={() => onSetRowTag(tag.id, data.item.tags.filter((f) => f.tagId === tag.id).length === 0)}
                  className="text-gray-500 hover:text-gray-600 focus:outline-none"
                >
                  {data.item.tags.filter((f) => f.tagId === tag.id).length > 0 ? (
                    <CheckFilledCircleIcon className="h-7 w-7" />
                  ) : (
                    <CheckEmptyCircle className="h-7 w-7" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </OpenModal>
    </div>
  );
}
