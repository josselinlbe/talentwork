import { TFunction } from "react-i18next";
import { PropertyAttributeName } from "~/application/enums/entities/PropertyAttributeName";
import { PropertyType } from "~/application/enums/entities/PropertyType";
import { PropertyWithDetails } from "../db/entities/entities.db.server";

function getAttributesByType(type: PropertyType, attributes?: { name: string; value: string | undefined }[]): PropertyAttributeName[] {
  const commonAttributes = [PropertyAttributeName.HintText, PropertyAttributeName.HelpText, PropertyAttributeName.Icon];
  switch (type) {
    case PropertyType.TEXT:
      const editor = attributes?.find((f) => f.name === PropertyAttributeName.Editor);
      if (editor?.value === "monaco") {
        return [PropertyAttributeName.Editor, PropertyAttributeName.EditorLanguage];
      }
      return [
        ...commonAttributes,
        PropertyAttributeName.DefaultValue,
        PropertyAttributeName.Placeholder,
        PropertyAttributeName.Min,
        PropertyAttributeName.Max,
        PropertyAttributeName.Rows,
        PropertyAttributeName.Pattern,
        PropertyAttributeName.Uppercase,
        PropertyAttributeName.Lowercase,
        PropertyAttributeName.Editor,
      ];
    case PropertyType.NUMBER:
      return [
        ...commonAttributes,
        PropertyAttributeName.DefaultValue,
        PropertyAttributeName.Placeholder,
        PropertyAttributeName.Min,
        PropertyAttributeName.Max,
        PropertyAttributeName.Step,
      ];
    case PropertyType.DATE:
      return [...commonAttributes];
    case PropertyType.SELECT:
      return [...commonAttributes, PropertyAttributeName.DefaultValue, PropertyAttributeName.Placeholder];
    case PropertyType.BOOLEAN:
      return [...commonAttributes, PropertyAttributeName.DefaultValue];
    case PropertyType.MEDIA:
      return [...commonAttributes, PropertyAttributeName.Min, PropertyAttributeName.Max, PropertyAttributeName.AcceptFileTypes, PropertyAttributeName.MaxSize];
    default:
      return [];
  }
}

function getAttributeTitle(t: TFunction, name: PropertyAttributeName) {
  switch (name) {
    case PropertyAttributeName.HintText:
      return t("models.propertyAttribute.hintText");
    case PropertyAttributeName.HelpText:
      return t("models.propertyAttribute.helpText");
    case PropertyAttributeName.Icon:
      return t("models.propertyAttribute.icon");
    case PropertyAttributeName.Pattern:
      return t("models.propertyAttribute.pattern");
    case PropertyAttributeName.Min:
      return t("models.propertyAttribute.min");
    case PropertyAttributeName.Max:
      return t("models.propertyAttribute.max");
    case PropertyAttributeName.Step:
      return t("models.propertyAttribute.step");
    case PropertyAttributeName.Rows:
      return t("models.propertyAttribute.rows");
    case PropertyAttributeName.DefaultValue:
      return t("models.propertyAttribute.defaultValue");
    case PropertyAttributeName.Uppercase:
      return t("models.propertyAttribute.uppercase");
    case PropertyAttributeName.Lowercase:
      return t("models.propertyAttribute.lowercase");
    case PropertyAttributeName.Placeholder:
      return t("models.propertyAttribute.placeholder");
    case PropertyAttributeName.AcceptFileTypes:
      return t("models.propertyAttribute.acceptFileTypes");
    case PropertyAttributeName.MaxSize:
      return t("models.propertyAttribute.maxSize");
    case PropertyAttributeName.Editor:
      return t("models.propertyAttribute.editor");
    case PropertyAttributeName.EditorLanguage:
      return t("models.propertyAttribute.editorLanguage");
    default:
      return "Unknown";
  }
}

function getPropertyAttributeValue(property: PropertyWithDetails, name: PropertyAttributeName) {
  const attribute = property.attributes.find((a) => a.name === name);
  if (attribute) {
    return attribute.value;
  }
  return undefined;
}

function getPropertyAttributeValue_String(property: PropertyWithDetails, name: PropertyAttributeName) {
  return getPropertyAttributeValue(property, name);
}

function getPropertyAttributeValue_Number(property: PropertyWithDetails, name: PropertyAttributeName) {
  const value = getPropertyAttributeValue(property, name);
  if (value) {
    return Number(value);
  }
  return undefined;
}

function getPropertyAttributeValue_Boolean(property: PropertyWithDetails, name: PropertyAttributeName) {
  const value = getPropertyAttributeValue(property, name);
  if (value) {
    return value === "true";
  }
  return undefined;
}

function getPropertyAttributeOptions(name: PropertyAttributeName) {
  if (name === PropertyAttributeName.Editor) {
    return [{ name: "Monaco", value: "monaco" }];
  } else if (name === PropertyAttributeName.EditorLanguage) {
    return [
      { name: "Markdown", value: "markdown" },
      { name: "TypeScript", value: "typescript" },
      { name: "JavaScript", value: "javascript" },
      { name: "HTML", value: "html" },
      { name: "CSS", value: "css" },
    ];
  }
  return [];
}

export default {
  getAttributesByType,
  getAttributeTitle,
  getPropertyAttributeValue_String,
  getPropertyAttributeValue_Number,
  getPropertyAttributeValue_Boolean,
  getPropertyAttributeOptions,
};
