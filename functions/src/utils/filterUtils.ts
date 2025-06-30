type Rule = {
  label: string;
  conditions: {
    field: string;
    operator: ">" | "<" | "==" | "contains";
    value: number | string;
  }[];
  tags: string[];
};

export const applyFilterRules = (
  item: Record<string, any>,
  rules: Rule[]
): Rule | null => {
  for (const rule of rules) {
    const passed = rule.conditions.every((cond) => {
      const val = item[cond.field];
      if (val === undefined) return false;

      switch (cond.operator) {
        case ">":
          return val > cond.value;
        case "<":
          return val < cond.value;
        case "==":
          return val === cond.value;
        case "contains":
          return typeof val === "string" && val.includes(String(cond.value));
        default:
          return false;
      }
    });

    if (passed) return rule;
  }
  return null;
};
