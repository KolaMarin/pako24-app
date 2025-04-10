"use client"

import { useState, useEffect } from "react"
import AdminLayout from "@/components/admin-layout"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Download, BarChart as BarChartIcon, LineChart as LineChartIcon, PieChart, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend
} from "recharts"

interface AnalyticsData {
  totalOrders: number
  totalRevenue: number
  averageOrderValue: number
  pendingOrders: number
  processingOrders: number
  shippedOrders: number
  deliveredOrders: number
  cancelledOrders: number
  dailyOrders: { date: string; count: number; revenue: number }[]
  topProducts: { url: string; count: number }[]
}

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  })

  useEffect(() => {
    fetchAnalyticsData()
  }, [dateRange])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      
      const queryParams = new URLSearchParams()
      if (dateRange.from) {
        queryParams.append('from', dateRange.from.toISOString())
      }
      if (dateRange.to) {
        queryParams.append('to', dateRange.to.toISOString())
      }
      
      const response = await fetch(`/api/admin/analytics?${queryParams.toString()}`)
      
      if (response.ok) {
        const data = await response.json()
        setAnalyticsData(data)
      } else {
        throw new Error("Failed to fetch analytics data")
      }
    } catch (error) {
      toast({
        title: "Gabim",
        description: "Marrja e të dhënave analitike dështoi. Ju lutemi provoni përsëri.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const downloadReport = async (format: 'csv' | 'pdf' | 'excel') => {
    try {
      const queryParams = new URLSearchParams()
      if (dateRange.from) {
        queryParams.append('from', dateRange.from.toISOString())
      }
      if (dateRange.to) {
        queryParams.append('to', dateRange.to.toISOString())
      }
      queryParams.append('format', format)
      
      const response = await fetch(`/api/admin/analytics/download?${queryParams.toString()}`)
      
      if (response.ok) {
        // Create a blob from the response
        const blob = await response.blob()
        
        // Create a link element to trigger the download
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        
        // Set the file name based on the format
        const fileName = `analytics-report-${format === 'csv' ? 'csv' : format === 'pdf' ? 'pdf' : 'xlsx'}`
        a.download = fileName
        
        // Append to the document, click and cleanup
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        toast({
          title: "Sukses",
          description: "Raporti u shkarkua me sukses.",
        })
      } else {
        throw new Error("Failed to download report")
      }
    } catch (error) {
      toast({
        title: "Gabim",
        description: "Shkarkimi i raportit dështoi. Ju lutemi provoni përsëri.",
        variant: "destructive",
      })
    }
  }

  // Mock data for chart visualization
  const mockChartData = {
    dailyOrders: [
      { date: '2025-03-01', count: 5, revenue: 250 },
      { date: '2025-03-02', count: 7, revenue: 350 },
      { date: '2025-03-03', count: 3, revenue: 150 },
      { date: '2025-03-04', count: 8, revenue: 400 },
      { date: '2025-03-05', count: 12, revenue: 600 },
      { date: '2025-03-06', count: 10, revenue: 500 },
      { date: '2025-03-07', count: 6, revenue: 300 },
    ],
    statusDistribution: [
      { status: 'PENDING', count: 15 },
      { status: 'PROCESSING', count: 25 },
      { status: 'SHIPPED', count: 20 },
      { status: 'DELIVERED', count: 35 },
      { status: 'CANCELLED', count: 5 },
    ]
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[200px]">
          <p className="text-muted-foreground">Duke ngarkuar...</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div>
                <CardTitle>Analitika</CardTitle>
                <CardDescription>
                  Shikoni statistikat e shitjeve dhe porosive
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal w-[240px]",
                          !dateRange.from && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.from ? (
                          dateRange.to ? (
                            <>
                              {format(dateRange.from, "P")} - {format(dateRange.to, "P")}
                            </>
                          ) : (
                            format(dateRange.from, "P")
                          )
                        ) : (
                          <span>Zgjidhni datat</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange.from}
                        selected={{
                          from: dateRange.from,
                          to: dateRange.to,
                        }}
                        onSelect={(range) => {
                          if (range?.from) {
                            setDateRange({
                              from: range.from,
                              to: range.to || range.from,
                            });
                          }
                        }}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => downloadReport('csv')}>
                    <Download className="mr-2 h-4 w-4" />
                    CSV
                  </Button>
                  <Button variant="outline" onClick={() => downloadReport('excel')}>
                    <Download className="mr-2 h-4 w-4" />
                    Excel
                  </Button>
                  <Button variant="outline" onClick={() => downloadReport('pdf')}>
                    <Download className="mr-2 h-4 w-4" />
                    PDF
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Totali i Porosive</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{analyticsData?.totalOrders || mockChartData.statusDistribution.reduce((sum, item) => sum + item.count, 0)}</div>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Të Ardhurat Totale</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">€{analyticsData?.totalRevenue?.toFixed(2) || mockChartData.dailyOrders.reduce((sum, item) => sum + item.revenue, 0)}</div>
                <LineChartIcon className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Vlera Mesatare e Porosisë</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">€{analyticsData?.averageOrderValue?.toFixed(2) || (mockChartData.dailyOrders.reduce((sum, item) => sum + item.revenue, 0) / mockChartData.dailyOrders.reduce((sum, item) => sum + item.count, 0)).toFixed(2)}</div>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Porosi të Dorëzuara</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{analyticsData?.deliveredOrders || mockChartData.statusDistribution.find(item => item.status === 'DELIVERED')?.count}</div>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Porositë sipas Statusit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center">
                {/* This would be a real chart in production */}
                <div className="w-full max-w-md">
                  {mockChartData.statusDistribution.map((item, index) => (
                    <div key={index} className="mb-2">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">{item.status}</span>
                        <span className="text-sm font-medium">{item.count}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div 
                          className="bg-primary h-2.5 rounded-full" 
                          style={{ width: `${(item.count / mockChartData.statusDistribution.reduce((sum, i) => sum + i.count, 0)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Porositë dhe të Ardhurat Ditore</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analyticsData?.dailyOrders || mockChartData.dailyOrders.map(item => ({
                      ...item,
                      date: format(new Date(item.date), "dd/MM")
                    }))}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      fontSize={12}
                    />
                    <YAxis 
                      yAxisId="left"
                      orientation="left" 
                      label={{ 
                        value: 'Porositë', 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { textAnchor: 'middle' }
                      }}
                      fontSize={12}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right" 
                      label={{ 
                        value: 'Të Ardhurat (€)', 
                        angle: 90, 
                        position: 'insideRight',
                        style: { textAnchor: 'middle' }
                      }}
                      fontSize={12}
                    />
                    <Tooltip
                      formatter={(value, name) => {
                        if (name === "revenue") return [`€${value}`, "Të Ardhurat"];
                        if (name === "count") return [value, "Porositë"];
                        return [value, name];
                      }}
                    />
                    <Legend 
                      formatter={(value) => {
                        if (value === "count") return "Porositë";
                        if (value === "revenue") return "Të Ardhurat";
                        return value;
                      }}
                    />
                    <Bar 
                      yAxisId="left" 
                      dataKey="count" 
                      fill="#007bff" 
                      name="count"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      yAxisId="right" 
                      dataKey="revenue" 
                      fill="#16a34a" 
                      name="revenue"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Produktet më të Porositura</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(analyticsData?.topProducts || [
                { url: "https://example.com/product1", count: 15 },
                { url: "https://example.com/product2", count: 12 },
                { url: "https://example.com/product3", count: 10 },
                { url: "https://example.com/product4", count: 8 },
                { url: "https://example.com/product5", count: 6 },
              ]).map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1 truncate">
                    <a 
                      href={product.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline truncate"
                    >
                      {product.url}
                    </a>
                  </div>
                  <div className="ml-4 text-sm font-medium">{product.count} porosi</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
