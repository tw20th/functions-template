"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyFilterRules = void 0;
const applyFilterRules = (item, rules) => {
    for (const rule of rules) {
        const passed = rule.conditions.every(cond => {
            const val = item[cond.field];
            // null or undefined を除外
            if (val === undefined || val === null)
                return false;
            switch (cond.operator) {
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
        if (passed)
            return rule;
    }
    return null;
};
exports.applyFilterRules = applyFilterRules;
//# sourceMappingURL=filterUtils.js.map