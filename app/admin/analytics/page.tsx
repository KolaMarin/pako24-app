"use client"

import { useState, useEffect } from "react"
import AdminLayout from "@/components/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

// Mock data
const orderData = [
  { month: "Jan", orders: 65, revenue: 4200 },
  { month: "Feb", orders: 59, revenue: 3800 },
  { month: "Mar", orders: 80, revenue: 5100 },
  { month: "Apr", orders: 81, revenue: 5300 },
  { month: "May", orders: 56, revenue: 3700 },
  { month: "Jun", orders: 55, revenue: 3600 },
  { month: "Jul", orders: 40, revenue: 2800 },
  { month: "Aug", orders: 70, revenue: 4500 },
  { month: "Sep", orders: 90, revenue: 5800 },
  { month: "Oct", orders: 110, revenue: 7200 },
  { month: "Nov", orders: 130, revenue: 8500 },
  { month: "Dec", orders: 150, revenue: 9800 },
]

const categoryData = [
  { name: "Fashion", value: 40 },
  { name: "Electronics", value: 30 },
  { name: "Beauty", value: 15 },
  { name: "Home", value: 10 },
  { name: "Other", value: 5 },
]

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

const userAcquisitionData = [
  { month: "Jan", organic: 30, referral: 20, social: 15 },
  { month: "Feb", organic: 25, referral: 25, social: 20 },
  { month: "Mar", organic: 35, referral: 30, social: 25 },
  { month: "Apr", organic: 40, referral: 35, social: 30 },
  { month: "May", organic: 30, referral: 25, social: 20 },
  { month: "Jun", organic: 25, referral: 20, social: 15 },
  { month: "Jul", organic: 20, referral: 15, social: 10 },
  { month: "Aug", organic: 30, referral: 25, social: 20 },
  { month: "Sep", organic: 40, referral: 35, social: 30 },
  { month: "Oct", organic: 50, referral: 40, social: 35 },
  { month: "Nov", organic: 60, referral: 45, social: 40 },
  { month: "Dec", organic: 70, referral: 50, social: 45 },
]

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState("year")
  const [isLoading, setIsLoading] = useState(false)

  // Key metrics
  const [metrics, setMetrics] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    activeUsers: 0,
  })

  useEffect(() => {
    // In a real implementation, this would fetch data from your API
    setIsLoading(true)

    // Mock data loading
    setTimeout(() => {
      setMetrics({
        totalOrders: 986,
        totalRevenue: 64300,
        averageOrderValue: 65.21,
        activeUsers: 342,
      })
      setIsLoading(false)
    }, 1000)
  }, [timeRange])

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Analitika e Biznesit</h1>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Periudha kohore" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Java e fundit</SelectItem>
            <SelectItem value="month">Muaji i fundit</SelectItem>
            <SelectItem value="quarter">3 muajt e fundit</SelectItem>
            <SelectItem value="year">Viti i fundit</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Porosi Totale</CardDescription>
            <CardTitle className="text-3xl">{metrics.totalOrders}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-green-600">+12% nga periudha e mëparshme</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Të Ardhura Totale</CardDescription>
            <CardTitle className="text-3xl">€{metrics.totalRevenue.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-green-600">+8% nga periudha e mëparshme</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Vlera Mesatare e Porosisë</CardDescription>
            <CardTitle className="text-3xl">€{metrics.averageOrderValue.toFixed(2)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-red-600">-2% nga periudha e mëparshme</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Përdorues Aktivë</CardDescription>
            <CardTitle className="text-3xl">{metrics.activeUsers}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-green-600">+15% nga periudha e mëparshme</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="orders">Porositë & Të Ardhurat</TabsTrigger>
          <TabsTrigger value="categories">Kategoritë</TabsTrigger>
          <TabsTrigger value="users">Përdoruesit</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Porositë dhe Të Ardhurat Mujore</CardTitle>
              <CardDescription>Numri i porosive dhe të ardhurat për çdo muaj</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={orderData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="orders"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                      name="Porosi"
                    />
                    <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#82ca9d" name="Të Ardhura (€)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Shpërndarja e Kategorive</CardTitle>
              <CardDescription>Porositë sipas kategorive të produkteve</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Burimet e Përdoruesve</CardTitle>
              <CardDescription>Si po vijnë përdoruesit në platformë</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={userAcquisitionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="organic" stackId="a" fill="#8884d8" name="Organik" />
                    <Bar dataKey="referral" stackId="a" fill="#82ca9d" name="Referim" />
                    <Bar dataKey="social" stackId="a" fill="#ffc658" name="Social Media" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  )
}

