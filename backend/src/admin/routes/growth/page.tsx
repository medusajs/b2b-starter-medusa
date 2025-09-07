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
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  // Detect dark mode
  useEffect(() => {
    const detectDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark') || 
                    window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(isDark);
    };

    detectDarkMode();
    
    // Listen for theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', detectDarkMode);
    
    // Listen for class changes on document element
    const observer = new MutationObserver(detectDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => {
      mediaQuery.removeEventListener('change', detectDarkMode);
      observer.disconnect();
    };
  }, []);

  // Check authorization on component mount
  useEffect(() => {
    const checkAuthorization = async () => {
      try {
        const response = await fetch('/admin/growth-auth-check', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setIsAuthorized(data.authorized);
        } else {
          setIsAuthorized(false);
        }
      } catch (error) {
        console.error('Error checking authorization:', error);
        setIsAuthorized(false);
      }
    };

    checkAuthorization();
  }, []);

  // Get theme-aware colors
  const getThemeColors = () => {
    if (isDarkMode) {
      return {
        text: '#e5e7eb', // light gray
        textSecondary: '#9ca3af', // medium gray
        grid: '#374151', // dark gray
        border: '#4b5563', // medium dark gray
        background: '#1f2937', // dark background
        tooltipBg: '#1f2937', // dark tooltip background
        tooltipBorder: '#4b5563' // dark tooltip border
      };
    } else {
      return {
        text: '#111827', // dark gray
        textSecondary: '#6b7280', // medium gray
        grid: '#e5e7eb', // light gray
        border: '#d1d5db', // light border
        background: '#ffffff', // white background
        tooltipBg: '#ffffff', // white tooltip background
        tooltipBorder: '#d1d5db' // light tooltip border
      };
    }
  };

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

  // Show loading state while checking authorization
  if (isAuthorized === null) {
    return (
      <Container>
        <div className="flex flex-col gap-y-4">
          <Heading level="h1">Growth Analytics</Heading>
          <div className="flex items-center justify-center h-64">
            <div className="text-ui-fg-subtle">Checking authorization...</div>
          </div>
        </div>
      </Container>
    );
  }

  // Show unauthorized message if user is not authorized
  if (isAuthorized === false) {
    return (
      <Container>
        <div className="flex flex-col gap-y-4">
          <Heading level="h1">Growth Analytics</Heading>
          <div className="flex flex-col items-center justify-center h-64 bg-ui-bg-base rounded-lg border border-ui-border-base">
            <div className="text-center">
              <div className="text-2xl font-semibold text-ui-fg-base mb-2">
                Access Denied
              </div>
              <div className="text-ui-fg-subtle">
                You are not authorized to view this page
              </div>
            </div>
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
        <div className="flex flex-row gap-4 mb-8 overflow-x-auto scrollbar-thin scrollbar-thumb-ui-border-strong scrollbar-track-ui-bg-subtle">
          {TILE_CONFIG.map((tile) => {
            const t = tileData?.[tile.key];
            return (
              <div
                key={tile.key}
                className="min-w-[220px] rounded-lg border border-ui-border-base bg-ui-bg-base px-6 py-4 flex flex-col gap-1 shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs text-ui-fg-subtle font-medium">{tile.label}</div>
                  <span className={`text-xs font-semibold ${t?.percentageChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>↗ {formatPercent(t?.percentageChange ?? 0)}</span>
                </div>
                <span className="text-2xl font-bold">{formatCurrency(t?.current ?? 0)}</span>
                <div className="text-xs text-ui-fg-muted">vs {formatCurrency(t?.previous ?? 0)}</div>
              </div>
            );
          })}
        </div>

        {/* Time Frame Selection and Chart */}
        <div className="flex flex-col gap-4 mb-8 bg-ui-bg-base p-6 rounded-lg shadow-sm border border-ui-border-base">
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
          <div className="bg-ui-bg-subtle rounded-lg p-6 border border-ui-border-base h-[400px]">
            <div className="font-semibold text-center mb-2 text-ui-fg-base">Revenue Over Time</div>
            {isLoading ? (
              <div className="h-full flex items-center justify-center text-ui-fg-subtle">Loading...</div>
            ) : error ? (
              <div className="h-full flex items-center justify-center text-ui-fg-error">{error}</div>
            ) : chartData && LineChart ? (
              <LineChart
                key={`chart-${isDarkMode}`}
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  backgroundColor: 'transparent',
                  plugins: {
                    legend: { display: false },
                    title: { display: false },
                    tooltip: {
                      backgroundColor: getThemeColors().tooltipBg,
                      titleColor: getThemeColors().text,
                      bodyColor: getThemeColors().text,
                      borderColor: getThemeColors().tooltipBorder,
                      borderWidth: 1,
                      cornerRadius: 8,
                      displayColors: true,
                      usePointStyle: true,
                      padding: 12,
                      titleFont: {
                        size: 13,
                        weight: '600'
                      },
                      bodyFont: {
                        size: 12
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Revenue (CAD)',
                        color: getThemeColors().text,
                        font: {
                          size: 13,
                          weight: '600'
                        }
                      },
                      ticks: {
                        color: getThemeColors().textSecondary,
                        font: {
                          size: 11
                        },
                        padding: 8,
                        callback: function(value) {
                          return value.toLocaleString();
                        }
                      },
                      grid: {
                        color: getThemeColors().grid,
                        drawBorder: false
                      },
                      border: {
                        color: getThemeColors().border
                      }
                    },
                    x: {
                      title: {
                        display: true,
                        text: '',
                        color: getThemeColors().text,
                        font: {
                          size: 13,
                          weight: '600'
                        }
                      },
                      ticks: {
                        color: getThemeColors().textSecondary,
                        font: {
                          size: 11
                        },
                        padding: 8,
                        maxRotation: 45
                      },
                      grid: {
                        color: getThemeColors().grid,
                        drawBorder: false
                      },
                      border: {
                        color: getThemeColors().border
                      }
                    },
                  },
                }}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-ui-fg-muted">No data</div>
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