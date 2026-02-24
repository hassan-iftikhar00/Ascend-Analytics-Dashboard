import { ResponsivePie } from "@nivo/pie";
import { nivoTheme } from "../../config/chartTheme";

export default function DonutChart({
  data,
  colors,
  innerRadius = 0.55,
  padAngle = 1,
  cornerRadius = 4,
  enableArcLabels = true,
  enableArcLinkLabels = true,
  margin = { top: 20, right: 80, bottom: 20, left: 80 },
  valueFormat,
  ...rest
}) {
  return (
    <ResponsivePie
      data={data}
      theme={nivoTheme}
      margin={margin}
      innerRadius={innerRadius}
      padAngle={padAngle}
      cornerRadius={cornerRadius}
      colors={colors || { scheme: "category10" }}
      borderWidth={1}
      borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
      enableArcLabels={enableArcLabels}
      arcLabelsSkipAngle={10}
      arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
      enableArcLinkLabels={enableArcLinkLabels}
      arcLinkLabelsSkipAngle={10}
      arcLinkLabelsTextColor="#6b7280"
      arcLinkLabelsThickness={1}
      arcLinkLabelsColor={{ from: "color" }}
      valueFormat={valueFormat}
      animate
      motionConfig="gentle"
      {...rest}
    />
  );
}
