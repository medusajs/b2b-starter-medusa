import { defineRouteConfig } from "@medusajs/admin-sdk";
import { ChartBar } from "@medusajs/icons";
import { Container, Heading, Input, Select, DatePicker, Button } from "@medusajs/ui";
import React, { useEffect, useState, useRef } from "react";
import { useProducts } from "../../hooks/api/products";
import { sdk } from "../../lib/client";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

type TimeFrame = "day" | "week" | "month" | "year" | "custom";

// Array of colors for different products - optimized for both light and dark modes
const CHART_COLORS = [
  "#3b82f6", // blue - more vibrant
  "#ef4444", // red - more vibrant
  "#10b981", // green - more vibrant
  "#8b5cf6", // purple - more vibrant
  "#f59e0b", // orange - more vibrant
  "#06b6d4", // cyan - more vibrant
  "#ec4899", // pink - more vibrant
  "#84cc16", // lime - more vibrant
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
  const [isDarkMode, setIsDarkMode] = useState(false);

  const { products = [], isLoading: isLoadingProducts } = useProducts({
    fields: "id,title,thumbnail,handle,variants",
  });

  // Filter products by search query (title, handle, or SKU)
  const filteredProducts = React.useMemo(() => {
    if (!searchQuery.trim()) return products;
    
    const query = searchQuery.toLowerCase().trim();
    return products.filter((product) => {
      // Search in title
      if (product.title?.toLowerCase().includes(query)) return true;
      
      // Search in handle
      if (product.handle?.toLowerCase().includes(query)) return true;
      
      // Search in variant SKUs
      if (product.variants?.some((variant: any) => 
        variant.sku?.toLowerCase().includes(query)
      )) return true;
      
      return false;
    });
  }, [products, searchQuery]);

  // Helper function to highlight matching text
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-ui-bg-highlight text-ui-fg-base px-1 rounded font-medium">
          {part}
        </mark>
      ) : part
    );
  };

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
          backgroundColor: `${data.product.color}15`, // Reduced opacity for better dark mode
          tension: 0.4,
          fill: true,
          pointStyle: 'circle',
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: data.product.color,
          pointBorderColor: data.product.color,
          pointBorderWidth: 2,
          borderWidth: 3, // Thicker lines for better visibility
          hoverBorderWidth: 4
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
        backgroundColor: 'transparent'
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
          <Heading level="h1" className="text-ui-fg-base">Product Analytics</Heading>
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
        
        <div className="flex flex-col gap-4 mb-8 bg-ui-bg-base p-6 rounded-lg shadow-sm border border-ui-border-base">
          <div className="flex items-center justify-between">
            <Heading level="h2" className="text-xl text-ui-fg-base">Search Products</Heading>
            {searchQuery.trim() && (
              <div className="text-sm text-ui-fg-subtle">
                {filteredProducts.length} of {products.length} products
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="relative">
              <Input
                placeholder="Search by product name, handle, or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="mt-2 max-h-60 overflow-y-auto border border-ui-border-base rounded-md bg-ui-bg-subtle">
              {isLoadingProducts ? (
                <div className="px-4 py-2 text-ui-fg-subtle text-center">
                  Loading...
                </div>
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((product) => {
                  const isSelected = selectedProducts.some(p => p.id === product.id);
                  const selectedProduct = selectedProducts.find(p => p.id === product.id);
                  
                  return (
                    <div
                      key={product.id}
                      className={`px-4 py-2 hover:bg-ui-bg-base-hover cursor-pointer transition-colors ${
                        isSelected ? 'bg-ui-bg-highlight' : ''
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
                          <div className="font-medium text-ui-fg-base">{highlightText(product.title, searchQuery)}</div>
                          <div className="text-sm text-ui-fg-subtle">
                            {highlightText(product.handle, searchQuery)}
                          </div>
                          {product.variants && product.variants.length > 0 && (
                            <div className="text-xs text-ui-fg-muted mt-1">
                              SKUs: {product.variants.map((v: any) => v.sku).filter(Boolean).map(sku => highlightText(sku, searchQuery)).join(', ') || 'No SKUs'}
                            </div>
                          )}
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
                <div className="px-4 py-2 text-ui-fg-subtle text-center">
                  {searchQuery.trim() ? 'No products found matching your search' : 'No products available'}
                </div>
              )}
            </div>
          </div>
        </div>

        {selectedProducts.length > 0 && (
          <div className="flex flex-col gap-4 mb-8 bg-ui-bg-base p-6 rounded-lg shadow-sm border border-ui-border-base">
            <div className="flex items-center justify-between">
              <Heading level="h2" className="text-xl text-ui-fg-base">Sales Analytics</Heading>
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
                <div className="text-ui-fg-subtle">Loading chart data...</div>
              </div>
            ) : error ? (
              <div className="h-[400px] flex items-center justify-center">
                <div className="text-ui-fg-error">{error}</div>
              </div>
            ) : chartData && LineChart ? (
              <div className="h-[400px] bg-ui-bg-base rounded-lg p-4 border border-ui-border-base" ref={chartRef}>
                <LineChart
                  key={`chart-${isDarkMode}`}
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    backgroundColor: 'transparent',
                    interaction: {
                      intersect: false,
                      mode: 'index'
                    },
                    plugins: {
                      legend: {
                        position: 'top' as const,
                        labels: {
                          usePointStyle: true,
                          pointStyle: 'circle',
                          boxWidth: 8,
                          boxHeight: 8,
                          color: getThemeColors().text,
                          font: {
                            size: 12,
                            weight: '500'
                          },
                          padding: 20
                        }
                      },
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
                          text: 'Units Sold',
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
                          padding: 8
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
                          text: 'Date',
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
                      }
                    }
                  }}
                />
              </div>
            ) : (
              <div className="h-[400px] flex items-center justify-center">
                <div className="text-ui-fg-subtle">Select products to view analytics</div>
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