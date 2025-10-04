import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Expense } from '@/types';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { TrendingUp, DollarSign, PieChart as PieChartIcon, BarChart3, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface AnalyticsDashboardProps {
  expenses: Expense[];
  currency?: string;
}

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#14b8a6'];

export function AnalyticsDashboard({ expenses, currency = 'USD' }: AnalyticsDashboardProps) {
  const analytics = useMemo(() => {
    const categoryData: Record<string, { total: number; count: number }> = {};
    const monthlyData: Record<string, number> = {};
    const statusData: Record<string, number> = { approved: 0, pending: 0, rejected: 0 };
    
    let totalExpenses = 0;
    let approvedTotal = 0;
    
    expenses.forEach(expense => {
      const amount = expense.convertedAmount || expense.amount;
      totalExpenses += amount;
      
      if (!categoryData[expense.category]) {
        categoryData[expense.category] = { total: 0, count: 0 };
      }
      categoryData[expense.category].total += amount;
      categoryData[expense.category].count += 1;
      
      const date = new Date(expense.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + amount;
      
      statusData[expense.status] = (statusData[expense.status] || 0) + amount;
      
      if (expense.status === 'approved') {
        approvedTotal += amount;
      }
    });
    
    const categoryChartData = Object.entries(categoryData)
      .map(([name, data]) => ({
        name,
        value: data.total,
        count: data.count,
        percentage: totalExpenses > 0 ? ((data.total / totalExpenses) * 100).toFixed(1) : '0',
      }))
      .sort((a, b) => b.value - a.value);
    
    const formatMonthDisplay = (monthKey: string) => {
      const [year, month] = monthKey.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };
    
    const monthlyChartData = Object.entries(monthlyData)
      .map(([monthKey, total]) => ({ 
        monthKey,
        month: formatMonthDisplay(monthKey),
        total 
      }))
      .sort((a, b) => a.monthKey.localeCompare(b.monthKey));
    
    const statusChartData = Object.entries(statusData).map(([status, value]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      value,
    }));
    
    const predictFutureExpenses = () => {
      if (monthlyChartData.length < 2) return [];
      
      const lastThreeMonths = monthlyChartData.slice(-3);
      const avgGrowth = lastThreeMonths.reduce((sum, item, i) => {
        if (i === 0) return 0;
        const prev = lastThreeMonths[i - 1].total;
        if (prev === 0) return sum;
        return sum + (item.total - prev) / prev;
      }, 0) / (lastThreeMonths.length - 1);
      
      const lastMonth = monthlyChartData[monthlyChartData.length - 1];
      const [lastYear, lastMonthNum] = lastMonth.monthKey.split('-').map(Number);
      const predictions = [];
      
      for (let i = 1; i <= 3; i++) {
        const date = new Date(lastYear, lastMonthNum - 1 + i);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const predictedValue = lastMonth.total * Math.pow(1 + avgGrowth, i);
        predictions.push({
          monthKey,
          month: formatMonthDisplay(monthKey),
          predicted: Math.max(0, predictedValue),
        });
      }
      
      return predictions;
    };
    
    const futureData = predictFutureExpenses();
    const combinedTrendData = [
      ...monthlyChartData.map(d => ({ 
        monthKey: d.monthKey,
        month: d.month, 
        actual: d.total 
      })), 
      ...futureData
    ];
    
    const avgExpense = expenses.length > 0 ? totalExpenses / expenses.length : 0;
    const approvalRate = totalExpenses > 0 ? ((approvedTotal / totalExpenses) * 100).toFixed(1) : '0';
    
    const currentMonth = monthlyChartData[monthlyChartData.length - 1]?.total || 0;
    const previousMonth = monthlyChartData[monthlyChartData.length - 2]?.total || 0;
    const monthlyGrowth = previousMonth > 0 ? ((currentMonth - previousMonth) / previousMonth * 100).toFixed(1) : '0';
    
    return {
      totalExpenses,
      approvedTotal,
      avgExpense,
      approvalRate,
      categoryChartData,
      monthlyChartData,
      statusChartData,
      combinedTrendData,
      monthlyGrowth,
      expenseCount: expenses.length,
    };
  }, [expenses]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currency} {analytics.totalExpenses.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.expenseCount} total transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currency} {analytics.approvedTotal.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.approvalRate}% approval rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Expense</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currency} {analytics.avgExpense.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Per transaction
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Growth</CardTitle>
            {parseFloat(analytics.monthlyGrowth) >= 0 ? (
              <ArrowUpRight className="h-4 w-4 text-green-500" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${parseFloat(analytics.monthlyGrowth) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {analytics.monthlyGrowth}%
            </div>
            <p className="text-xs text-muted-foreground">
              vs previous month
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">
            <TrendingUp className="mr-2 h-4 w-4" />
            Trends & Predictions
          </TabsTrigger>
          <TabsTrigger value="categories">
            <PieChartIcon className="mr-2 h-4 w-4" />
            Category Breakdown
          </TabsTrigger>
          <TabsTrigger value="status">
            <BarChart3 className="mr-2 h-4 w-4" />
            Status Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Expense Trends with Future Predictions</CardTitle>
              <p className="text-sm text-muted-foreground">
                Historical data with 3-month forecast based on trend analysis
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={analytics.combinedTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => value ? `${currency} ${value.toFixed(2)}` : 'N/A'}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="actual" 
                    stroke="#8b5cf6" 
                    fill="#8b5cf6" 
                    fillOpacity={0.6}
                    name="Actual Expenses"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="predicted"
                    stroke="#10b981" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: '#10b981' }}
                    name="Predicted Expenses"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Expense Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `${currency} ${value.toFixed(2)}`} />
                  <Bar dataKey="total" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Expenses by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.categoryChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} (${percentage}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analytics.categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${currency} ${value.toFixed(2)}`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.categoryChartData.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="h-3 w-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">{currency} {item.value.toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground">{item.count} transactions</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Expenses by Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.statusChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `${currency} ${value.toFixed(2)}`} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {analytics.statusChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={
                          entry.status === 'Approved' ? '#10b981' : 
                          entry.status === 'Pending' ? '#f59e0b' : 
                          '#ef4444'
                        } 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
