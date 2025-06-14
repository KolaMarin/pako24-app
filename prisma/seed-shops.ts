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
  const name = shop.name.toLowerCase();
  
  // Fashion & Luxury Clothes
  if (/net-a-porter|mrporter|farfetch|luisaviaroma|matches|ssense|mytheresa|outnet|moda-operandi|ruela|asos|zara|hm|uniqlo|cos|stories|arket|massimo|gucci|louis-vuitton|prada|chanel|dior|balenciaga|versace|ralph|burberry|fendi|bottega|revolve|reformation|tedbaker|tkmaxx|marksandspencer|selfridges|johnlewis|harrods|bicester/i.test(website) || 
      /zara|gucci|prada|chanel|dior|balenciaga|versace|burberry|fendi|bottega|louis vuitton|ralph lauren|net-a-porter|mr porter|farfetch|ssense|mytheresa|moda operandi|rue la la|massimo dutti|revolve|reformation|ted baker|tk maxx|marks.*spencer|selfridges|john lewis|harrods|bicester village/i.test(name)) {
    return await getCategory("Fashion & Luxury Clothes");
  }
  
  // Beauty & Makeup
  else if (/sephora|ulta|cultbeauty|spacenk|lookfantastic|beautybay|beautylish|dermstore|adore|nykaa|ordinary|glossier|fenty|rare|kkw|huda|urban|too-faced|mac|charlotte/i.test(website) ||
           /sephora|ulta|cult beauty|space nk|look fantastic|beauty bay|beautylish|dermstore|adore beauty|nykaa|glossier|fenty beauty|rare beauty|kkw beauty|huda beauty|urban decay|too faced|mac cosmetics|charlotte tilbury/i.test(name)) {
    return await getCategory("Beauty & Makeup");
  }
  
  // Sports & Fitness
  else if (/dick|rei|patagonia|nike|adidas|under-armour|lululemon|athleta|reebok|puma|peloton|nordic|bowflex|nautilus|life-fitness|sportsdirect|jdsports/i.test(website) ||
           /nike|adidas|under armour|lululemon|athleta|reebok|puma|peloton|nordictrack|bowflex|nautilus|life fitness|dick|rei|patagonia|sports direct|jd sports/i.test(name)) {
    return await getCategory("Sports & Fitness");
  }
  
  // Specialty & Vintage
  else if (/realreal|vestiaire|what-goes|rebag|fashionphile|stockx|goat/i.test(website) ||
           /realreal|vestiaire|what goes around|rebag|fashionphile|stockx|goat/i.test(name)) {
    return await getCategory("Specialty & Vintage");
  }
  
  // Health & Vitamins
  else if (/iherb|vitacost|swanson|thrive|life-extension|now|garden-of-life|nature|optimum|vital|cvs|walgreens|rite|boots|holland|gnc|vitamin/i.test(website) ||
           /iherb|vitacost|swanson|thrive market|life extension|now foods|garden of life|nature made|optimum nutrition|vital proteins|cvs|walgreens|rite aid|boots|holland|gnc|vitamin shoppe/i.test(name)) {
    return await getCategory("Health & Vitamins");
  }
  
  // Toys & Baby
  else if (/toys|lego|hasbro|mattel|fisher|melissa|fat-brain|learning|buy-buy|carter|gap-kids|pottery-barn-kids|crate-kids|babylist/i.test(website) ||
           /toys|lego|hasbro|mattel|fisher-price|melissa|fat brain|learning resources|buy buy baby|carter|gap kids|pottery barn kids|crate.*kids|babylist/i.test(name)) {
    return await getCategory("Toys & Baby");
  }
  
  // Pet Supplies
  else if (/petco|petsmart|chewy|bark|blue-buffalo/i.test(website) ||
           /petco|petsmart|chewy|bark|blue buffalo/i.test(name)) {
    return await getCategory("Pet Supplies");
  }
  
  // Electronics & Technology
  else if (/best-buy|amazon|newegg|bh|micro|adorama|tiger|fry|gamestop|apple|samsung|dell|hp|lenovo|asus|msi|corsair|razer|logitech|sony/i.test(website) ||
           /best buy|amazon|newegg|b&h|micro center|adorama|tigerdirect|fry|gamestop|apple|samsung|dell|hp|lenovo|asus|msi|corsair|razer|logitech|sony/i.test(name)) {
    return await getCategory("Electronics & Technology");
  }
  
  // Home & Furniture
  else if (/ikea|wayfair|west-elm|pottery-barn|cb2|article|overstock|jayson|world-market|homegoods/i.test(website) ||
           /ikea|wayfair|west elm|pottery barn|cb2|article|overstock|jayson|world market|homegoods/i.test(name)) {
    return await getCategory("Home & Furniture");
  }
  
  // Jewelry & Watches
  else if (/tiffany|cartier|harry-winston|david-yurman|pandora|swarovski|blue-nile|james-allen|rolex|omega|tag|fossil|casio|apple-watch/i.test(website) ||
           /tiffany|cartier|harry winston|david yurman|pandora|swarovski|blue nile|james allen|rolex|omega|tag heuer|fossil|casio|apple watch/i.test(name)) {
    return await getCategory("Jewelry & Watches");
  }
  
  // Automotive
  else if (/autozone|oreilly|advance|napa|rockauto|summit|tire-rack/i.test(website) ||
           /autozone|o'reilly|advance auto|napa|rockauto|summit racing|tire rack/i.test(name)) {
    return await getCategory("Automotive");
  }
  
  // Books & Entertainment
  else if (/amazon-books|barnes|book-depository|waterstones|powell|blackwell|wordery|playstation|xbox|nintendo/i.test(website) ||
           /amazon books|barnes|book depository|waterstones|powell|blackwell|wordery|playstation|xbox|nintendo/i.test(name)) {
    return await getCategory("Books & Entertainment");
  }
  
  // Garden & Outdoor
  else if (/frontgate|white-stores|luxus|gardner|jenni|llbean|sundays|soho-home/i.test(website) ||
           /frontgate|white stores|luxus|gardner white|jenni kayne|l\.l\.bean|sundays|soho home/i.test(name)) {
    return await getCategory("Garden & Outdoor");
  }
  
  // Food & Beverages
  else if (/williams|dean|whole|fresh|thrive|murray|goldbelly|harry|omaha|blue-apron|wine|total-wine|vivino|whisky|master|reserve/i.test(website) ||
           /williams sonoma|dean.*deluca|whole foods|fresh direct|thrive market|murray|goldbelly|harry.*david|omaha steaks|blue apron|wine\.com|total wine|vivino|whisky exchange|master of malt|reservebar/i.test(name)) {
    return await getCategory("Food & Beverages");
  }
  
  else {
    return await getCategory("Fashion & Luxury Clothes"); // Default fallback
  }
};

// Comprehensive shops data organized by category
const allShops = [
  // FASHION & LUXURY CLOTHES
  { name: "Net-A-Porter", website: "https://www.net-a-porter.com/", logoUrl: "https://logo.clearbit.com/net-a-porter.com", active: true },
  { name: "Mr Porter", website: "https://www.mrporter.com/", logoUrl: "https://logo.clearbit.com/mrporter.com", active: true },
  { name: "Farfetch", website: "https://www.farfetch.com/", logoUrl: "https://logo.clearbit.com/farfetch.com", active: true },
  { name: "LuisaViaRoma", website: "https://www.luisaviaroma.com/", logoUrl: "https://logo.clearbit.com/luisaviaroma.com", active: true },
  { name: "Matches Fashion", website: "https://www.matchesfashion.com/", logoUrl: "https://logo.clearbit.com/matchesfashion.com", active: true },
  { name: "SSENSE", website: "https://www.ssense.com/", logoUrl: "https://logo.clearbit.com/ssense.com", active: true },
  { name: "MyTheresa", website: "https://www.mytheresa.com/", logoUrl: "https://logo.clearbit.com/mytheresa.com", active: true },
  { name: "The Outnet", website: "https://www.theoutnet.com/", logoUrl: "https://logo.clearbit.com/theoutnet.com", active: true },
  { name: "Moda Operandi", website: "https://modaoperandi.com/", logoUrl: "https://logo.clearbit.com/modaoperandi.com", active: true },
  { name: "Rue La La", website: "https://www.ruelala.com/", logoUrl: "https://logo.clearbit.com/ruelala.com", active: true },
  { name: "ASOS", website: "https://www.asos.com/", logoUrl: "https://logo.clearbit.com/asos.com", active: true },
  { name: "Zara", website: "https://www.zara.com/", logoUrl: "https://logo.clearbit.com/zara.com", active: true },
  { name: "H&M", website: "https://www2.hm.com/", logoUrl: "https://logo.clearbit.com/hm.com", active: true },
  { name: "Uniqlo", website: "https://www.uniqlo.com/", logoUrl: "https://logo.clearbit.com/uniqlo.com", active: true },
  { name: "COS", website: "https://www.cosstores.com/", logoUrl: "https://logo.clearbit.com/cosstores.com", active: true },
  { name: "& Other Stories", website: "https://www.stories.com/", logoUrl: "https://logo.clearbit.com/stories.com", active: true },
  { name: "Arket", website: "https://www.arket.com/", logoUrl: "https://logo.clearbit.com/arket.com", active: true },
  { name: "Massimo Dutti", website: "https://www.massimodutti.com/", logoUrl: "https://logo.clearbit.com/massimodutti.com", active: true },
  { name: "Gucci", website: "https://www.gucci.com/", logoUrl: "https://logo.clearbit.com/gucci.com", active: true },
  { name: "Louis Vuitton", website: "https://www.louisvuitton.com/", logoUrl: "https://logo.clearbit.com/louisvuitton.com", active: true },
  { name: "Prada", website: "https://www.prada.com/", logoUrl: "https://logo.clearbit.com/prada.com", active: true },
  { name: "Chanel", website: "https://www.chanel.com/", logoUrl: "https://logo.clearbit.com/chanel.com", active: true },
  { name: "Dior", website: "https://www.dior.com/", logoUrl: "https://logo.clearbit.com/dior.com", active: true },
  { name: "Balenciaga", website: "https://www.balenciaga.com/", logoUrl: "https://logo.clearbit.com/balenciaga.com", active: true },
  { name: "Versace", website: "https://www.versace.com/", logoUrl: "https://logo.clearbit.com/versace.com", active: true },
  { name: "Ralph Lauren", website: "https://www.ralphlauren.com/", logoUrl: "https://logo.clearbit.com/ralphlauren.com", active: true },
  { name: "Burberry", website: "https://www.burberry.com/", logoUrl: "https://logo.clearbit.com/burberry.com", active: true },
  { name: "Fendi", website: "https://www.fendi.com/", logoUrl: "https://logo.clearbit.com/fendi.com", active: true },
  { name: "Bottega Veneta", website: "https://www.bottegaveneta.com/", logoUrl: "https://logo.clearbit.com/bottegaveneta.com", active: true },
  { name: "Ferragamo", website: "https://www.ferragamo.com/", logoUrl: "https://logo.clearbit.com/ferragamo.com", active: true },
  { name: "Revolve", website: "https://www.revolve.com/", logoUrl: "https://logo.clearbit.com/revolve.com", active: true },
  { name: "Reformation", website: "https://www.thereformation.com/", logoUrl: "https://logo.clearbit.com/thereformation.com", active: true },
  { name: "Ted Baker", website: "https://www.tedbaker.com/", logoUrl: "https://logo.clearbit.com/tedbaker.com", active: true },
  { name: "TK Maxx", website: "https://www.tkmaxx.com/", logoUrl: "https://logo.clearbit.com/tkmaxx.com", active: true },
  { name: "Marks & Spencer", website: "https://www.marksandspencer.com/", logoUrl: "https://logo.clearbit.com/marksandspencer.com", active: true },
  { name: "Selfridges", website: "https://www.selfridges.com/", logoUrl: "https://logo.clearbit.com/selfridges.com", active: true },
  { name: "John Lewis", website: "https://www.johnlewis.com/", logoUrl: "https://logo.clearbit.com/johnlewis.com", active: true },
  { name: "Harrods", website: "https://www.harrods.com/", logoUrl: "https://logo.clearbit.com/harrods.com", active: true },
  { name: "Bicester Village", website: "https://www.bicestervillage.com/", logoUrl: "https://logo.clearbit.com/bicestervillage.com", active: true },

  // BEAUTY & MAKEUP
  { name: "Sephora", website: "https://www.sephora.com/", logoUrl: "https://logo.clearbit.com/sephora.com", active: true },
  { name: "Ulta Beauty", website: "https://www.ulta.com/", logoUrl: "https://logo.clearbit.com/ulta.com", active: true },
  { name: "Cult Beauty", website: "https://www.cultbeauty.co.uk/", logoUrl: "https://logo.clearbit.com/cultbeauty.co.uk", active: true },
  { name: "Space NK", website: "https://www.spacenk.com/", logoUrl: "https://logo.clearbit.com/spacenk.com", active: true },
  { name: "LookFantastic", website: "https://www.lookfantastic.com/", logoUrl: "https://logo.clearbit.com/lookfantastic.com", active: true },
  { name: "Beauty Bay", website: "https://www.beautybay.com/", logoUrl: "https://logo.clearbit.com/beautybay.com", active: true },
  { name: "Beautylish", website: "https://www.beautylish.com/", logoUrl: "https://logo.clearbit.com/beautylish.com", active: true },
  { name: "Dermstore", website: "https://www.dermstore.com/", logoUrl: "https://logo.clearbit.com/dermstore.com", active: true },
  { name: "Adore Beauty", website: "https://www.adorebeauty.com.au/", logoUrl: "https://logo.clearbit.com/adorebeauty.com.au", active: true },
  { name: "Nykaa", website: "https://www.nykaa.com/", logoUrl: "https://logo.clearbit.com/nykaa.com", active: true },
  { name: "The Ordinary", website: "https://theordinary.com/", logoUrl: "https://logo.clearbit.com/theordinary.com", active: true },
  { name: "Glossier", website: "https://www.glossier.com/", logoUrl: "https://logo.clearbit.com/glossier.com", active: true },
  { name: "Fenty Beauty", website: "https://fentybeauty.com/", logoUrl: "https://logo.clearbit.com/fentybeauty.com", active: true },
  { name: "Rare Beauty", website: "https://rarebeauty.com/", logoUrl: "https://logo.clearbit.com/rarebeauty.com", active: true },
  { name: "KKW Beauty", website: "https://kkwbeauty.com/", logoUrl: "https://logo.clearbit.com/kkwbeauty.com", active: true },
  { name: "Huda Beauty", website: "https://hudabeauty.com/", logoUrl: "https://logo.clearbit.com/hudabeauty.com", active: true },
  { name: "Urban Decay", website: "https://www.urbandecay.com/", logoUrl: "https://logo.clearbit.com/urbandecay.com", active: true },
  { name: "Too Faced", website: "https://www.toofaced.com/", logoUrl: "https://logo.clearbit.com/toofaced.com", active: true },
  { name: "MAC Cosmetics", website: "https://www.maccosmetics.com/", logoUrl: "https://logo.clearbit.com/maccosmetics.com", active: true },
  { name: "Charlotte Tilbury", website: "https://www.charlottetilbury.com/", logoUrl: "https://logo.clearbit.com/charlottetilbury.com", active: true },

  // SPORTS & FITNESS
  { name: "Dick's Sporting Goods", website: "https://www.dickssportinggoods.com/", logoUrl: "https://logo.clearbit.com/dickssportinggoods.com", active: true },
  { name: "REI", website: "https://www.rei.com/", logoUrl: "https://logo.clearbit.com/rei.com", active: true },
  { name: "Patagonia", website: "https://www.patagonia.com/", logoUrl: "https://logo.clearbit.com/patagonia.com", active: true },
  { name: "Nike", website: "https://www.nike.com/", logoUrl: "https://logo.clearbit.com/nike.com", active: true },
  { name: "Adidas", website: "https://www.adidas.com/", logoUrl: "https://logo.clearbit.com/adidas.com", active: true },
  { name: "Under Armour", website: "https://www.underarmour.com/", logoUrl: "https://logo.clearbit.com/underarmour.com", active: true },
  { name: "Lululemon", website: "https://www.lululemon.com/", logoUrl: "https://logo.clearbit.com/lululemon.com", active: true },
  { name: "Athleta", website: "https://athleta.gap.com/", logoUrl: "https://logo.clearbit.com/athleta.gap.com", active: true },
  { name: "Reebok", website: "https://www.reebok.com/", logoUrl: "https://logo.clearbit.com/reebok.com", active: true },
  { name: "PUMA", website: "https://www.puma.com/", logoUrl: "https://logo.clearbit.com/puma.com", active: true },
  { name: "Peloton", website: "https://www.onepeloton.com/", logoUrl: "https://logo.clearbit.com/onepeloton.com", active: true },
  { name: "NordicTrack", website: "https://www.nordictrack.com/", logoUrl: "https://logo.clearbit.com/nordictrack.com", active: true },
  { name: "Bowflex", website: "https://www.bowflex.com/", logoUrl: "https://logo.clearbit.com/bowflex.com", active: true },
  { name: "Nautilus", website: "https://www.nautilus.com/", logoUrl: "https://logo.clearbit.com/nautilus.com", active: true },
  { name: "Life Fitness", website: "https://www.lifefitness.com/", logoUrl: "https://logo.clearbit.com/lifefitness.com", active: true },
  { name: "Sports Direct", website: "https://www.sportsdirect.com/", logoUrl: "https://logo.clearbit.com/sportsdirect.com", active: true },
  { name: "JD Sports", website: "https://www.jdsports.co.uk/", logoUrl: "https://logo.clearbit.com/jdsports.co.uk", active: true },

  // SPECIALTY & VINTAGE
  { name: "The RealReal", website: "https://www.therealreal.com/", logoUrl: "https://logo.clearbit.com/therealreal.com", active: true },
  { name: "Vestiaire Collective", website: "https://www.vestiairecollective.com/", logoUrl: "https://logo.clearbit.com/vestiairecollective.com", active: true },
  { name: "What Goes Around Comes Around", website: "https://www.whatgoesaroundnyc.com/", logoUrl: "https://logo.clearbit.com/whatgoesaroundnyc.com", active: true },
  { name: "Rebag", website: "https://www.rebag.com/", logoUrl: "https://logo.clearbit.com/rebag.com", active: true },
  { name: "Fashionphile", website: "https://www.fashionphile.com/", logoUrl: "https://logo.clearbit.com/fashionphile.com", active: true },
  { name: "StockX", website: "https://stockx.com/", logoUrl: "https://logo.clearbit.com/stockx.com", active: true },
  { name: "GOAT", website: "https://www.goat.com/", logoUrl: "https://logo.clearbit.com/goat.com", active: true },

  // HEALTH & VITAMINS
  { name: "iHerb", website: "https://www.iherb.com/", logoUrl: "https://logo.clearbit.com/iherb.com", active: true },
  { name: "Vitacost", website: "https://www.vitacost.com/", logoUrl: "https://logo.clearbit.com/vitacost.com", active: true },
  { name: "Swanson Vitamins", website: "https://www.swansonvitamins.com/", logoUrl: "https://logo.clearbit.com/swansonvitamins.com", active: true },
  { name: "Thrive Market", website: "https://thrivemarket.com/", logoUrl: "https://logo.clearbit.com/thrivemarket.com", active: true },
  { name: "Life Extension", website: "https://www.lifeextension.com/", logoUrl: "https://logo.clearbit.com/lifeextension.com", active: true },
  { name: "NOW Foods", website: "https://www.nowfoods.com/", logoUrl: "https://logo.clearbit.com/nowfoods.com", active: true },
  { name: "Garden of Life", website: "https://www.gardenoflife.com/", logoUrl: "https://logo.clearbit.com/gardenoflife.com", active: true },
  { name: "Nature Made", website: "https://www.naturemade.com/", logoUrl: "https://logo.clearbit.com/naturemade.com", active: true },
  { name: "Optimum Nutrition", website: "https://www.optimumnutrition.com/", logoUrl: "https://logo.clearbit.com/optimumnutrition.com", active: true },
  { name: "Vital Proteins", website: "https://www.vitalproteins.com/", logoUrl: "https://logo.clearbit.com/vitalproteins.com", active: true },
  { name: "CVS Pharmacy", website: "https://www.cvs.com/", logoUrl: "https://logo.clearbit.com/cvs.com", active: true },
  { name: "Walgreens", website: "https://www.walgreens.com/", logoUrl: "https://logo.clearbit.com/walgreens.com", active: true },
  { name: "Rite Aid", website: "https://www.riteaid.com/", logoUrl: "https://logo.clearbit.com/riteaid.com", active: true },
  { name: "Boots", website: "https://www.boots.com/", logoUrl: "https://logo.clearbit.com/boots.com", active: true },
  { name: "Holland & Barrett", website: "https://www.hollandandbarrett.com/", logoUrl: "https://logo.clearbit.com/hollandandbarrett.com", active: true },
  { name: "GNC", website: "https://www.gnc.com/", logoUrl: "https://logo.clearbit.com/gnc.com", active: true },
  { name: "Vitamin Shoppe", website: "https://www.vitaminshoppe.com/", logoUrl: "https://logo.clearbit.com/vitaminshoppe.com", active: true },

  // TOYS & BABY
  { name: "Toys\"R\"Us", website: "https://www.toysrus.com/", logoUrl: "https://logo.clearbit.com/toysrus.com", active: true },
  { name: "LEGO", website: "https://www.lego.com/", logoUrl: "https://logo.clearbit.com/lego.com", active: true },
  { name: "Hasbro", website: "https://shop.hasbro.com/", logoUrl: "https://logo.clearbit.com/hasbro.com", active: true },
  { name: "Mattel", website: "https://shop.mattel.com/", logoUrl: "https://logo.clearbit.com/mattel.com", active: true },
  { name: "Fisher-Price", website: "https://www.fisher-price.com/", logoUrl: "https://logo.clearbit.com/fisher-price.com", active: true },
  { name: "Melissa & Doug", website: "https://www.melissaanddoug.com/", logoUrl: "https://logo.clearbit.com/melissaanddoug.com", active: true },
  { name: "Fat Brain Toys", website: "https://www.fatbraintoys.com/", logoUrl: "https://logo.clearbit.com/fatbraintoys.com", active: true },
  { name: "Learning Resources", website: "https://www.learningresources.com/", logoUrl: "https://logo.clearbit.com/learningresources.com", active: true },
  { name: "Buy Buy Baby", website: "https://www.buybuybaby.com/", logoUrl: "https://logo.clearbit.com/buybuybaby.com", active: true },
  { name: "Carter's", website: "https://www.carters.com/", logoUrl: "https://logo.clearbit.com/carters.com", active: true },
  { name: "Gap Kids", website: "https://www.gap.com/browse/category.do?cid=15643", logoUrl: "https://logo.clearbit.com/gap.com", active: true },
  { name: "Pottery Barn Kids", website: "https://www.potterybarnkids.com/", logoUrl: "https://logo.clearbit.com/potterybarnkids.com", active: true },
  { name: "Crate & Kids", website: "https://www.crateandbarrel.com/kids/", logoUrl: "https://logo.clearbit.com/crateandbarrel.com", active: true },
  { name: "Babylist", website: "https://www.babylist.com/", logoUrl: "https://logo.clearbit.com/babylist.com", active: true },

  // PET SUPPLIES
  { name: "Petco", website: "https://www.petco.com/", logoUrl: "https://logo.clearbit.com/petco.com", active: true },
  { name: "PetSmart", website: "https://www.petsmart.com/", logoUrl: "https://logo.clearbit.com/petsmart.com", active: true },
  { name: "Chewy", website: "https://www.chewy.com/", logoUrl: "https://logo.clearbit.com/chewy.com", active: true },
  { name: "BARK", website: "https://www.barkshop.com/", logoUrl: "https://logo.clearbit.com/barkshop.com", active: true },
  { name: "Blue Buffalo", website: "https://bluebuffalo.com/", logoUrl: "https://logo.clearbit.com/bluebuffalo.com", active: true },

  // ELECTRONICS & TECHNOLOGY  
  { name: "Best Buy", website: "https://www.bestbuy.com/", logoUrl: "https://logo.clearbit.com/bestbuy.com", active: true },
  { name: "Amazon", website: "https://www.amazon.com/", logoUrl: "https://logo.clearbit.com/amazon.com", active: true },
  { name: "Newegg", website: "https://www.newegg.com/", logoUrl: "https://logo.clearbit.com/newegg.com", active: true },
  { name: "B&H Photo", website: "https://www.bhphotovideo.com/", logoUrl: "https://logo.clearbit.com/bhphotovideo.com", active: true },
  { name: "Micro Center", website: "https://www.microcenter.com/", logoUrl: "https://logo.clearbit.com/microcenter.com", active: true },
  { name: "Adorama", website: "https://www.adorama.com/", logoUrl: "https://logo.clearbit.com/adorama.com", active: true },
  { name: "TigerDirect", website: "https://www.tigerdirect.com/", logoUrl: "https://logo.clearbit.com/tigerdirect.com", active: true },
  { name: "GameStop", website: "https://www.gamestop.com/", logoUrl: "https://logo.clearbit.com/gamestop.com", active: true },
  { name: "Apple Store", website: "https://www.apple.com/", logoUrl: "https://logo.clearbit.com/apple.com", active: true },
  { name: "Samsung", website: "https://www.samsung.com/", logoUrl: "https://logo.clearbit.com/samsung.com", active: true },
  { name: "Dell", website: "https://www.dell.com/", logoUrl: "https://logo.clearbit.com/dell.com", active: true },
  { name: "HP", website: "https://www.hp.com/", logoUrl: "https://logo.clearbit.com/hp.com", active: true },
  { name: "Lenovo", website: "https://www.lenovo.com/", logoUrl: "https://logo.clearbit.com/lenovo.com", active: true },
  { name: "ASUS", website: "https://www.asus.com/", logoUrl: "https://logo.clearbit.com/asus.com", active: true },
  { name: "MSI", website: "https://www.msi.com/", logoUrl: "https://logo.clearbit.com/msi.com", active: true },
  { name: "Corsair", website: "https://www.corsair.com/", logoUrl: "https://logo.clearbit.com/corsair.com", active: true },
  { name: "Razer", website: "https://www.razer.com/", logoUrl: "https://logo.clearbit.com/razer.com", active: true },
  { name: "Logitech", website: "https://www.logitech.com/", logoUrl: "https://logo.clearbit.com/logitech.com", active: true },
  { name: "Sony", website: "https://www.sony.com/", logoUrl: "https://logo.clearbit.com/sony.com", active: true },

  // HOME & FURNITURE
  { name: "IKEA", website: "https://www.ikea.com/", logoUrl: "https://logo.clearbit.com/ikea.com", active: true },
  { name: "Wayfair", website: "https://www.wayfair.com/", logoUrl: "https://logo.clearbit.com/wayfair.com", active: true },
  { name: "West Elm", website: "https://www.westelm.com/", logoUrl: "https://logo.clearbit.com/westelm.com", active: true },
  { name: "Pottery Barn", website: "https://www.potterybarn.com/", logoUrl: "https://logo.clearbit.com/potterybarn.com", active: true },
  { name: "CB2", website: "https://www.cb2.com/", logoUrl: "https://logo.clearbit.com/cb2.com", active: true },
  { name: "Article", website: "https://www.article.com/", logoUrl: "https://logo.clearbit.com/article.com", active: true },
  { name: "Overstock", website: "https://www.overstock.com/", logoUrl: "https://logo.clearbit.com/overstock.com", active: true },
  { name: "Jayson Home", website: "https://www.jaysonhome.com/", logoUrl: "https://logo.clearbit.com/jaysonhome.com", active: true },
  { name: "World Market", website: "https://www.worldmarket.com/", logoUrl: "https://logo.clearbit.com/worldmarket.com", active: true },
  { name: "HomeGoods", website: "https://www.homegoods.com/", logoUrl: "https://logo.clearbit.com/homegoods.com", active: true },

  // JEWELRY & WATCHES
  { name: "Tiffany & Co.", website: "https://www.tiffany.com/", logoUrl: "https://logo.clearbit.com/tiffany.com", active: true },
  { name: "Cartier", website: "https://www.cartier.com/", logoUrl: "https://logo.clearbit.com/cartier.com", active: true },
  { name: "Harry Winston", website: "https://www.harrywinston.com/", logoUrl: "https://logo.clearbit.com/harrywinston.com", active: true },
  { name: "David Yurman", website: "https://www.davidyurman.com/", logoUrl: "https://logo.clearbit.com/davidyurman.com", active: true },
  { name: "Pandora", website: "https://www.pandora.net/", logoUrl: "https://logo.clearbit.com/pandora.net", active: true },
  { name: "Swarovski", website: "https://www.swarovski.com/", logoUrl: "https://logo.clearbit.com/swarovski.com", active: true },
  { name: "Blue Nile", website: "https://www.bluenile.com/", logoUrl: "https://logo.clearbit.com/bluenile.com", active: true },
  { name: "James Allen", website: "https://www.jamesallen.com/", logoUrl: "https://logo.clearbit.com/jamesallen.com", active: true },
  { name: "Rolex", website: "https://www.rolex.com/", logoUrl: "https://logo.clearbit.com/rolex.com", active: true },
  { name: "Omega", website: "https://www.omegawatches.com/", logoUrl: "https://logo.clearbit.com/omegawatches.com", active: true },
  { name: "Tag Heuer", website: "https://www.tagheuer.com/", logoUrl: "https://logo.clearbit.com/tagheuer.com", active: true },
  { name: "Fossil", website: "https://www.fossil.com/", logoUrl: "https://logo.clearbit.com/fossil.com", active: true },
  { name: "Casio", website: "https://www.casio.com/", logoUrl: "https://logo.clearbit.com/casio.com", active: true },
  { name: "Apple Watch", website: "https://www.apple.com/watch/", logoUrl: "https://logo.clearbit.com/apple.com", active: true },

  // AUTOMOTIVE
  { name: "AutoZone", website: "https://www.autozone.com/", logoUrl: "https://logo.clearbit.com/autozone.com", active: true },
  { name: "O'Reilly Auto Parts", website: "https://www.oreillyauto.com/", logoUrl: "https://logo.clearbit.com/oreillyauto.com", active: true },
  { name: "Advance Auto Parts", website: "https://www.advanceautoparts.com/", logoUrl: "https://logo.clearbit.com/advanceautoparts.com", active: true },
  { name: "NAPA Auto Parts", website: "https://www.napaonline.com/", logoUrl: "https://logo.clearbit.com/napaonline.com", active: true },
  { name: "RockAuto", website: "https://www.rockauto.com/", logoUrl: "https://logo.clearbit.com/rockauto.com", active: true },
  { name: "Summit Racing", website: "https://www.summitracing.com/", logoUrl: "https://logo.clearbit.com/summitracing.com", active: true },
  { name: "Tire Rack", website: "https://www.tirerack.com/", logoUrl: "https://logo.clearbit.com/tirerack.com", active: true },

  // BOOKS & ENTERTAINMENT
  { name: "Amazon Books", website: "https://www.amazon.com/books/", logoUrl: "https://logo.clearbit.com/amazon.com", active: true },
  { name: "Barnes & Noble", website: "https://www.barnesandnoble.com/", logoUrl: "https://logo.clearbit.com/barnesandnoble.com", active: true },
  { name: "Book Depository", website: "https://www.bookdepository.com/", logoUrl: "https://logo.clearbit.com/bookdepository.com", active: true },
  { name: "Waterstones", website: "https://www.waterstones.com/", logoUrl: "https://logo.clearbit.com/waterstones.com", active: true },
  { name: "Powell's Books", website: "https://www.powells.com/", logoUrl: "https://logo.clearbit.com/powells.com", active: true },
  { name: "Blackwell's", website: "https://blackwells.co.uk/", logoUrl: "https://logo.clearbit.com/blackwells.co.uk", active: true },
  { name: "Wordery", website: "https://wordery.com/", logoUrl: "https://logo.clearbit.com/wordery.com", active: true },
  { name: "PlayStation Store", website: "https://store.playstation.com/", logoUrl: "https://logo.clearbit.com/playstation.com", active: true },
  { name: "Xbox Store", website: "https://www.xbox.com/", logoUrl: "https://logo.clearbit.com/xbox.com", active: true },
  { name: "Nintendo eShop", website: "https://www.nintendo.com/", logoUrl: "https://logo.clearbit.com/nintendo.com", active: true },

  // GARDEN & OUTDOOR
  { name: "Frontgate", website: "https://www.frontgate.com/", logoUrl: "https://logo.clearbit.com/frontgate.com", active: true },
  { name: "White Stores", website: "https://www.whitestores.co.uk/", logoUrl: "https://logo.clearbit.com/whitestores.co.uk", active: true },
  { name: "Luxus Home & Garden", website: "https://www.luxushome.co.uk/", logoUrl: "https://logo.clearbit.com/luxushome.co.uk", active: true },
  { name: "Gardner White", website: "https://www.gardnerwhite.com/", logoUrl: "https://logo.clearbit.com/gardnerwhite.com", active: true },
  { name: "Jenni Kayne Home", website: "https://www.jennikayne.com/", logoUrl: "https://logo.clearbit.com/jennikayne.com", active: true },
  { name: "L.L.Bean", website: "https://www.llbean.com/", logoUrl: "https://logo.clearbit.com/llbean.com", active: true },
  { name: "Sundays", website: "https://www.sundayscompany.com/", logoUrl: "https://logo.clearbit.com/sundayscompany.com", active: true },
  { name: "Soho Home", website: "https://www.sohohome.com/", logoUrl: "https://logo.clearbit.com/sohohome.com", active: true },

  // FOOD & BEVERAGES
  { name: "Williams Sonoma", website: "https://www.williams-sonoma.com/", logoUrl: "https://logo.clearbit.com/williams-sonoma.com", active: true },
  { name: "Dean & DeLuca", website: "https://www.deandeluca.com/", logoUrl: "https://logo.clearbit.com/deandeluca.com", active: true },
  { name: "Whole Foods Market", website: "https://www.wholefoodsmarket.com/", logoUrl: "https://logo.clearbit.com/wholefoodsmarket.com", active: true },
  { name: "Fresh Direct", website: "https://www.freshdirect.com/", logoUrl: "https://logo.clearbit.com/freshdirect.com", active: true },
  { name: "Murray's Cheese", website: "https://www.murrayacheese.com/", logoUrl: "https://logo.clearbit.com/murrayacheese.com", active: true },
  { name: "Goldbelly", website: "https://www.goldbelly.com/", logoUrl: "https://logo.clearbit.com/goldbelly.com", active: true },
  { name: "Harry & David", website: "https://www.harryanddavid.com/", logoUrl: "https://logo.clearbit.com/harryanddavid.com", active: true },
  { name: "Omaha Steaks", website: "https://www.omahasteaks.com/", logoUrl: "https://logo.clearbit.com/omahasteaks.com", active: true },
  { name: "Blue Apron", website: "https://www.blueapron.com/", logoUrl: "https://logo.clearbit.com/blueapron.com", active: true },
  { name: "Wine.com", website: "https://www.wine.com/", logoUrl: "https://logo.clearbit.com/wine.com", active: true },
  { name: "Total Wine", website: "https://www.totalwine.com/", logoUrl: "https://logo.clearbit.com/totalwine.com", active: true },
  { name: "Vivino", website: "https://www.vivino.com/", logoUrl: "https://logo.clearbit.com/vivino.com", active: true },
  { name: "The Whisky Exchange", website: "https://www.thewhiskyexchange.com/", logoUrl: "https://logo.clearbit.com/thewhiskyexchange.com", active: true },
  { name: "Master of Malt", website: "https://www.masterofmalt.com/", logoUrl: "https://logo.clearbit.com/masterofmalt.com", active: true },
  { name: "ReserveBar", website: "https://www.reservebar.com/", logoUrl: "https://logo.clearbit.com/reservebar.com", active: true }
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

    // For each shop in the comprehensive data
    for (const shop of allShops) {
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
