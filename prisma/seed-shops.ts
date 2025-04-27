import { PrismaClient } from '@prisma/client'

const shopPrisma = new PrismaClient()

// Define shop categorization
interface ShopData {
  name: string;
  website: string;
  logoUrl?: string;
  active: boolean;
}

const getCategoryForShop = async (shop: ShopData) => {
  // Get category by name
  const getCategory = async (name: string) => {
    try {
      return await shopPrisma.shopCategory.findFirst({
        where: { name }
      });
    } catch (error: any) {
      if (error.code === 'P2021') {
        return null; // Table doesn't exist yet
      }
      throw error;
    }
  };

  const website = shop.website.toLowerCase();
  
  // Same patterns as in the frontend
  if (/asos|zara|hm|mango|uniqlo|stories|cos|arket/i.test(website)) {
    return await getCategory("Fashion & Clothing");
  } else if (/boohoo|prettylittlething|shein|missguided|nastygal/i.test(website)) {
    return await getCategory("Fast Fashion");
  } else if (/marks|selfridges|harrods|johnlewis/i.test(website)) {
    return await getCategory("Department Stores");
  } else if (/sephora|boots|cultbeauty|lookfantastic/i.test(website)) {
    return await getCategory("Beauty & Cosmetics");
  } else {
    return await getCategory("Other");
  }
};

// Initial shops data with logos
const initialShops = [
  { name: "ASOS", website: "https://www.asos.com/", logoUrl: "https://logo.clearbit.com/asos.com", active: true },
  { name: "Zara", website: "https://www.zara.com/uk/", logoUrl: "https://logo.clearbit.com/zara.com", active: true },
  { name: "H&M", website: "https://www2.hm.com/en_gb/", logoUrl: "https://logo.clearbit.com/hm.com", active: true },
  { name: "Mango", website: "https://shop.mango.com/gb", logoUrl: "https://logo.clearbit.com/mango.com", active: true },
  { name: "Uniqlo", website: "https://www.uniqlo.com/uk/", logoUrl: "https://logo.clearbit.com/uniqlo.com", active: true },
  { name: "& Other Stories", website: "https://www.stories.com/", logoUrl: "https://logo.clearbit.com/stories.com", active: true },
  { name: "COS", website: "https://www.cosstores.com/", logoUrl: "https://logo.clearbit.com/cosstores.com", active: true },
  { name: "Arket", website: "https://www.arket.com/", logoUrl: "https://logo.clearbit.com/arket.com", active: true },
  { name: "Boohoo", website: "https://www.boohoo.com/", logoUrl: "https://logo.clearbit.com/boohoo.com", active: true },
  { name: "PrettyLittleThing", website: "https://www.prettylittlething.com/", logoUrl: "https://logo.clearbit.com/prettylittlething.com", active: true },
  { name: "SHEIN", website: "https://www.shein.co.uk/", logoUrl: "https://logo.clearbit.com/shein.com", active: true },
  { name: "Missguided", website: "https://www.missguided.co.uk/", logoUrl: "https://logo.clearbit.com/missguided.co.uk", active: true },
  { name: "Nasty Gal", website: "https://www.nastygal.com/", logoUrl: "https://logo.clearbit.com/nastygal.com", active: true },
  { name: "Marks & Spencer", website: "https://www.marksandspencer.com/", logoUrl: "https://logo.clearbit.com/marksandspencer.com", active: true },
  { name: "Selfridges", website: "https://www.selfridges.com/", logoUrl: "https://logo.clearbit.com/selfridges.com", active: true },
  { name: "Harrods", website: "https://www.harrods.com/", logoUrl: "https://logo.clearbit.com/harrods.com", active: true },
  { name: "John Lewis", website: "https://www.johnlewis.com/", logoUrl: "https://logo.clearbit.com/johnlewis.com", active: true },
  { name: "Sephora", website: "https://www.sephora.com/", logoUrl: "https://logo.clearbit.com/sephora.com", active: true },
  { name: "Boots", website: "https://www.boots.com/", logoUrl: "https://logo.clearbit.com/boots.com", active: true },
  { name: "Cult Beauty", website: "https://www.cultbeauty.co.uk/", logoUrl: "https://logo.clearbit.com/cultbeauty.co.uk", active: true },
  { name: "Look Fantastic", website: "https://www.lookfantastic.com/", logoUrl: "https://logo.clearbit.com/lookfantastic.com", active: true },
]

async function main() {
  console.log('Starting to seed shops...')

  try {
    // Try to check if categories exist
    try {
      const categoryExists = await shopPrisma.shopCategory.findFirst({});
      if (!categoryExists) {
        console.log('No categories found, but will continue to create shops without categories.');
      }
    } catch (error: any) {
      if (error.code === 'P2021') {
        console.log('Categories table does not exist yet, but will continue to create shops without categories.');
      } else {
        throw error;
      }
    }

    // For each shop in the initial data
    for (const shop of initialShops) {
      try {
        // Check if the shop already exists (by website)
        const existingShop = await shopPrisma.shop.findFirst({
          where: { website: shop.website }
        });

        let category = null;
        try {
          category = await getCategoryForShop(shop);
        } catch (error) {
          console.log(`Could not get category for ${shop.name} due to error, will create without category.`);
        }
        
        const shopData = {
          ...shop,
          ...(category ? { categoryId: category.id } : {})
        };

        if (!existingShop) {
          // Create the shop if it doesn't exist, with category if available
          await shopPrisma.shop.create({
            data: shopData
          });
          console.log(`Created shop: ${shop.name}${category ? ` in category ${category.name}` : ' without category'}`);
        } else {
          // Update existing shop with category if available
          await shopPrisma.shop.update({
            where: { id: existingShop.id },
            data: {
              ...(category ? { categoryId: category.id } : {}),
              logoUrl: shop.logoUrl || existingShop.logoUrl
            }
          });
          console.log(`Updated shop: ${shop.name}${category ? ` to category ${category.name}` : ' without category'}`);
        }
      } catch (error: any) {
        // Skip if tables don't exist yet
        if (error.code === 'P2021') {
          console.log(`Could not process shop ${shop.name} as required tables don't exist yet.`);
        } else {
          console.error(`Error processing shop ${shop.name}:`, error);
        }
      }
    }

    console.log('Shops seeding completed.');
  } catch (error) {
    console.error('Error seeding shops:', error);
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await shopPrisma.$disconnect()
  })

module.exports = main
