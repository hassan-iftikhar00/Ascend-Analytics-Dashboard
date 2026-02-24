import { ResponsiveBoxPlot } from "@nivo/boxplot";
import { nivoTheme } from "../../config/chartTheme";

export default function BoxPlotChart({
  data,
  quantiles = [0.1, 0.25, 0.5, 0.75, 0.9],
  colors,
  xLabel = "",
  yLabel = "",
  margin = { top: 20, right: 24, bottom: 50, left: 52 },
  ...rest
}) {
  return (
    <ResponsiveBoxPlot
      data={data}
      theme={nivoTheme}
      margin={margin}
      quantiles={quantiles}
      padding={0.3}
      colors={colors || { scheme: "category10" }}
      borderRadius={2}
      borderWidth={1}
      borderColor={{ from: "color", modifiers: [["darker", 0.3]] }}
      medianWidth={3}
      medianColor={{ from: "color", modifiers: [["darker", 0.5]] }}
      whiskerWidth={2}
      whiskerEndSize={0.5}
      axisBottom={{
        tickSize: 4,
        tickPadding: 8,
        legend: xLabel,
        legendPosition: "middle",
        legendOffset: 40,
      }}
      axisLeft={{
        tickSize: 4,
        tickPadding: 8,
        legend: yLabel,
        legendPosition: "middle",
        legendOffset: -44,
      }}
      animate
      motionConfig="gentle"
      {...rest}
    />
  );
}
