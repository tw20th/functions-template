import type { ItemFilterRule } from "../types/itemFilterRule";

// 🔑 条件演算子の型も拡張
type Operator = ">" | ">=" | "<" | "<=" | "==" | "!=" | "contains";

export const applyFilterRules = (
  item: Record<string, unknown>,
  rules: ItemFilterRule[]
): ItemFilterRule | null => {
  for (const rule of rules) {
    const passed = rule.conditions.every(cond => {
      const val = item[cond.field];

      // null or undefined を除外
      if (val === undefined || val === null) return false;

      switch (cond.operator as Operator) {
        case ">":
          return typeof val === "number" && typeof cond.value === "number" && val > cond.value;
        case ">=":
          return typeof val === "number" && typeof cond.value === "number" && val >= cond.value;
        case "<":
          return typeof val === "number" && typeof cond.value === "number" && val < cond.value;
        case "<=":
          return typeof val === "number" && typeof cond.value === "number" && val <= cond.value;
        case "==":
          return val === cond.value;
        case "!=":
          return val !== cond.value;
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
