import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { z } from "zod";

const CustomerAnalyticsQuerySchema = z.object({
  start_date: z.string(),
  end_date: z.string(),
  customer_id: z.string()
});

export const GET = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  try {
    // Validate query parameters
    const result = CustomerAnalyticsQuerySchema.safeParse(req.query);
    if (!result.success) {
      return res.status(400).json({ message: "Start date, end date, and customer ID are required" });
    }

    const { start_date, end_date, customer_id } = result.data;

    // Get the query service from the request scope
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

    // Get all orders for the customer
    const { data: orders } = await query.graph({
      entity: "order",
      fields: [
        "created_at",
        "total",
        "status",
        "customer_id"
      ]
    });

    // Filter orders for the specific customer
    const customerOrders = orders.filter((order: any) => order.customer_id === customer_id);

    // Filter out canceled orders
    const validOrders = customerOrders.filter((order: any) => order.status !== "canceled");

    const now = new Date();

    // Helper to calculate period totals
    const calculatePeriodTotal = (startDate: Date, endDate: Date) => {
      return validOrders.reduce((total: number, order: any) => {
        const orderDate = new Date(order.created_at);
        if (orderDate >= startDate && orderDate <= endDate) {
          return total + Number(order.total);
        }
        return total;
      }, 0);
    };

    // Periods for tiles (fixed time periods regardless of chart time frame)
    const periods = {
      oneWeek: {
        current: { 
          start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), 
          end: now 
        },
        previous: { 
          start: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000), 
          end: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) 
        }
      },
      oneMonth: {
        current: { 
          start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), 
          end: now 
        },
        previous: { 
          start: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000), 
          end: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) 
        }
      },
      threeMonths: {
        current: { 
          start: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000), 
          end: now 
        },
        previous: { 
          start: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000), 
          end: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) 
        }
      },
      sixMonths: {
        current: { 
          start: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000), 
          end: now 
        },
        previous: { 
          start: new Date(now.getTime() - 360 * 24 * 60 * 60 * 1000), 
          end: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000) 
        }
      },
      oneYear: {
        current: { 
          start: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000), 
          end: now 
        },
        previous: { 
          start: new Date(now.getTime() - 730 * 24 * 60 * 60 * 1000), 
          end: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) 
        }
      }
    };

    // Calculate tile data (using fixed time periods)
    const tileData = {
      oneWeek: {
        current: calculatePeriodTotal(periods.oneWeek.current.start, periods.oneWeek.current.end),
        previous: calculatePeriodTotal(periods.oneWeek.previous.start, periods.oneWeek.previous.end)
      },
      oneMonth: {
        current: calculatePeriodTotal(periods.oneMonth.current.start, periods.oneMonth.current.end),
        previous: calculatePeriodTotal(periods.oneMonth.previous.start, periods.oneMonth.previous.end)
      },
      threeMonths: {
        current: calculatePeriodTotal(periods.threeMonths.current.start, periods.threeMonths.current.end),
        previous: calculatePeriodTotal(periods.threeMonths.previous.start, periods.threeMonths.previous.end)
      },
      sixMonths: {
        current: calculatePeriodTotal(periods.sixMonths.current.start, periods.sixMonths.current.end),
        previous: calculatePeriodTotal(periods.sixMonths.previous.start, periods.sixMonths.previous.end)
      },
      oneYear: {
        current: calculatePeriodTotal(periods.oneYear.current.start, periods.oneYear.current.end),
        previous: calculatePeriodTotal(periods.oneYear.previous.start, periods.oneYear.previous.end)
      }
    };

    // Calculate percentage changes
    const calculatePercentageChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const percentageChanges = {
      oneWeek: calculatePercentageChange(tileData.oneWeek.current, tileData.oneWeek.previous),
      oneMonth: calculatePercentageChange(tileData.oneMonth.current, tileData.oneMonth.previous),
      threeMonths: calculatePercentageChange(tileData.threeMonths.current, tileData.threeMonths.previous),
      sixMonths: calculatePercentageChange(tileData.sixMonths.current, tileData.sixMonths.previous),
      oneYear: calculatePercentageChange(tileData.oneYear.current, tileData.oneYear.previous)
    };

    // Filter orders for chart based on selected time frame
    const chartStartDate = new Date(String(start_date));
    const chartEndDate = new Date(String(end_date));
    const chartOrders = validOrders.filter((order: any) => {
      const orderDate = new Date(order.created_at);
      return orderDate >= chartStartDate && orderDate <= chartEndDate;
    });

    // Generate complete date range for consistent intervals
    const generateDateRange = (start: Date, end: Date) => {
      const dates = [];
      const current = new Date(start);
      current.setHours(0, 0, 0, 0); // Start at beginning of day
      
      while (current <= end) {
        dates.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
      return dates;
    };

    const dateRange = generateDateRange(chartStartDate, chartEndDate);
    
    // Create a map of orders by date for quick lookup
    const ordersByDate = new Map();
    chartOrders.forEach((order: any) => {
      const orderDate = new Date(order.created_at);
      const dateKey = orderDate.toISOString().split('T')[0]; // YYYY-MM-DD format
      if (!ordersByDate.has(dateKey)) {
        ordersByDate.set(dateKey, []);
      }
      ordersByDate.get(dateKey).push(order);
    });

    // Format data for chart with complete date range
    const labels = dateRange.map(date => {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    });

    const orderData = dateRange.map(date => {
      const dateKey = date.toISOString().split('T')[0];
      const dayOrders = ordersByDate.get(dateKey) || [];
      return dayOrders.reduce((total: number, order: any) => total + Number(order.total), 0);
    });

    return res.json({
      labels,
      payments: orderData,
      tileData: {
        oneWeek: {
          current: tileData.oneWeek.current,
          previous: tileData.oneWeek.previous,
          percentageChange: percentageChanges.oneWeek
        },
        oneMonth: {
          current: tileData.oneMonth.current,
          previous: tileData.oneMonth.previous,
          percentageChange: percentageChanges.oneMonth
        },
        threeMonths: {
          current: tileData.threeMonths.current,
          previous: tileData.threeMonths.previous,
          percentageChange: percentageChanges.threeMonths
        },
        sixMonths: {
          current: tileData.sixMonths.current,
          previous: tileData.sixMonths.previous,
          percentageChange: percentageChanges.sixMonths
        },
        oneYear: {
          current: tileData.oneYear.current,
          previous: tileData.oneYear.previous,
          percentageChange: percentageChanges.oneYear
        }
      }
    });
  } catch (error) {
    console.error("Error in customer analytics API:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}; 