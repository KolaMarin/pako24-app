"use client"

import { useState, useEffect } from "react"
import AdminLayout from "@/components/admin-layout"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Search, Plus, Edit, Trash2, UserPlus, Shield, ShieldAlert } from "lucide-react"
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
import { format } from "date-fns"

interface Admin {
  id: string
  email: string
  role: "ADMIN" | "SUPER_ADMIN" | "MANAGER"
  createdAt: string
  updatedAt: string
}

export default function AdminUsersPage() {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentAdmin, setCurrentAdmin] = useState<Admin | null>(null)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    role: "ADMIN",
  })
  const [formErrors, setFormErrors] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  })

  useEffect(() => {
    fetchAdmins()
  }, [])

  const fetchAdmins = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/users")
      if (response.ok) {
        const data = await response.json()
        setAdmins(data)
      } else {
        throw new Error("Failed to fetch admin users")
      }
    } catch (error) {
      toast({
        title: "Gabim",
        description: "Marrja e përdoruesve dështoi. Ju lutemi provoni përsëri.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    let valid = true
    const errors = {
      email: "",
      password: "",
      confirmPassword: "",
    }

    // Email validation
    if (!formData.email) {
      errors.email = "Email-i është i detyrueshëm"
      valid = false
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email-i nuk është i vlefshëm"
      valid = false
    }

    // Password validation (only for adding new admin or changing password)
    if (isAddDialogOpen || (isEditDialogOpen && formData.password)) {
      if (!formData.password && isAddDialogOpen) {
        errors.password = "Fjalëkalimi është i detyrueshëm"
        valid = false
      } else if (formData.password && formData.password.length < 8) {
        errors.password = "Fjalëkalimi duhet të ketë të paktën 8 karaktere"
        valid = false
      }

      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = "Fjalëkalimet nuk përputhen"
        valid = false
      }
    }

    setFormErrors(errors)
    return valid
  }

  const handleAddAdmin = async () => {
    if (!validateForm()) return

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      })
      
      if (response.ok) {
        const newAdmin = await response.json()
        setAdmins([...admins, newAdmin])
        setIsAddDialogOpen(false)
        resetForm()
        toast({
          title: "Sukses",
          description: "Përdoruesi u shtua me sukses.",
        })
      } else {
        const errorData = await response.json()
        toast({
          title: "Gabim",
          description: errorData.message || "Shtimi i përdoruesit dështoi.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Gabim",
        description: "Shtimi i përdoruesit dështoi. Ju lutemi provoni përsëri.",
        variant: "destructive",
      })
    }
  }

  const handleEditAdmin = async () => {
    if (!validateForm() || !currentAdmin) return

    const updateData: any = {
      email: formData.email,
      role: formData.role,
    }

    // Only include password if it was changed
    if (formData.password) {
      updateData.password = formData.password
    }

    try {
      const response = await fetch(`/api/admin/users/${currentAdmin.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      })
      
      if (response.ok) {
        const updatedAdmin = await response.json()
        setAdmins(admins.map((admin) => (admin.id === updatedAdmin.id ? updatedAdmin : admin)))
        setIsEditDialogOpen(false)
        resetForm()
        toast({
          title: "Sukses",
          description: "Përdoruesi u përditësua me sukses.",
        })
      } else {
        const errorData = await response.json()
        toast({
          title: "Gabim",
          description: errorData.message || "Përditësimi i përdoruesit dështoi.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Gabim",
        description: "Përditësimi i përdoruesit dështoi. Ju lutemi provoni përsëri.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteAdmin = async () => {
    if (!currentAdmin) return

    try {
      const response = await fetch(`/api/admin/users/${currentAdmin.id}`, {
        method: "DELETE",
      })
      
      if (response.ok) {
        setAdmins(admins.filter((admin) => admin.id !== currentAdmin.id))
        setIsDeleteDialogOpen(false)
        toast({
          title: "Sukses",
          description: "Përdoruesi u fshi me sukses.",
        })
      } else {
        const errorData = await response.json()
        toast({
          title: "Gabim",
          description: errorData.message || "Fshirja e përdoruesit dështoi.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Gabim",
        description: "Fshirja e përdoruesit dështoi. Ju lutemi provoni përsëri.",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (admin: Admin) => {
    setCurrentAdmin(admin)
    setFormData({
      email: admin.email,
      password: "",
      confirmPassword: "",
      role: admin.role,
    })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (admin: Admin) => {
    setCurrentAdmin(admin)
    setIsDeleteDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
      role: "ADMIN",
    })
    setFormErrors({
      email: "",
      password: "",
      confirmPassword: "",
    })
    setCurrentAdmin(null)
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return <ShieldAlert className="h-4 w-4 text-red-500" />
      case "ADMIN":
        return <Shield className="h-4 w-4 text-blue-500" />
      case "MANAGER":
        return <UserPlus className="h-4 w-4 text-green-500" />
      default:
        return null
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "Super Admin"
      case "ADMIN":
        return "Admin"
      case "MANAGER":
        return "Menaxher"
      default:
        return role
    }
  }

  const filteredAdmins = admins.filter((admin) =>
    admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
                <CardTitle>Menaxhimi i Përdoruesve</CardTitle>
                <CardDescription>
                  Menaxhoni përdoruesit administratorë dhe të drejtat e tyre
                </CardDescription>
              </div>
              <div className="flex gap-4">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Kërko përdorues..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-[200px]"
                  />
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Shto Përdorues
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Shto Përdorues të Ri</DialogTitle>
                      <DialogDescription>
                        Plotësoni të dhënat për të shtuar një përdorues të ri administrativ.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="email@example.com"
                        />
                        {formErrors.email && (
                          <p className="text-sm text-red-500">{formErrors.email}</p>
                        )}
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="password">Fjalëkalimi</Label>
                        <Input
                          id="password"
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                        {formErrors.password && (
                          <p className="text-sm text-red-500">{formErrors.password}</p>
                        )}
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="confirmPassword">Konfirmo Fjalëkalimin</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        />
                        {formErrors.confirmPassword && (
                          <p className="text-sm text-red-500">{formErrors.confirmPassword}</p>
                        )}
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="role">Roli</Label>
                        <Select
                          value={formData.role}
                          onValueChange={(value) => setFormData({ ...formData, role: value })}
                        >
                          <SelectTrigger id="role">
                            <SelectValue placeholder="Zgjidhni rolin" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                            <SelectItem value="MANAGER">Menaxher</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        Anulo
                      </Button>
                      <Button onClick={handleAddAdmin}>Shto</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50 text-muted-foreground">
                    <th className="h-10 px-4 text-left font-medium">Email</th>
                    <th className="h-10 px-4 text-left font-medium">Roli</th>
                    <th className="h-10 px-4 text-left font-medium">Data e Krijimit</th>
                    <th className="h-10 px-4 text-right font-medium">Veprime</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAdmins.map((admin) => (
                    <tr key={admin.id} className="border-b">
                      <td className="p-4">{admin.email}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {getRoleIcon(admin.role)}
                          <span>{getRoleLabel(admin.role)}</span>
                        </div>
                      </td>
                      <td className="p-4">{format(new Date(admin.createdAt), "dd/MM/yyyy")}</td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEditDialog(admin)}>
                            <Edit className="h-4 w-4 mr-1" />
                            Ndrysho
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => openDeleteDialog(admin)}>
                            <Trash2 className="h-4 w-4 mr-1" />
                            Fshi
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredAdmins.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground mb-4">Nuk u gjet asnjë përdorues</p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Shto Përdorues të Ri
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Ndrysho Përdoruesin</DialogTitle>
              <DialogDescription>
                Ndryshoni të dhënat e përdoruesit.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                {formErrors.email && (
                  <p className="text-sm text-red-500">{formErrors.email}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-password">Fjalëkalimi i Ri (lëreni bosh për të mos e ndryshuar)</Label>
                <Input
                  id="edit-password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                {formErrors.password && (
                  <p className="text-sm text-red-500">{formErrors.password}</p>
                )}
              </div>
              {formData.password && (
                <div className="grid gap-2">
                  <Label htmlFor="edit-confirmPassword">Konfirmo Fjalëkalimin</Label>
                  <Input
                    id="edit-confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  />
                  {formErrors.confirmPassword && (
                    <p className="text-sm text-red-500">{formErrors.confirmPassword}</p>
                  )}
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="edit-role">Roli</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger id="edit-role">
                    <SelectValue placeholder="Zgjidhni rolin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="MANAGER">Menaxher</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Anulo
              </Button>
              <Button onClick={handleEditAdmin}>Ruaj Ndryshimet</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Konfirmo Fshirjen</DialogTitle>
              <DialogDescription>
                A jeni i sigurt që dëshironi të fshini përdoruesin "{currentAdmin?.email}"? Ky veprim nuk mund të kthehet.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Anulo
              </Button>
              <Button variant="destructive" onClick={handleDeleteAdmin}>
                Fshi
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}
