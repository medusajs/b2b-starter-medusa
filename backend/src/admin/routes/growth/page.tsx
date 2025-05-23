import { defineRouteConfig } from "@medusajs/admin-sdk";
import React, { useEffect, useState } from "react";
import { Container, Heading, Select, DatePicker } from "@medusajs/ui";

type TimeFrame = "day" | "week" | "month" | "year" | "custom";

const GrowthPage = () => {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("week");
  const [customDateRange, setCustomDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [chartData, setChartData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [tileData, setTileData] = useState<any>({
    oneWeek: null,
    oneMonth: null,
    threeMonths: null,
    sixMonths: null,
    oneYear: null
  });
  const [LineChart, setLineChart] = useState<any>(null);

  useEffect(() => {
    const loadChartComponents = async () => {
      try {
        const [{ Line }, { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend }] = await Promise.all([
          import('react-chartjs-2'),
          import('chart.js')
        ]);
        Chart.register(
          CategoryScale,
          LinearScale,
          PointElement,
          LineElement,
          Title,
          Tooltip,
          Legend
        );
        setLineChart(Line);
      } catch (error) {
        console.error('Failed to load chart components:', error);
      }
    };
    loadChartComponents();
  }, []);

  const fetchChartData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let startDate = new Date();
      let endDate = new Date();

      // Calculate date range based on selected time frame
      switch (timeFrame) {
        case "day":
          startDate.setDate(startDate.getDate() - 1);
          break;
        case "week":
          startDate.setDate(startDate.getDate() - 7);
          break;
        case "month":
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case "year":
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        case "custom":
          if (customDateRange.from && customDateRange.to) {
            startDate = customDateRange.from;
            endDate = customDateRange.to;
          } else {
            return;
          }
          break;
      }

      const res = await fetch(
        `/admin/growth-analytics?start_date=${startDate.toISOString()}&end_date=${endDate.toISOString()}`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch growth analytics");
      const data = await res.json();
      setChartData({
        labels: data.labels,
        datasets: [
          {
            label: 'Revenue Over Time',
            data: data.payments,
            borderColor: '#2563eb',
            backgroundColor: '#2563eb20',
            tension: 0.4,
            fill: true,
            pointRadius: 4,
            pointBackgroundColor: '#2563eb',
          },
        ],
      });
      setTileData(data.tileData);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when time frame or custom date range changes
  useEffect(() => {
    fetchChartData();
  }, [timeFrame, customDateRange]);

  const handleDateChange = (date: Date | null, field: 'from' | 'to') => {
    setCustomDateRange(prev => ({
      ...prev,
      [field]: date || undefined
    }));
  };

  // Helper for formatting currency
  const formatCurrency = (value: number) =>
    value?.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }) ?? '$0.00';
  const formatPercent = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;

  // Tile config for mapping
  const TILE_CONFIG = [
    { key: 'oneWeek', label: '1 Week' },
    { key: 'oneMonth', label: '1 Month' },
    { key: 'threeMonths', label: '3 Months' },
    { key: 'sixMonths', label: '6 Months' },
    { key: 'oneYear', label: '1 Year' },
  ];

  if (error) {
    return (
      <Container>
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="text-center">
            <Heading level="h1" className="text-2xl font-bold mb-4 text-red-600">
              {error}
            </Heading>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="flex flex-col gap-y-4">
        <Heading level="h1">Growth Analytics</Heading>

        {/* Metric Tiles */}
        <div className="flex flex-row gap-4 mb-8 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {TILE_CONFIG.map((tile) => {
            const t = tileData?.[tile.key];
            return (
              <div
                key={tile.key}
                className="min-w-[220px] rounded-lg border border-gray-200 bg-white px-6 py-4 flex flex-col gap-1 shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs text-gray-500 font-medium">{tile.label}</div>
                  <span className={`text-xs font-semibold ${t?.percentageChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>↗ {formatPercent(t?.percentageChange ?? 0)}</span>
                </div>
                <span className="text-2xl font-bold">{formatCurrency(t?.current ?? 0)}</span>
                <div className="text-xs text-gray-400">vs {formatCurrency(t?.previous ?? 0)}</div>
              </div>
            );
          })}
        </div>

        {/* Time Frame Selection and Chart */}
        <div className="flex flex-col gap-4 mb-8 bg-white p-6 rounded-lg shadow-sm">
          <Heading level="h2" className="text-xl">Time Frame</Heading>
          <div className="flex flex-col gap-4">
            <Select
              value={timeFrame}
              onValueChange={(value: string) => setTimeFrame(value as TimeFrame)}
            >
              <Select.Trigger>
                <Select.Value placeholder="Select time frame">
                  {timeFrame === "day" ? "Last 24 Hours" :
                   timeFrame === "week" ? "Past Week" :
                   timeFrame === "month" ? "Past Month" :
                   timeFrame === "year" ? "Past Year" : "Custom Range"}
                </Select.Value>
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="day">Last 24 Hours</Select.Item>
                <Select.Item value="week">Past Week</Select.Item>
                <Select.Item value="month">Past Month</Select.Item>
                <Select.Item value="year">Past Year</Select.Item>
                <Select.Item value="custom">Custom Range</Select.Item>
              </Select.Content>
            </Select>
            {timeFrame === "custom" && (
              <div className="flex gap-4">
                <DatePicker
                  value={customDateRange.from}
                  onChange={(date) => handleDateChange(date, 'from')}
                />
                <DatePicker
                  value={customDateRange.to}
                  onChange={(date) => handleDateChange(date, 'to')}
                />
              </div>
            )}
          </div>
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 h-[400px]">
            <div className="font-semibold text-center mb-2">Revenue Over Time</div>
            {isLoading ? (
              <div className="h-full flex items-center justify-center text-gray-500">Loading...</div>
            ) : error ? (
              <div className="h-full flex items-center justify-center text-red-500">{error}</div>
            ) : chartData && LineChart ? (
              <LineChart
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    title: { display: false },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Revenue (USD)',
                      },
                      ticks: {
                        callback: function(value) {
                          return value.toLocaleString();
                        }
                      }
                    },
                    x: {
                      title: {
                        display: true,
                        text: '',
                      },
                    },
                  },
                }}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">No data</div>
            )}
          </div>
        </div>
      </div>
    </Container>
  );
};

export const config = defineRouteConfig({
  label: "Growth",
});

export default GrowthPage; 