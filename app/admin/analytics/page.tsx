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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  Legend,
  LabelList
} from "recharts"

interface AnalyticsData {
  totalOrders: number
  totalRevenue: number
  totalCustomsFees: number
  totalTransportFees: number
  totalFinalRevenue: number
  totalPriceGBP: number
  baseRevenuePct: number
  customsFeesPct: number
  transportFeesPct: number
  averageOrderValue: number
  pendingOrders: number
  processingOrders: number
  shippedOrders: number
  deliveredOrders: number
  cancelledOrders: number
  pendingOrdersValue: number
  processingOrdersValue: number
  shippedOrdersValue: number
  deliveredOrdersValue: number
  cancelledOrdersValue: number
  dailyOrders: { date: string; count: number; revenue: number }[]
  dailyFinancialMetrics: { 
    date: string;
    baseRevenue: number;
    customsFees: number;
    transportFees: number;
    totalRevenue: number;
    count: number;
  }[]
  topProducts: { url: string; count: number }[]
}

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  })
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL")

  useEffect(() => {
    fetchAnalyticsData()
  }, [dateRange, selectedStatus])

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
      if (selectedStatus && selectedStatus !== "ALL") {
        queryParams.append('status', selectedStatus)
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

  const downloadReport = async (granularity: 'order' | 'product') => {
    try {
      const queryParams = new URLSearchParams()
      if (dateRange.from) {
        queryParams.append('from', dateRange.from.toISOString())
      }
      if (dateRange.to) {
        queryParams.append('to', dateRange.to.toISOString())
      }
      if (selectedStatus && selectedStatus !== "ALL") {
        queryParams.append('status', selectedStatus)
      }
      // Add granularity parameter
      queryParams.append('granularity', granularity)
      
      const response = await fetch(`/api/admin/analytics/download?${queryParams.toString()}`)
      
      if (response.ok) {
        // Create a blob from the response
        const blob = await response.blob()
        
        // Create a link element to trigger the download
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        
        // Set the file name based on granularity
        const fileName = granularity === 'product' 
          ? `product-analytics-report.csv` 
          : `order-analytics-report.csv`
        a.download = fileName
        
        // Append to the document, click and cleanup
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        toast({
          title: "Sukses",
          description: `Raporti ${granularity === 'product' ? 'i produkteve' : 'i porosive'} u shkarkua me sukses.`,
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
      <div className="space-y-6 max-w-full overflow-x-hidden px-1">
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
                          "justify-start text-left font-normal w-full sm:w-[240px]",
                          !dateRange.from && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                        <span className="overflow-hidden text-ellipsis whitespace-nowrap">
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
                        </span>
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
                <div className="flex items-center gap-2">
                  <Select
                    value={selectedStatus}
                    onValueChange={setSelectedStatus}
                  >
                    <SelectTrigger className="w-full sm:w-[240px]">
                      <SelectValue placeholder="Filtro sipas statusit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Të gjitha statuset</SelectItem>
                      <SelectItem value="PENDING">Në pritje</SelectItem>
                      <SelectItem value="PROCESSING">Në proces</SelectItem>
                      <SelectItem value="SHIPPED">Dërguar</SelectItem>
                      <SelectItem value="DELIVERED">Dorëzuar</SelectItem>
                      <SelectItem value="CANCELLED">Anuluar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => downloadReport('order')}>
                    <Download className="mr-2 h-4 w-4" />
                    CSV (Porosi)
                  </Button>
                  <Button variant="outline" onClick={() => downloadReport('product')}>
                    <Download className="mr-2 h-4 w-4" />
                    CSV (Produkte)
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
                <div className="text-2xl font-bold">{analyticsData?.totalOrders || "0"}</div>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Çmimi Final Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">€{analyticsData?.totalFinalRevenue !== undefined ? analyticsData.totalFinalRevenue.toFixed(2) : "0.00"}</div>
                <LineChartIcon className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Dogana</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">€{analyticsData?.totalCustomsFees !== undefined ? analyticsData.totalCustomsFees.toFixed(2) : "0.00"}</div>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Menaxhimi & Transporti</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">€{analyticsData?.totalTransportFees !== undefined ? analyticsData.totalTransportFees.toFixed(2) : "0.00"}</div>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>


        <Card className="border-slate-200 border overflow-hidden">
          <CardHeader className="border-b border-slate-200 px-6 py-4">
            <CardTitle className="text-xl font-medium">Porositë sipas Statusit</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[480px]">
              {analyticsData ? (
                <div className="grid grid-cols-1 lg:grid-cols-7 h-full lg:gap-0">
                  {/* Visualization 1: Status Statistics and Progress */}
                  <div className="lg:col-span-3 h-full p-3 pr-0 pb-10 border-r border-slate-200 flex flex-col justify-between">
                    {/* Title */}
                    <div className="text-base font-medium mb-6">Përmbledhje e Statuseve</div>

                    {/* Progress Bars */}
                    <div className="space-y-5">
                      {[
                        { 
                          status: "PENDING", 
                          count: analyticsData.pendingOrders, 
                          label: "Në pritje",
                          value: analyticsData.pendingOrdersValue || 0,
                          color: "bg-blue-500"
                        },
                        { 
                          status: "PROCESSING", 
                          count: analyticsData.processingOrders, 
                          label: "Në proces",
                          value: analyticsData.processingOrdersValue || 0,
                          color: "bg-amber-500"
                        },
                        { 
                          status: "SHIPPED", 
                          count: analyticsData.shippedOrders, 
                          label: "Dërguar",
                          value: analyticsData.shippedOrdersValue || 0,
                          color: "bg-violet-500"
                        },
                        { 
                          status: "DELIVERED", 
                          count: analyticsData.deliveredOrders, 
                          label: "Dorëzuar",
                          value: analyticsData.deliveredOrdersValue || 0,
                          color: "bg-green-500"
                        },
                        { 
                          status: "CANCELLED", 
                          count: analyticsData.cancelledOrders, 
                          label: "Anuluar",
                          value: analyticsData.cancelledOrdersValue || 0,
                          color: "bg-red-500"
                        }
                      ].map((item, index) => {
                        const totalCount = analyticsData.pendingOrders + analyticsData.processingOrders + 
                                          analyticsData.shippedOrders + analyticsData.deliveredOrders + 
                                          analyticsData.cancelledOrders;
                        const percentage = totalCount > 0 ? (item.count / totalCount) * 100 : 0;
                        
                        return (
                          <div key={index}>
                            <div className="flex justify-between mb-1.5">
                              <span className="text-sm text-gray-700">{item.label}</span>
                              <div className="flex items-center">
                                <span className="text-sm font-medium">{item.count}</span>
                                <span className="text-xs text-gray-500 ml-1.5">({percentage.toFixed(1)}%)</span>
                              </div>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                              <div 
                                className={`${item.color} h-2 rounded-full`} 
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Order Stage Funnel */}
                    <div className="text-xs text-gray-500 mt-5 py-2 pb-8">
                      <div className="font-medium mb-2 text-sm">Distribucioni i Porosive</div>
                      <div className="flex flex-col gap-3">
                        <div className="text-xs">Në pritje → Në proces → Dërguar → Dorëzuar</div>
                        <div className="flex items-center mt-2">
                          <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                          <span className="ml-2">Anuluar</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Visualization 2: Status Distribution Chart */}
                  <div className="lg:col-span-4 h-full p-3 pl-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { 
                            name: "Në pritje",
                            count: analyticsData.pendingOrders,
                            value: analyticsData.pendingOrdersValue || 0
                          },
                          { 
                            name: "Në proces",
                            count: analyticsData.processingOrders,
                            value: analyticsData.processingOrdersValue || 0
                          },
                          { 
                            name: "Dërguar",
                            count: analyticsData.shippedOrders,
                            value: analyticsData.shippedOrdersValue || 0
                          },
                          { 
                            name: "Dorëzuar",
                            count: analyticsData.deliveredOrders,
                            value: analyticsData.deliveredOrdersValue || 0
                          },
                          { 
                            name: "Anuluar",
                            count: analyticsData.cancelledOrders,
                            value: analyticsData.cancelledOrdersValue || 0
                          }
                        ]}
                        layout="vertical"
                        margin={{ top: 20, right: 30, left: 90, bottom: 40 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis type="number" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                        <YAxis 
                          type="category"
                          dataKey="name"
                          tick={{ fontSize: 14, fill: '#374151' }}
                          width={90}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Bar 
                          dataKey="value"
                          fill="#10b981"
                          radius={[0, 4, 4, 0]}
                          barSize={24}
                        >
                          <LabelList 
                            dataKey="value" 
                            position="insideRight"
                            formatter={(value: number | string) => {
                              const numValue = typeof value === 'number' ? value : parseFloat(value as string);
                              return numValue > 0 ? `€${numValue.toFixed(0)}` : '';
                            }}
                            style={{ fill: 'white', fontWeight: 'bold', fontSize: '12px' }}
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground p-6">Të dhënat nuk janë në dispozicion</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Të Ardhurat dhe Porositë Ditore</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full overflow-x-auto overflow-y-hidden">
              <div className="min-w-[600px] h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analyticsData?.dailyFinancialMetrics || []}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis 
                    orientation="left" 
                    label={{ 
                      value: 'Të Ardhurat (€)', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { textAnchor: 'middle' }
                    }}
                    fontSize={12}
                  />
                  <Tooltip
                    formatter={(value, name) => {
                      const numValue = typeof value === 'number' ? value : parseFloat(value as string);
                      if (name === "baseRevenue") return [`€${numValue.toFixed(2)}`, "Çmimi Bazë"];
                      if (name === "customsFees") return [`€${numValue.toFixed(2)}`, "Dogana"];
                      if (name === "transportFees") return [`€${numValue.toFixed(2)}`, "Transporti"];
                      if (name === "count") return [value, "Porosi"];
                      return [`€${numValue.toFixed(2)}`, name];
                    }}
                  />
                  <Legend 
                    formatter={(value) => {
                      if (value === "baseRevenue") return "Çmimi Bazë";
                      if (value === "customsFees") return "Dogana";
                      if (value === "transportFees") return "Transporti";
                      return value;
                    }}
                  />
                  <Bar 
                    dataKey="baseRevenue" 
                    stackId="a"
                    fill="#8884d8" 
                    name="baseRevenue"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    dataKey="customsFees" 
                    stackId="a"
                    fill="#82ca9d" 
                    name="customsFees"
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar 
                    dataKey="transportFees" 
                    stackId="a"
                    fill="#ffc658" 
                    name="transportFees"
                    radius={[0, 0, 0, 0]}
                  >
                    {/* Add labels at the top of each stacked bar showing the count of orders */}
                    <LabelList 
                      dataKey="count"
                      position="top"
                      formatter={(value: number) => `${value} porosi`}
                      style={{ 
                        fontWeight: "bold",
                        fontSize: "12px",
                        fill: "#333"
                      }}
                    />
                  </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Produktet më të Porositura</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 overflow-x-hidden">
              {(analyticsData?.topProducts || []).map((product, index) => {
              // Truncate the URL to display only the domain and part of the path
              let displayUrl;
              try {
                const url = new URL(product.url);
                const domain = url.hostname;
                const path = url.pathname;
                displayUrl = path.length > 30 
                  ? `${domain}${path.substring(0, 30)}...` 
                  : `${domain}${path}`;
              } catch (e) {
                // Fallback for invalid URLs
                displayUrl = product.url.length > 30 
                  ? product.url.substring(0, 30) + '...' 
                  : product.url;
              }
                
              return (
                <div key={index} className="flex items-center justify-between w-full">
                  <div className="flex-1 min-w-0 mr-2">
                    <a 
                      href={product.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline block truncate"
                      title={product.url}
                    >
                      {displayUrl}
                    </a>
                  </div>
              <div className="flex-shrink-0 text-sm font-medium whitespace-nowrap">{product.count} sasi</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      </div>
    </AdminLayout>
  )
}
