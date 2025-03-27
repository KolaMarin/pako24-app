import { v4 as uuidv4 } from "uuid"
import bcrypt from "bcryptjs"

interface ProductLink {
  id: string
  url: string
  quantity: number
  size: string
  color: string
  priceGBP: number
  priceEUR: number
  customsFee: number
  transportFee: number
}

interface Order {
  id: string
  userId: string
  productLinks: ProductLink[]
  additionalInfo?: string
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED"
  createdAt: Date
  updatedAt: Date
  totalPriceGBP: number
  totalPriceEUR: number
  totalCustomsFee: number
  totalTransportFee: number
}

interface User {
  id: string
  email: string
  phoneNumber: string
  password: string
  location: string
}

class Store {
  private orders: Order[] = []
  private users: User[] = []

  constructor() {
    // Add a default user for testing
    const defaultUser = this.addUser({
      email: "user@example.com",
      phoneNumber: "+355123456789",
      password: "password123",
      location: "Tirana, Albania",
    })

    // Add mock orders with multiple products
    this.orders = [
      {
        id: uuidv4(),
        userId: defaultUser.id,
        productLinks: [
          {
            id: uuidv4(),
            url: "https://www.amazon.co.uk/Nike-Training-Shoes",
            quantity: 2,
            size: "42",
            color: "Black/White",
            priceGBP: 89.99,
            priceEUR: 103.49,
            customsFee: 18,
            transportFee: 5,
          },
          {
            id: uuidv4(),
            url: "https://www.amazon.co.uk/Adidas-Running-Shorts",
            quantity: 3,
            size: "M",
            color: "Navy",
            priceGBP: 24.99,
            priceEUR: 28.74,
            customsFee: 5,
            transportFee: 2,
          },
          {
            id: uuidv4(),
            url: "https://www.amazon.co.uk/Sports-Water-Bottle",
            quantity: 1,
            size: "1L",
            color: "Blue",
            priceGBP: 15.99,
            priceEUR: 18.39,
            customsFee: 3.2,
            transportFee: 1,
          },
          {
            id: uuidv4(),
            url: "https://www.amazon.co.uk/Compression-Socks",
            quantity: 4,
            size: "L",
            color: "Black",
            priceGBP: 12.99,
            priceEUR: 14.94,
            customsFee: 2.6,
            transportFee: 1,
          },
          {
            id: uuidv4(),
            url: "https://www.amazon.co.uk/Sports-Backpack",
            quantity: 1,
            size: "One Size",
            color: "Grey",
            priceGBP: 45.99,
            priceEUR: 52.89,
            customsFee: 9.2,
            transportFee: 3,
          },
        ],
        status: "PENDING",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
        totalPriceGBP: 0, // Will be calculated
        totalPriceEUR: 0, // Will be calculated
        totalCustomsFee: 0, // Will be calculated
        totalTransportFee: 0, // Will be calculated
      },
      {
        id: uuidv4(),
        userId: defaultUser.id,
        productLinks: [
          {
            id: uuidv4(),
            url: "https://www.amazon.co.uk/Gaming-Laptop",
            quantity: 1,
            size: '15.6"',
            color: "Black",
            priceGBP: 899.99,
            priceEUR: 1034.99,
            customsFee: 180,
            transportFee: 20,
          },
          {
            id: uuidv4(),
            url: "https://www.amazon.co.uk/Wireless-Mouse",
            quantity: 2,
            size: "Standard",
            color: "Black/RGB",
            priceGBP: 45.99,
            priceEUR: 52.89,
            customsFee: 9.2,
            transportFee: 3,
          },
          {
            id: uuidv4(),
            url: "https://www.amazon.co.uk/Mechanical-Keyboard",
            quantity: 1,
            size: "Full",
            color: "White",
            priceGBP: 129.99,
            priceEUR: 149.49,
            customsFee: 26,
            transportFee: 8,
          },
          {
            id: uuidv4(),
            url: "https://www.amazon.co.uk/Gaming-Headset",
            quantity: 1,
            size: "One Size",
            color: "Black/Red",
            priceGBP: 79.99,
            priceEUR: 91.99,
            customsFee: 16,
            transportFee: 5,
          },
        ],
        status: "PROCESSING",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
        totalPriceGBP: 0,
        totalPriceEUR: 0,
        totalCustomsFee: 0,
        totalTransportFee: 0,
      },
      {
        id: uuidv4(),
        userId: defaultUser.id,
        productLinks: [
          {
            id: uuidv4(),
            url: "https://www.amazon.co.uk/Perfume-Designer",
            quantity: 2,
            size: "100ml",
            color: "N/A",
            priceGBP: 85.99,
            priceEUR: 98.89,
            customsFee: 17.2,
            transportFee: 5,
          },
          {
            id: uuidv4(),
            url: "https://www.amazon.co.uk/Makeup-Palette",
            quantity: 1,
            size: "Standard",
            color: "Neutral",
            priceGBP: 45.99,
            priceEUR: 52.89,
            customsFee: 9.2,
            transportFee: 3,
          },
          {
            id: uuidv4(),
            url: "https://www.amazon.co.uk/Skincare-Set",
            quantity: 1,
            size: "Full Set",
            color: "N/A",
            priceGBP: 129.99,
            priceEUR: 149.49,
            customsFee: 26,
            transportFee: 8,
          },
          {
            id: uuidv4(),
            url: "https://www.amazon.co.uk/Hair-Styling-Tools",
            quantity: 1,
            size: "Professional",
            color: "Rose Gold",
            priceGBP: 199.99,
            priceEUR: 229.99,
            customsFee: 40,
            transportFee: 10,
          },
          {
            id: uuidv4(),
            url: "https://www.amazon.co.uk/Luxury-Brushes",
            quantity: 3,
            size: "Set",
            color: "Rose Gold",
            priceGBP: 29.99,
            priceEUR: 34.49,
            customsFee: 6,
            transportFee: 2,
          },
        ],
        status: "SHIPPED",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
        totalPriceGBP: 0,
        totalPriceEUR: 0,
        totalCustomsFee: 0,
        totalTransportFee: 0,
      },
    ]

    // Calculate totals for all mock orders
    this.orders.forEach((order) => this.recalculateOrderTotal(order))
  }

  getOrders(): Order[] {
    return this.orders
  }

  getOrdersByUserId(userId: string): Order[] {
    return this.orders.filter((order) => order.userId === userId)
  }

  getOrderById(id: string): Order | undefined {
    return this.orders.find((order) => order.id === id)
  }

  addOrder(order: Omit<Order, "id" | "createdAt" | "updatedAt">): Order {
    const newOrder: Order = {
      ...order,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.orders.push(newOrder)
    return newOrder
  }

  updateOrderStatus(id: string, status: Order["status"]): Order | undefined {
    const order = this.orders.find((o) => o.id === id)
    if (order) {
      order.status = status
      order.updatedAt = new Date()
    }
    return order
  }

  updateProductDetails(orderId: string, productId: string, updatedProduct: Partial<ProductLink>): Order | undefined {
    const order = this.orders.find((o) => o.id === orderId)
    if (order) {
      const productIndex = order.productLinks.findIndex((p) => p.id === productId)
      if (productIndex !== -1) {
        order.productLinks[productIndex] = { ...order.productLinks[productIndex], ...updatedProduct }
        this.recalculateOrderTotal(order)
        order.updatedAt = new Date()
      }
    }
    return order
  }

  deleteProductFromOrder(orderId: string, productId: string): Order | undefined {
    const order = this.orders.find((o) => o.id === orderId)
    if (order) {
      order.productLinks = order.productLinks.filter((p) => p.id !== productId)
      this.recalculateOrderTotal(order)
      order.updatedAt = new Date()
    }
    return order
  }

  recalculateOrderTotal(order: Order) {
    let totalPriceGBP = 0
    let totalPriceEUR = 0
    let totalCustomsFee = 0
    let totalTransportFee = 0

    for (const product of order.productLinks) {
      totalPriceGBP += product.priceGBP * product.quantity
      totalPriceEUR += product.priceEUR * product.quantity
      totalCustomsFee += product.customsFee * product.quantity
      totalTransportFee += product.transportFee
    }

    order.totalPriceGBP = totalPriceGBP + totalCustomsFee + totalTransportFee
    order.totalPriceEUR = totalPriceEUR + (totalCustomsFee + totalTransportFee) * 1.15 // Assuming 1 GBP = 1.15 EUR
    order.totalCustomsFee = totalCustomsFee
    order.totalTransportFee = totalTransportFee
  }

  cancelOrder(id: string, userId: string): boolean {
    const order = this.orders.find((o) => o.id === id && o.userId === userId)
    if (order && order.status === "PENDING") {
      order.status = "CANCELLED"
      order.updatedAt = new Date()
      return true
    }
    return false
  }

  addUser(user: Omit<User, "id">): User {
    const hashedPassword = bcrypt.hashSync(user.password, 10)
    const newUser: User = {
      ...user,
      id: uuidv4(),
      password: hashedPassword,
    }
    this.users.push(newUser)
    return newUser
  }

  getUserByEmail(email: string): User | undefined {
    return this.users.find((user) => user.email === email)
  }

  getUserByPhoneNumber(phoneNumber: string): User | undefined {
    return this.users.find((user) => user.phoneNumber === phoneNumber)
  }

  validateUser(email: string, password: string): boolean {
    const user = this.getUserByEmail(email)
    if (user) {
      return bcrypt.compareSync(password, user.password)
    }
    return false
  }

  updateUserPassword(email: string, oldPassword: string, newPassword: string): boolean {
    const user = this.getUserByEmail(email)
    if (user && bcrypt.compareSync(oldPassword, user.password)) {
      user.password = bcrypt.hashSync(newPassword, 10)
      return true
    }
    return false
  }
  getUserById(id: string): User | undefined {
    return this.users.find((user) => user.id === id)
  }

  updateProductPrice(orderId: string, productId: string, priceGBP: number, priceEUR: number): Order | undefined {
    const order = this.orders.find((o) => o.id === orderId)
    if (order) {
      const productIndex = order.productLinks.findIndex((p) => p.id === productId)
      if (productIndex !== -1) {
        order.productLinks[productIndex].priceGBP = priceGBP
        order.productLinks[productIndex].priceEUR = priceEUR
        this.recalculateOrderTotal(order)
        order.updatedAt = new Date()
      }
    }
    return order
  }
}

export const store = new Store()

