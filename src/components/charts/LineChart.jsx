import { ResponsiveLine } from "@nivo/line";
import { nivoTheme } from "../../config/chartTheme";

export default function LineChart({
  data,
  xLabel = "",
  yLabel = "",
  enableArea = false,
  curve = "monotoneX",
  colors,
  enablePoints = true,
  yFormat,
  axisBottomTickRotation = 0,
  margin = { top: 20, right: 24, bottom: 50, left: 52 },
  ...rest
}) {
  return (
    <ResponsiveLine
      data={data}
      theme={nivoTheme}
      margin={margin}
      xScale={{ type: "point" }}
      yScale={{ type: "linear", min: "auto", max: "auto", stacked: false }}
      curve={curve}
      axisBottom={{
        tickSize: 4,
        tickPadding: 8,
        tickRotation: axisBottomTickRotation,
        legend: xLabel,
        legendOffset: 40,
        legendPosition: "middle",
      }}
      axisLeft={{
        tickSize: 4,
        tickPadding: 8,
        legend: yLabel,
        legendOffset: -44,
        legendPosition: "middle",
        format: yFormat,
      }}
      enableArea={enableArea}
      areaOpacity={0.08}
      colors={colors || { scheme: "category10" }}
      pointSize={enablePoints ? 6 : 0}
      pointColor={{ theme: "background" }}
      pointBorderWidth={2}
      pointBorderColor={{ from: "serieColor" }}
      useMesh
      enableSlices="x"
      animate
      motionConfig="gentle"
      {...rest}
    />
  );
}
