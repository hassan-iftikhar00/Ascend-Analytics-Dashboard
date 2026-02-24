import { ResponsiveHeatMap } from "@nivo/heatmap";
import { nivoTheme } from "../../config/chartTheme";

export default function HeatmapChart({
  data,
  colors = { type: "sequential", scheme: "blues" },
  xLabel = "",
  yLabel = "",
  valueFormat,
  margin = { top: 40, right: 24, bottom: 50, left: 80 },
  ...rest
}) {
  return (
    <ResponsiveHeatMap
      data={data}
      theme={nivoTheme}
      margin={margin}
      colors={colors}
      emptyColor="#f3f4f6"
      borderRadius={3}
      borderWidth={1}
      borderColor="#ffffff"
      axisTop={{
        tickSize: 4,
        tickPadding: 8,
        legend: xLabel,
        legendPosition: "middle",
        legendOffset: -32,
      }}
      axisLeft={{
        tickSize: 0,
        tickPadding: 8,
        legend: yLabel,
        legendPosition: "middle",
        legendOffset: -70,
      }}
      axisBottom={null}
      labelTextColor={{ from: "color", modifiers: [["darker", 3]] }}
      hoverTarget="cell"
      animate
      motionConfig="gentle"
      valueFormat={valueFormat}
      {...rest}
    />
  );
}
