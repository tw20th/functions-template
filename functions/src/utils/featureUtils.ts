export const extractFeatures = (item: Record<string, unknown>): string[] => {
  const features: string[] = [];

  if (item.capacity) features.push(`容量：${item.capacity}mAh`);
  if (item.outputPower) features.push(`出力：${item.outputPower}W`);
  if (item.hasTypeC) features.push("Type-C対応");

  return features;
};
