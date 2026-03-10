import { useSafeArea } from "@/hooks/use-app";
import { View } from "@tarojs/components";

export function BottomSafeView() {
  const safeArea = useSafeArea();
  return <View style={{ height: safeArea.bottom }} />;
}
