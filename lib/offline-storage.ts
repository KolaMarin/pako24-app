import { openDB, type DBSchema, type IDBPDatabase } from "idb"

interface GlobalShopperDB extends DBSchema {
  orders: {
    key: string
    value: {
      id: string
      productLinks: Array<{
        url: string
        quantity: number
        size: string
        color: string
        additionalInfo: string
      }>
      status: string
      createdAt: string
      updatedAt: string
      synced: boolean
    }
    indexes: { "by-status": string }
  }
  draftOrders: {
    key: string
    value: {
      id: string
      productLinks: Array<{
        url: string
        quantity: number
        size: string
        color: string
        additionalInfo: string
      }>
      lastUpdated: string
    }
  }
  shops: {
    key: string
    value: {
      name: string
      url: string
      logo: string
      category: string
      favorite: boolean
    }
    indexes: { "by-category": string; "by-favorite": boolean }
  }
}

let dbPromise: Promise<IDBPDatabase<GlobalShopperDB>> | null = null

export const initDB = async () => {
  if (!dbPromise) {
    dbPromise = openDB<GlobalShopperDB>("globalShopper", 1, {
      upgrade(db) {
        // Create stores
        const orderStore = db.createObjectStore("orders", { keyPath: "id" })
        orderStore.createIndex("by-status", "status")

        db.createObjectStore("draftOrders", { keyPath: "id" })

        const shopStore = db.createObjectStore("shops", { keyPath: "url" })
        shopStore.createIndex("by-category", "category")
        shopStore.createIndex("by-favorite", "favorite")
      },
    })
  }
  return dbPromise
}

// Orders
export const saveOrder = async (order: GlobalShopperDB["orders"]["value"]) => {
  const db = await initDB()
  return db.put("orders", order)
}

export const getOrders = async () => {
  const db = await initDB()
  return db.getAll("orders")
}

export const getOrderById = async (id: string) => {
  const db = await initDB()
  return db.get("orders", id)
}

// Draft Orders
export const saveDraftOrder = async (draft: GlobalShopperDB["draftOrders"]["value"]) => {
  const db = await initDB()
  return db.put("draftOrders", draft)
}

export const getDraftOrders = async () => {
  const db = await initDB()
  return db.getAll("draftOrders")
}

export const deleteDraftOrder = async (id: string) => {
  const db = await initDB()
  return db.delete("draftOrders", id)
}

// Shops
export const saveShop = async (shop: GlobalShopperDB["shops"]["value"]) => {
  const db = await initDB()
  return db.put("shops", shop)
}

export const getShopsByCategory = async (category: string) => {
  const db = await initDB()
  const index = db.transaction("shops").store.index("by-category")
  return index.getAll(category)
}

export const getFavoriteShops = async () => {
  const db = await initDB()
  const index = db.transaction("shops").store.index("by-favorite")
  return index.getAll(true)
}

// Sync
export const syncWithServer = async () => {
  const db = await initDB()
  const unsyncedOrders = await db.getAllFromIndex("orders", "by-synced", false)

  // In a real implementation, you would send these to your server
  // and update the synced flag when successful
  console.log("Syncing orders:", unsyncedOrders)

  // Mock successful sync
  for (const order of unsyncedOrders) {
    order.synced = true
    await db.put("orders", order)
  }

  return unsyncedOrders.length
}

