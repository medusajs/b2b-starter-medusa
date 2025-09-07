import { defineRouteConfig } from "@medusajs/admin-sdk";
import React, { useEffect, useState } from "react";
import { sdk } from "../../lib/client";
import { Input, Button, Select, Container, Heading, Switch, StatusBadge, DatePicker } from "@medusajs/ui";
import { AdminCustomer } from "@medusajs/types";
import { ChartBar, ArrowUpRightMini } from "@medusajs/icons";

// Remove static imports for chart.js and react-chartjs-2
// We'll use dynamic imports instead

type TimeFrame = "day" | "week" | "month" | "year" | "custom";

const CustomerAnalyticsPage = () => {
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
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isApproved, setIsApproved] = useState(false);
  const [LineChart, setLineChart] = useState<any>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

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

  // Load chart components dynamically
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

  // Filter customers based on search query
  const filteredCustomers = customers.filter(customer => 
    customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    `${customer.first_name} ${customer.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Fetch customers on component mount
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await sdk.admin.customer.list();
        setCustomers(response.customers || []);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };
    fetchCustomers();
  }, []);

  // Add effect to update approval state when customer changes
  useEffect(() => {
    if (selectedCustomer) {
      const customer = customers.find(c => c.id === selectedCustomer);
      if (customer?.metadata) {
        setIsApproved(Boolean(customer.metadata.approved));
      }
    }
  }, [selectedCustomer, customers]);

  const fetchChartData = async () => {
    if (!selectedCustomer) return;

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

      const response = await fetch(
        `/admin/customer-analytics?start_date=${startDate.toISOString()}&end_date=${endDate.toISOString()}&customer_id=${selectedCustomer}`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch data");
      }

      setChartData({
        labels: data.labels,
        datasets: [
          {
            label: "Total Spent: $",
            data: data.payments,
            borderColor: "#2563eb",
            backgroundColor: "#2563eb20",
            tension: 0.4,
            fill: true,
          },
        ],
      });

      setTileData(data.tileData);
    } catch (error) {
      console.error("Error fetching chart data:", error);
      setError(error.message || "Failed to fetch chart data");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when time frame, custom date range, or selected customer changes
  useEffect(() => {
    if (selectedCustomer) {
      fetchChartData();
    }
  }, [timeFrame, customDateRange, selectedCustomer]);

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(value);
  };

  const handleApprovalToggle = async (checked: boolean) => {
    if (!selectedCustomer) return;
    setIsApproved(checked);

    try {
      const customer = customers.find(c => c.id === selectedCustomer);
      await sdk.admin.customer.update(selectedCustomer, {
        metadata: { 
          ...customer?.metadata, 
          approved: checked
        },
      });
    } catch (error) {
      console.error("Failed to update customer:", error);
    }
  };

  const handleDateChange = (date: Date | null, field: 'from' | 'to') => {
    setCustomDateRange(prev => ({
      ...prev,
      [field]: date || undefined
    }));
  };

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
        <Heading level="h1">Customer Analytics</Heading>

        {/* Customer Selection */}
        <div className="flex flex-col gap-4 mb-8 bg-ui-bg-base p-6 rounded-lg shadow-sm border border-ui-border-base">
          <Heading level="h2" className="text-xl">Select Customer</Heading>
          <div className="flex-1">
            <div className="relative">
              <Input
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="mt-2 max-h-60 overflow-y-auto border border-ui-border-base rounded-md bg-ui-bg-subtle">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    className={`px-4 py-2 cursor-pointer hover:bg-ui-bg-base-hover transition-colors ${
                      selectedCustomer === customer.id ? 'bg-ui-bg-highlight' : ''
                    }`}
                    onClick={() => setSelectedCustomer(customer.id)}
                  >
                    <div className="font-medium">{customer.email}</div>
                    <div className="text-sm text-ui-fg-subtle">
                      {customer.first_name} {customer.last_name}
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-2 text-ui-fg-subtle text-center">
                  No customers found
                </div>
              )}
            </div>
            {selectedCustomer && (
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">Approval Status</h3>
                <div className="flex items-center">
                  <Switch checked={isApproved} onCheckedChange={handleApprovalToggle} />
                  <StatusBadge className="ml-2" color={isApproved ? "green" : "red"}>
                    {isApproved ? "Approved" : "Not Approved"}
                  </StatusBadge>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Spending Metrics Cards */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          {/* 1 Week Change */}
          <div className="bg-ui-bg-base p-5 rounded-lg shadow-sm border border-ui-border-base hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-ui-fg-subtle">1 Week</h3>
              {tileData?.oneWeek && (
                <div className={`flex items-center ${tileData.oneWeek.percentageChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <ArrowUpRightMini className={`w-4 h-4 ${tileData.oneWeek.percentageChange < 0 ? 'rotate-180' : ''}`} />
                  <span className="ml-1 text-sm font-medium">{formatPercentage(tileData.oneWeek.percentageChange)}</span>
                </div>
              )}
            </div>
            <div className="text-2xl font-bold mb-1">
              {tileData?.oneWeek ? formatCurrency(tileData.oneWeek.current) : '...'}
            </div>
            <div className="text-sm text-ui-fg-subtle">
              vs {tileData?.oneWeek ? formatCurrency(tileData.oneWeek.previous) : '...'}
            </div>
          </div>

          {/* 1 Month Change */}
          <div className="bg-ui-bg-base p-5 rounded-lg shadow-sm border border-ui-border-base hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-ui-fg-subtle">1 Month</h3>
              {tileData?.oneMonth && (
                <div className={`flex items-center ${tileData.oneMonth.percentageChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <ArrowUpRightMini className={`w-4 h-4 ${tileData.oneMonth.percentageChange < 0 ? 'rotate-180' : ''}`} />
                  <span className="ml-1 text-sm font-medium">{formatPercentage(tileData.oneMonth.percentageChange)}</span>
                </div>
              )}
            </div>
            <div className="text-2xl font-bold mb-1">
              {tileData?.oneMonth ? formatCurrency(tileData.oneMonth.current) : '...'}
            </div>
            <div className="text-sm text-ui-fg-subtle">
              vs {tileData?.oneMonth ? formatCurrency(tileData.oneMonth.previous) : '...'}
            </div>
          </div>

          {/* 3 Months Change */}
          <div className="bg-ui-bg-base p-5 rounded-lg shadow-sm border border-ui-border-base hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-ui-fg-subtle">3 Months</h3>
              {tileData?.threeMonths && (
                <div className={`flex items-center ${tileData.threeMonths.percentageChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <ArrowUpRightMini className={`w-4 h-4 ${tileData.threeMonths.percentageChange < 0 ? 'rotate-180' : ''}`} />
                  <span className="ml-1 text-sm font-medium">{formatPercentage(tileData.threeMonths.percentageChange)}</span>
                </div>
              )}
            </div>
            <div className="text-2xl font-bold mb-1">
              {tileData?.threeMonths ? formatCurrency(tileData.threeMonths.current) : '...'}
            </div>
            <div className="text-sm text-ui-fg-subtle">
              vs {tileData?.threeMonths ? formatCurrency(tileData.threeMonths.previous) : '...'}
            </div>
          </div>

          {/* 6 Months Change */}
          <div className="bg-ui-bg-base p-5 rounded-lg shadow-sm border border-ui-border-base hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-ui-fg-subtle">6 Months</h3>
              {tileData?.sixMonths && (
                <div className={`flex items-center ${tileData.sixMonths.percentageChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <ArrowUpRightMini className={`w-4 h-4 ${tileData.sixMonths.percentageChange < 0 ? 'rotate-180' : ''}`} />
                  <span className="ml-1 text-sm font-medium">{formatPercentage(tileData.sixMonths.percentageChange)}</span>
                </div>
              )}
            </div>
            <div className="text-2xl font-bold mb-1">
              {tileData?.sixMonths ? formatCurrency(tileData.sixMonths.current) : '...'}
            </div>
            <div className="text-sm text-ui-fg-subtle">
              vs {tileData?.sixMonths ? formatCurrency(tileData.sixMonths.previous) : '...'}
            </div>
          </div>

          {/* 1 Year Change */}
          <div className="bg-ui-bg-base p-5 rounded-lg shadow-sm border border-ui-border-base hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-ui-fg-subtle">1 Year</h3>
              {tileData?.oneYear && (
                <div className={`flex items-center ${tileData.oneYear.percentageChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <ArrowUpRightMini className={`w-4 h-4 ${tileData.oneYear.percentageChange < 0 ? 'rotate-180' : ''}`} />
                  <span className="ml-1 text-sm font-medium">{formatPercentage(tileData.oneYear.percentageChange)}</span>
                </div>
              )}
            </div>
            <div className="text-2xl font-bold mb-1">
              {tileData?.oneYear ? formatCurrency(tileData.oneYear.current) : '...'}
            </div>
            <div className="text-sm text-ui-fg-subtle">
              vs {tileData?.oneYear ? formatCurrency(tileData.oneYear.previous) : '...'}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 mb-8 bg-ui-bg-base p-6 rounded-lg shadow-sm border border-ui-border-base">
          <Heading level="h2" className="text-xl">Time Frame</Heading>
          <div className="flex items-end justify-between gap-12">
            <div className="flex-1">
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
            </div>

            {timeFrame === "custom" && (
              <div className="flex-1">
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
              </div>
            )}
          </div>
        </div>

        {/* Chart */}
        <div className="bg-ui-bg-base p-6 rounded-lg shadow-sm border border-ui-border-base min-h-[500px]">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ui-fg-base"></div>
            </div>
          ) : error ? (
            <div className="h-full flex flex-col items-center justify-center text-red-500">
              <ChartBar className="w-12 h-12 mb-4 text-red-400" />
              <p className="text-lg">Error loading data</p>
              <p className="text-sm text-red-400">{error}</p>
            </div>
          ) : chartData && LineChart ? (
            <LineChart
              key={`chart-${isDarkMode}`}
              data={chartData}
              options={{
                maintainAspectRatio: false,
                responsive: true,
                backgroundColor: 'transparent',
                interaction: {
                  intersect: false,
                  mode: "index" as const,
                },
                plugins: {
                  legend: {
                    display: false,
                  },
                  title: {
                    display: true,
                    text: "Customer Spending Over Time",
                    color: getThemeColors().text,
                    font: {
                      size: 16,
                      weight: "bold",
                    },
                    padding: {
                      bottom: 30,
                    },
                  },
                  tooltip: {
                    backgroundColor: getThemeColors().tooltipBg,
                    titleColor: getThemeColors().text,
                    bodyColor: getThemeColors().text,
                    bodyFont: {
                      size: 13,
                    },
                    titleFont: {
                      size: 13,
                      weight: "bold",
                    },
                    padding: 12,
                    borderColor: getThemeColors().tooltipBorder,
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: true,
                    usePointStyle: true,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: "Spending (CAD)",
                      color: getThemeColors().text,
                      font: {
                        size: 13,
                        weight: "normal",
                      },
                      padding: 10,
                    },
                    grid: {
                      color: getThemeColors().grid,
                      drawBorder: false,
                    },
                    ticks: {
                      color: getThemeColors().textSecondary,
                      font: {
                        size: 12,
                      },
                      padding: 8,
                    },
                    border: {
                      color: getThemeColors().border,
                    },
                  },
                  x: {
                    grid: {
                      color: getThemeColors().grid,
                      drawBorder: false,
                    },
                    ticks: {
                      color: getThemeColors().textSecondary,
                      font: {
                        size: 12,
                      },
                      padding: 8,
                      maxRotation: 45,
                    },
                    border: {
                      color: getThemeColors().border,
                    },
                  },
                },
              }}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-ui-fg-subtle">
              <ChartBar className="w-12 h-12 mb-4 text-ui-fg-muted" />
              <p className="text-lg">No data available</p>
              <p className="text-sm text-ui-fg-muted">Select a customer and time frame to view spending data</p>
            </div>
          )}
        </div>
      </div>
    </Container>
  );
};

export const config = defineRouteConfig({
  label: "Customer Analytics",
  icon: ChartBar,
});

export default CustomerAnalyticsPage;