import { Property } from "@prisma/client";
import { FiltersDto } from "~/application/dtos/data/FiltersDto";
import { RowFiltersDto } from "~/application/dtos/data/RowFiltersDto";
import { PropertyType } from "~/application/enums/entities/PropertyType";

const getRowFiltersCondition = (filters?: RowFiltersDto) => {
  let where = {};
  if (!filters) {
    return {};
  }
  const queryConditions: any[] = [];
  const filterConditions: any[] = [];

  if (filters.query) {
    filters.properties
      .filter((f) => isPropertyFilterable(f.property))
      ?.forEach((field) => {
        if (field.property) {
          if (field.property.isDynamic) {
            queryConditions.push(getFilterByDynamicProperty(field.property, filters.query, field.condition));
          } else {
            queryConditions.push(getFilterByHardCodedProperty(filters, field.property, filters.query, field.condition));
          }
        }
      });
  }

  filters.properties
    .filter((f) => f.value && isPropertyFilterable(f.property))
    ?.forEach((field) => {
      if (field.property) {
        if (field.property.isDynamic) {
          filterConditions.push(getFilterByDynamicProperty(field.property, field.value, field.condition));
        } else {
          filterConditions.push(getFilterByHardCodedProperty(filters, field.property, field.value, field.condition));
        }
      } else {
        if (field.name === "workflowState") {
          filterConditions.push({ workflowState: { name: { equals: field.value } } });
        } else if (field.name === "workflowStateId") {
          filterConditions.push({ workflowStateId: field.value });
        }
      }
    });

  let whereQuery = {};
  let whereFilters = {};
  let whereTags = {};
  if (queryConditions.length > 0) {
    whereQuery = {
      OR: [...queryConditions],
    };
  }
  if (filterConditions.length > 0) {
    whereFilters = {
      AND: [...filterConditions],
    };
  }
  if (filters.tags.length > 0) {
    whereTags = {
      tags: {
        some: {
          tag: {
            value: {
              in: filters.tags,
            },
          },
        },
      },
    };
  }

  const andConditions: any[] = [];
  if (queryConditions.length > 0) {
    andConditions.push(whereQuery);
  }
  if (filterConditions.length > 0) {
    andConditions.push(whereFilters);
  }
  if (filters.tags.length > 0) {
    andConditions.push(whereTags);
  }
  if (andConditions.length > 0) {
    where = {
      AND: andConditions,
    };
  }
  // console.log({ where: JSON.stringify(where) });
  return where;
};

function getFilterByHardCodedProperty(filters: RowFiltersDto, property: Property, value: string | null, condition: string | undefined) {
  if (value === null) {
    return {};
  }
  if (filters.customRow) {
    return {
      [filters.entity.name]: {
        [property.name]: { [condition ?? "contains"]: value },
      },
    };
  } else {
    return { [property.name]: { [condition ?? "contains"]: value } };
  }
}

function getFilterByDynamicProperty(property: Property, value: string | null, condition: string | undefined) {
  if (value === null) {
    return {};
  }
  return {
    values: {
      some: {
        propertyId: property.id,
        textValue: {
          [condition ?? "contains"]: value,
        },
      },
    },
  };
}

function isPropertyFilterable(property?: Property) {
  if (!property) {
    return true;
  }
  return property.type === PropertyType.TEXT || property.type === PropertyType.SELECT;
}

const getFiltersCondition = (filters?: FiltersDto) => {
  let where = {};
  if (!filters) {
    return {};
  }
  const queryConditions: any[] = [];
  const filterConditions: any[] = [];

  filters.properties
    ?.filter((f) => !f.manual)
    .forEach((field) => {
      if (filters.query && !field.isNumber) {
        queryConditions.push(getPropertyFilter(field.name, filters.query, field.condition, field.isNumber));
      }
    });

  filters.properties
    ?.filter((f) => !f.manual)
    .forEach((field) => {
      if (field.value) {
        filterConditions.push(getPropertyFilter(field.name, field.value, field.condition, field.isNumber));
      }
    });

  let whereQuery = {};
  let whereFilters = {};
  if (queryConditions.length > 0) {
    whereQuery = {
      OR: [...queryConditions],
    };
  }
  if (filterConditions.length > 0) {
    whereFilters = {
      AND: [...filterConditions],
    };
  }

  const andConditions: any[] = [];
  if (queryConditions.length > 0) {
    andConditions.push(whereQuery);
  }
  if (filterConditions.length > 0) {
    andConditions.push(whereFilters);
  }
  if (andConditions.length > 0) {
    where = {
      AND: andConditions,
    };
  }
  return where;
};

function getPropertyFilter(name: string, value: string, condition: string | undefined, isNumber: boolean | undefined) {
  if (isNumber) {
    return { [name]: { [condition ?? "contains"]: Number(value) } };
  }
  return { [name]: { [condition ?? "contains"]: value } };
}

export default {
  getRowFiltersCondition,
  getFiltersCondition,
  isPropertyFilterable,
};
