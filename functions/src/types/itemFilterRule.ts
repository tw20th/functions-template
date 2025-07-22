export type FilterCondition = {
  field: string;
  operator: "==" | "!=" | ">" | ">=" | "<" | "<=";
  value: number | string | boolean;
};

export type ItemFilterRule = {
  label: string;
  conditions: FilterCondition[];
  tags?: string[];
};
