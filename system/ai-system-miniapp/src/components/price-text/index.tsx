import { View, Text } from "@tarojs/components";

export function PriceText({
  price = 0,
  color = "text-red-500",
}: {
  price: number | string;
  color?: string;
}) {
  let priceText = Number(price).toFixed(2).toString();
  let priceArray = priceText.split(".");

  return (
    <View className="flex items-baseline">
      <Text className={`text-sm font-bold ${color}`}>¥</Text>
      <Text className={`text-2xl font-bold ${color}`}>{priceArray[0]}</Text>
      <Text className={`text-sm ${color}`}>.{priceArray[1]}</Text>
    </View>
  );
}
