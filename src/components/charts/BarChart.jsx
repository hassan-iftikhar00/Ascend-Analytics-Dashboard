import { ResponsiveBar } from "@nivo/bar";
import { nivoTheme } from "../../config/chartTheme";

export default function BarChart({
  data,
  keys,
  indexBy = "label",
  layout = "vertical",
  groupMode = "grouped",
  colors,
  xLabel = "",
  yLabel = "",
  valueFormat,
  enableLabel = false,
  margin = { top: 20, right: 24, bottom: 50, left: 52 },
  axisBottomTickRotation = 0,
  ...rest
}) {
  return (
    <ResponsiveBar
      data={data}
      keys={keys}
      indexBy={indexBy}
      theme={nivoTheme}
      margin={margin}
      layout={layout}
      groupMode={groupMode}
      padding={0.3}
      valueScale={{ type: "linear" }}
      indexScale={{ type: "band", round: true }}
      colors={colors || { scheme: "category10" }}
      borderRadius={3}
      axisBottom={{
        tickSize: 4,
        tickPadding: 8,
        tickRotation: axisBottomTickRotation,
        legend: layout === "vertical" ? xLabel : yLabel,
        legendPosition: "middle",
        legendOffset: 40,
      }}
      axisLeft={{
        tickSize: 4,
        tickPadding: 8,
        legend: layout === "vertical" ? yLabel : xLabel,
        legendPosition: "middle",
        legendOffset: -44,
        format: valueFormat,
      }}
      enableLabel={enableLabel}
      labelSkipWidth={12}
      labelSkipHeight={12}
      animate
      motionConfig="gentle"
      {...rest}
    />
  );
}
