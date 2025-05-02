"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import AdminLayout from "@/components/admin-layout"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { toast } from "@/components/ui/use-toast"
import {
  Search,
  User,
  Phone,
  MapPin,
  ShoppingBag,
  Calendar,
  Lock,
  CheckCircle,
  XCircle,
  Shield,
  AlertTriangle,
  ChevronRight,
  BarChart4,
  Trash,
} from "lucide-react"
import { format } from "date-fns"

interface Customer {
  id: string
  email: string
  phoneNumber: string
  location: string
  isBlocked: boolean
  totalOrders: number
  createdAt: string
  updatedAt: string
}

interface CustomerDetails extends Customer {
  statistics: {
    totalOrders: number
    totalSpent: number
    ordersByStatus: {
      pending: { count: number, totalValue: number }
      processing: { count: number, totalValue: number }
      shipped: { count: number, totalValue: number }
      delivered: { count: number, totalValue: number }
      cancelled: { count: number, totalValue: number }
    }
  }
  orders: Array<{
    id: string
    status: string
    createdAt: string
    totalFinalPriceEUR: number
  }>
}

interface PaginationData {
  total: number
  page: number
  limit: number
  totalPages: number
}

interface CustomerResponse {
  customers: Customer[]
  pagination: PaginationData
}

export default function CustomersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [customers, setCustomers] = useState<Customer[]>([])
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  })
  
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetails | null>(null)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
  
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [customerDetailLoading, setCustomerDetailLoading] = useState(false)

  // Effects
  useEffect(() => {
    const page = searchParams.get("page") || "1"
    const status = searchParams.get("status") || "all"
    const search = searchParams.get("search") || ""
    
    setActiveTab(status)
    setSearchTerm(search)
    
    fetchCustomers(parseInt(page, 10), status, search)
  }, [searchParams])

  // Fetch customers with filtering and pagination
  const fetchCustomers = async (page = 1, status = "all", search = "") => {
    try {
      setLoading(true)
      
      let url = `/api/admin/customers?page=${page}&limit=10`
      if (status !== "all") {
        url += `&status=${status}`
      }
      if (search) {
        url += `&search=${encodeURIComponent(search)}`
      }
      
      const response = await fetch(url)
      
      if (response.ok) {
        const data: CustomerResponse = await response.json()
        setCustomers(data.customers)
        setPagination(data.pagination)
      } else {
        throw new Error("Failed to fetch customers")
      }
    } catch (error) {
      console.error("Error fetching customers:", error)
      toast({
        title: "Error",
        description: "Failed to load customers. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Fetch customer details
  const fetchCustomerDetails = async (customerId: string) => {
    try {
      setCustomerDetailLoading(true)
      const response = await fetch(`/api/admin/customers/${customerId}`)
      
      if (response.ok) {
        const data: CustomerDetails = await response.json()
        setSelectedCustomer(data)
        setIsDetailModalOpen(true)
      } else {
        throw new Error("Failed to fetch customer details")
      }
    } catch (error) {
      console.error("Error fetching customer details:", error)
      toast({
        title: "Error",
        description: "Failed to load customer details. Please try again.",
        variant: "destructive",
      })
    } finally {
      setCustomerDetailLoading(false)
    }
  }

  // Handle password change
  const handlePasswordChange = async () => {
    // Validate password
    if (!newPassword) {
      setPasswordError("Password is required")
      return
    }
    
    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters")
      return
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match")
      return
    }
    
    if (!selectedCustomerId) return
    
    try {
      const response = await fetch(`/api/admin/customers/${selectedCustomerId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: newPassword,
        }),
      })
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Password updated successfully",
        })
        
        setIsPasswordModalOpen(false)
        setNewPassword("")
        setConfirmPassword("")
        setPasswordError("")
      } else {
        throw new Error("Failed to update password")
      }
    } catch (error) {
      console.error("Error updating password:", error)
      toast({
        title: "Error",
        description: "Failed to update password. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle customer blocking/unblocking
  const handleToggleBlock = async (customerId: string, currentlyBlocked: boolean) => {
    try {
      const response = await fetch(`/api/admin/customers/${customerId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isBlocked: !currentlyBlocked,
        }),
      })
      
      if (response.ok) {
        // Update local state
        setCustomers(
          customers.map((customer) =>
            customer.id === customerId
              ? { ...customer, isBlocked: !currentlyBlocked }
              : customer
          )
        )
        
        // Update selected customer if in detail view
        if (selectedCustomer && selectedCustomer.id === customerId) {
          setSelectedCustomer({
            ...selectedCustomer,
            isBlocked: !currentlyBlocked,
          })
        }
        
        toast({
          title: "Success",
          description: `Customer ${!currentlyBlocked ? "blocked" : "unblocked"} successfully`,
        })
      } else {
        throw new Error(`Failed to ${currentlyBlocked ? "unblock" : "block"} customer`)
      }
    } catch (error) {
      console.error("Error toggling block status:", error)
      toast({
        title: "Error",
        description: `Failed to ${currentlyBlocked ? "unblock" : "block"} customer. Please try again.`,
        variant: "destructive",
      })
    }
  }

  // Handle search
  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (searchTerm) {
      params.set("search", searchTerm)
    } else {
      params.delete("search")
    }
    
    params.set("page", "1") // Reset to first page when searching
    router.push(`/admin/customers?${params.toString()}`)
  }

  // Handle tab change
  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (value !== "all") {
      params.set("status", value)
    } else {
      params.delete("status")
    }
    
    params.set("page", "1") // Reset to first page when changing filters
    router.push(`/admin/customers?${params.toString()}`)
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", page.toString())
    router.push(`/admin/customers?${params.toString()}`)
  }

  // Open password change modal
  const openPasswordModal = (customerId: string) => {
    setSelectedCustomerId(customerId)
    setNewPassword("")
    setConfirmPassword("")
    setPasswordError("")
    setIsPasswordModalOpen(true)
  }

  if (loading && customers.length === 0) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[300px]">
          <p className="text-muted-foreground">Loading customers...</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
              <div>
                <CardTitle>Customer Management</CardTitle>
                <CardDescription>
                  View and manage your customers, their information, and account status
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative w-[250px]">
                  <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by email or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSearch()
                    }}
                    className="pl-8"
                  />
                </div>
                <Button onClick={handleSearch}>Search</Button>
              </div>
            </div>
          </CardHeader>
          
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <div className="px-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All Customers</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="blocked">Blocked</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="all" className="pt-2">
              <CustomerTable
                customers={customers}
                onViewDetails={fetchCustomerDetails}
                onChangePassword={openPasswordModal}
                onToggleBlock={handleToggleBlock}
                loading={loading}
              />
            </TabsContent>
            
            <TabsContent value="active" className="pt-2">
              <CustomerTable
                customers={customers}
                onViewDetails={fetchCustomerDetails}
                onChangePassword={openPasswordModal}
                onToggleBlock={handleToggleBlock}
                loading={loading}
              />
            </TabsContent>
            
            <TabsContent value="blocked" className="pt-2">
              <CustomerTable
                customers={customers}
                onViewDetails={fetchCustomerDetails}
                onChangePassword={openPasswordModal}
                onToggleBlock={handleToggleBlock}
                loading={loading}
              />
            </TabsContent>
          </Tabs>
          
          <CardFooter className="flex items-center justify-between border-t p-6">
            <div className="text-sm text-muted-foreground">
              Showing {customers.length} of {pagination.total} customers
            </div>
            
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => {
                      if (pagination.page > 1) {
                        handlePageChange(pagination.page - 1)
                      }
                    }}
                    className={pagination.page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                
                {[...Array(pagination.totalPages)].map((_, i) => {
                  const page = i + 1
                  
                  // Show first page, last page, current page, and pages around current page
                  if (
                    page === 1 ||
                    page === pagination.totalPages ||
                    (page >= pagination.page - 1 && page <= pagination.page + 1)
                  ) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => handlePageChange(page)}
                          isActive={page === pagination.page}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  }
                  
                  // Show ellipsis for skipped pages
                  if (
                    (page === 2 && pagination.page > 3) ||
                    (page === pagination.totalPages - 1 && pagination.page < pagination.totalPages - 2)
                  ) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )
                  }
                  
                  return null
                })}
                
                <PaginationItem>
                  <PaginationNext
                    onClick={() => {
                      if (pagination.page < pagination.totalPages) {
                        handlePageChange(pagination.page + 1)
                      }
                    }}
                    className={
                      pagination.page >= pagination.totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </CardFooter>
        </Card>
      </div>
      
      {/* Customer Details Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
          </DialogHeader>
          {selectedCustomer && !customerDetailLoading ? (
            <>
              <div className="space-y-6 py-4">
                {/* Customer Statistics Cards */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Customer Statistics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Total Orders</p>
                            <p className="text-2xl font-bold">{selectedCustomer.statistics.totalOrders}</p>
                          </div>
                          <ShoppingBag className="h-8 w-8 text-muted-foreground/30" />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Total Spent</p>
                            <p className="text-2xl font-bold">€{selectedCustomer.statistics.totalSpent.toFixed(2)}</p>
                          </div>
                          <BarChart4 className="h-8 w-8 text-muted-foreground/30" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                
                {/* Orders by Status */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Orders by Status</h3>
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-center">Quantity</TableHead>
                          <TableHead className="text-right pr-4">Total Value</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>
                            <Badge className="bg-yellow-500">Pending</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            {selectedCustomer.statistics.ordersByStatus.pending.count}
                          </TableCell>
                          <TableCell className="text-right pr-4">
                            €{selectedCustomer.statistics.ordersByStatus.pending.totalValue.toFixed(2)}
                          </TableCell>
                        </TableRow>
                        
                        <TableRow>
                          <TableCell>
                            <Badge className="bg-blue-500">Processing</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            {selectedCustomer.statistics.ordersByStatus.processing.count}
                          </TableCell>
                          <TableCell className="text-right pr-4">
                            €{selectedCustomer.statistics.ordersByStatus.processing.totalValue.toFixed(2)}
                          </TableCell>
                        </TableRow>
                        
                        <TableRow>
                          <TableCell>
                            <Badge className="bg-purple-500">Shipped</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            {selectedCustomer.statistics.ordersByStatus.shipped.count}
                          </TableCell>
                          <TableCell className="text-right pr-4">
                            €{selectedCustomer.statistics.ordersByStatus.shipped.totalValue.toFixed(2)}
                          </TableCell>
                        </TableRow>
                        
                        <TableRow>
                          <TableCell>
                            <Badge className="bg-green-500">Delivered</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            {selectedCustomer.statistics.ordersByStatus.delivered.count}
                          </TableCell>
                          <TableCell className="text-right pr-4">
                            €{selectedCustomer.statistics.ordersByStatus.delivered.totalValue.toFixed(2)}
                          </TableCell>
                        </TableRow>
                        
                        <TableRow>
                          <TableCell>
                            <Badge className="bg-red-500">Cancelled</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            {selectedCustomer.statistics.ordersByStatus.cancelled.count}
                          </TableCell>
                          <TableCell className="text-right pr-4">
                            €{selectedCustomer.statistics.ordersByStatus.cancelled.totalValue.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Loading customer details...</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Password Change Modal */}
      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change Customer Password</DialogTitle>
            <DialogDescription>
              Create a new password for this customer. They will use this to log in.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value)
                  setPasswordError("")
                }}
                placeholder="Enter new password"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  setPasswordError("")
                }}
                placeholder="Confirm new password"
              />
            </div>
            
            {passwordError && (
              <p className="text-sm text-destructive">{passwordError}</p>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPasswordModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePasswordChange}>Change Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}

// Customer Table Component
function CustomerTable({
  customers,
  onViewDetails,
  onChangePassword,
  onToggleBlock,
  loading,
}: {
  customers: Customer[]
  onViewDetails: (id: string) => void
  onChangePassword: (id: string) => void
  onToggleBlock: (id: string, isBlocked: boolean) => void
  loading: boolean
}) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Orders</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Customer Since</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!loading && customers.length > 0 ? (
            customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">{customer.email}</TableCell>
                <TableCell>{customer.phoneNumber}</TableCell>
                <TableCell>{customer.location}</TableCell>
                <TableCell>{customer.totalOrders}</TableCell>
                <TableCell>
                  {customer.isBlocked ? (
                    <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                      <XCircle className="h-3 w-3" />
                      Blocked
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="flex items-center gap-1 text-green-500 w-fit">
                      <CheckCircle className="h-3 w-3" />
                      Active
                    </Badge>
                  )}
                </TableCell>
                <TableCell>{format(new Date(customer.createdAt), "MMM d, yyyy")}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1"
                      onClick={() => onViewDetails(customer.id)}
                    >
                      Details
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={() => onChangePassword(customer.id)}
                    >
                      <Lock className="h-3 w-3" />
                    </Button>
                    
                    <Button
                      variant={customer.isBlocked ? "default" : "destructive"}
                      size="sm"
                      className="h-8"
                      onClick={() => onToggleBlock(customer.id, customer.isBlocked)}
                    >
                      {customer.isBlocked ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                {loading ? (
                  "Loading customers..."
                ) : (
                  "No customers found."
                )}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
