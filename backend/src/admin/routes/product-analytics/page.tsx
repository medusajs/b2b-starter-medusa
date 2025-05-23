import { defineRouteConfig } from "@medusajs/admin-sdk";
import { ChartBar } from "@medusajs/icons";
import { Container, Heading, Input, Select, DatePicker, Button } from "@medusajs/ui";
import React, { useEffect, useState, useRef } from "react";
import { useProducts } from "../../hooks/api/products";
import { sdk } from "../../lib/client";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

type TimeFrame = "day" | "week" | "month" | "year" | "custom";

// Array of colors for different products
const CHART_COLORS = [
  "#2563eb", // blue
  "#dc2626", // red
  "#16a34a", // green
  "#9333ea", // purple
  "#ea580c", // orange
  "#0891b2", // cyan
  "#be185d", // pink
  "#854d0e", // amber
];

interface SelectedProduct {
  id: string;
  title: string;
  color: string;
}

const ProductAnalyticsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("week");
  const [customDateRange, setCustomDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [chartData, setChartData] = useState<any>(null);
  const [LineChart, setLineChart] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  const { products = [], isLoading: isLoadingProducts } = useProducts({
    q: searchQuery,
    fields: "id,title,thumbnail,handle",
  });

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

  const fetchChartData = async () => {
    if (selectedProducts.length === 0) return;

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

      // Fetch data for all selected products
      const productDataPromises = selectedProducts.map(async (product) => {
        const response = await fetch(
          `/admin/product-analytics?start_date=${startDate.toISOString()}&end_date=${endDate.toISOString()}&product_id=${product.id}`,
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

        return {
          ...data,
          product
        };
      });

      const allProductData = await Promise.all(productDataPromises);

      // Combine all product data
      setChartData({
        labels: allProductData[0].labels, // Use labels from first product
        datasets: allProductData.map((data, index) => ({
          label: data.product.title,
          data: data.sales,
          borderColor: data.product.color,
          backgroundColor: `${data.product.color}20`,
          tension: 0.4,
          fill: true,
          pointStyle: 'circle',
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: data.product.color,
          pointBorderColor: data.product.color
        }))
      });
    } catch (error) {
      console.error("Error fetching chart data:", error);
      setError(error.message || "Failed to fetch chart data");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when time frame, custom date range, or selected products change
  useEffect(() => {
    if (selectedProducts.length > 0) {
      fetchChartData();
    }
  }, [timeFrame, customDateRange, selectedProducts]);

  const handleDateChange = (date: Date | null, field: 'from' | 'to') => {
    setCustomDateRange(prev => ({
      ...prev,
      [field]: date || undefined
    }));
  };

  const handleProductSelect = (product: any) => {
    // Check if product is already selected
    const isSelected = selectedProducts.some(p => p.id === product.id);
    
    if (isSelected) {
      // Remove product if already selected
      setSelectedProducts(prev => prev.filter(p => p.id !== product.id));
    } else {
      // Add product with next available color
      const colorIndex = selectedProducts.length % CHART_COLORS.length;
      setSelectedProducts(prev => [...prev, {
        id: product.id,
        title: product.title,
        color: CHART_COLORS[colorIndex]
      }]);
    }
  };

  const handleExportPDF = async () => {
    if (!chartRef.current) return;

    try {
      const canvas = await html2canvas(chartRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);

      const date = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      const filename = `product_analytics_${date}.pdf`;

      pdf.save(filename);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
    }
  };

  return (
    <Container>
      <div className="flex flex-col gap-y-4">
        <div className="flex items-center justify-between">
          <Heading level="h1">Product Analytics</Heading>
          {selectedProducts.length > 0 && (
            <Button
              variant="secondary"
              onClick={handleExportPDF}
              className="flex items-center gap-2"
            >
              Export to PDF
            </Button>
          )}
        </div>
        
        <div className="flex flex-col gap-4 mb-8 bg-white p-6 rounded-lg shadow-sm">
          <Heading level="h2" className="text-xl">Search Products</Heading>
          <div className="flex-1">
            <div className="relative">
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="mt-2 max-h-60 overflow-y-auto border border-gray-200 rounded-md">
              {isLoadingProducts ? (
                <div className="px-4 py-2 text-gray-500 text-center">
                  Loading...
                </div>
              ) : products.length > 0 ? (
                products.map((product) => {
                  const isSelected = selectedProducts.some(p => p.id === product.id);
                  const selectedProduct = selectedProducts.find(p => p.id === product.id);
                  
                  return (
                    <div
                      key={product.id}
                      className={`px-4 py-2 hover:bg-gray-50 cursor-pointer ${
                        isSelected ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleProductSelect(product)}
                    >
                      <div className="flex items-center gap-3">
                        {product.thumbnail && (
                          <img
                            src={product.thumbnail}
                            alt={product.title}
                            className="w-10 h-10 object-contain"
                          />
                        )}
                        <div className="flex-1">
                          <div className="font-medium">{product.title}</div>
                          <div className="text-sm text-gray-500">
                            {product.handle}
                          </div>
                        </div>
                        {isSelected && (
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: selectedProduct?.color }}
                          />
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="px-4 py-2 text-gray-500 text-center">
                  No products found
                </div>
              )}
            </div>
          </div>
        </div>

        {selectedProducts.length > 0 && (
          <div className="flex flex-col gap-4 mb-8 bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <Heading level="h2" className="text-xl">Sales Analytics</Heading>
              <div className="flex items-center gap-2">
                <Select
                  value={timeFrame}
                  onValueChange={(value) => setTimeFrame(value as TimeFrame)}
                >
                  <Select.Trigger>
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="day">Last 24 Hours</Select.Item>
                    <Select.Item value="week">Last 7 Days</Select.Item>
                    <Select.Item value="month">Last 30 Days</Select.Item>
                    <Select.Item value="year">Last Year</Select.Item>
                    <Select.Item value="custom">Custom Range</Select.Item>
                  </Select.Content>
                </Select>

                {timeFrame === "custom" && (
                  <div className="flex items-center gap-2">
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
            </div>

            {isLoading ? (
              <div className="h-[400px] flex items-center justify-center">
                <div className="text-gray-500">Loading chart data...</div>
              </div>
            ) : error ? (
              <div className="h-[400px] flex items-center justify-center">
                <div className="text-red-500">{error}</div>
              </div>
            ) : chartData && LineChart ? (
              <div className="h-[400px]" ref={chartRef}>
                <LineChart
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top' as const,
                        labels: {
                          usePointStyle: true,
                          pointStyle: 'circle',
                          boxWidth: 8,
                          boxHeight: 8
                        }
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Units Sold'
                        }
                      },
                      x: {
                        title: {
                          display: true,
                          text: 'Date'
                        }
                      }
                    }
                  }}
                />
              </div>
            ) : (
              <div className="h-[400px] flex items-center justify-center">
                <div className="text-gray-500">Select products to view analytics</div>
              </div>
            )}
          </div>
        )}
      </div>
    </Container>
  );
};

export const config = defineRouteConfig({
  label: "Product Analytics",
  icon: ChartBar,
});

export default ProductAnalyticsPage;