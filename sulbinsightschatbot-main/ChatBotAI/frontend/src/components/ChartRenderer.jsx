import Plot from "react-plotly.js";

export default function ChartRenderer({ chartData }) {
  if (!chartData || !chartData.data) return null;

  return (
    <div className="w-full mt-4">
      <Plot
        data={chartData.data}
        layout={chartData.layout}
        style={{ width: "100%", height: "100%" }}
        config={{ responsive: true }}
      />
    </div>
  );
}