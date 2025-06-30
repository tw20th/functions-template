export type FilterRule = {
  label: string;
  tags: string[];
  conditions: {
    field: string;
    operator: ">" | "<" | "==" | "contains";
    value: string | number;
  }[];
};
