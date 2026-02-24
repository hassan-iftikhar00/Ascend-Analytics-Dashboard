import { ResponsiveBar } from "@nivo/bar";
import { nivoTheme } from "../../config/chartTheme";

export default function StackedBarChart({
  data,
  keys,
  indexBy = "label",
  layout = "vertical",
  colors,
  xLabel = "",
  yLabel = "",
  enableLabel = true,
  margin = { top: 20, right: 120, bottom: 50, left: 52 },
  axisBottomTickRotation = 0,
  legendAnchor = "bottom-right",
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
      groupMode="stacked"
      padding={0.3}
      valueScale={{ type: "linear" }}
      indexScale={{ type: "band", round: true }}
      colors={colors || { scheme: "category10" }}
      borderRadius={2}
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
      }}
      enableLabel={enableLabel}
      labelSkipWidth={12}
      labelSkipHeight={12}
      legends={[
        {
          dataFrom: "keys",
          anchor: legendAnchor,
          direction: "column",
          translateX: 110,
          itemWidth: 100,
          itemHeight: 18,
          itemTextColor: "#6b7280",
          symbolSize: 10,
          symbolShape: "circle",
        },
      ]}
      animate
      motionConfig="gentle"
      {...rest}
    />
  );
}
