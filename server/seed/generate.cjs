const fs = require('fs');
const path = require('path');
const dir = __dirname;

const oid = (h) => ({ '$oid': h });
const dt = (i) => ({ '$date': i });

const hash = '$2b$10$ruYl5f4LER989a13P3.yIuUjc1fcLyA.yU4VKyVGfKZ8BDVYbEbiG';

const productData = [
  { t: "Essence Mascara Lash Princess", d: "The Essence Mascara Lash Princess is a popular mascara known for its volumizing and lengthening effects.", p: 9.99, s: 99, cat: "beauty", imgs: ["https://cdn.dummyjson.com/product-images/beauty/essence-mascara-lash-princess/1.webp"] },
  { t: "Eyeshadow Palette with Mirror", d: "The Eyeshadow Palette with Mirror offers a versatile range of eyeshadow shades for creating stunning eye looks.", p: 19.99, s: 34, cat: "beauty", imgs: ["https://cdn.dummyjson.com/product-images/beauty/eyeshadow-palette-with-mirror/1.webp"] },
  { t: "Powder Canister", d: "The Powder Canister is a finely milled setting powder designed to set makeup and control shine.", p: 14.99, s: 89, cat: "beauty", imgs: ["https://cdn.dummyjson.com/product-images/beauty/powder-canister/1.webp"] },
  { t: "Red Lipstick", d: "The Red Lipstick is a classic and bold choice for adding a pop of color to your lips.", p: 12.99, s: 91, cat: "beauty", imgs: ["https://cdn.dummyjson.com/product-images/beauty/red-lipstick/1.webp"] },
  { t: "Red Nail Polish", d: "The Red Nail Polish offers a rich and glossy red hue for vibrant and polished nails.", p: 8.99, s: 79, cat: "beauty", imgs: ["https://cdn.dummyjson.com/product-images/beauty/red-nail-polish/1.webp"] },
  { t: "Calvin Klein CK One", d: "CK One by Calvin Klein is a classic unisex fragrance, known for its fresh and clean scent.", p: 49.99, s: 29, cat: "fragrances", imgs: ["https://cdn.dummyjson.com/product-images/fragrances/calvin-klein-ck-one/1.webp","https://cdn.dummyjson.com/product-images/fragrances/calvin-klein-ck-one/2.webp","https://cdn.dummyjson.com/product-images/fragrances/calvin-klein-ck-one/3.webp"] },
  { t: "Chanel Coco Noir Eau De", d: "Coco Noir by Chanel is an elegant and mysterious fragrance, featuring notes of grapefruit, rose, and sandalwood.", p: 129.99, s: 58, cat: "fragrances", imgs: ["https://cdn.dummyjson.com/product-images/fragrances/chanel-coco-noir-eau-de/1.webp","https://cdn.dummyjson.com/product-images/fragrances/chanel-coco-noir-eau-de/2.webp","https://cdn.dummyjson.com/product-images/fragrances/chanel-coco-noir-eau-de/3.webp"] },
  { t: "Dior J'adore", d: "J'adore by Dior is a luxurious and floral fragrance, known for its blend of ylang-ylang, rose, and jasmine.", p: 89.99, s: 98, cat: "fragrances", imgs: ["https://cdn.dummyjson.com/product-images/fragrances/dior-j'adore/1.webp","https://cdn.dummyjson.com/product-images/fragrances/dior-j'adore/2.webp","https://cdn.dummyjson.com/product-images/fragrances/dior-j'adore/3.webp"] },
  { t: "Dolce Shine Eau de", d: "Dolce Shine by Dolce & Gabbana is a vibrant and fruity fragrance, featuring notes of mango, jasmine, and blonde woods.", p: 69.99, s: 4, cat: "fragrances", imgs: ["https://cdn.dummyjson.com/product-images/fragrances/dolce-shine-eau-de/1.webp","https://cdn.dummyjson.com/product-images/fragrances/dolce-shine-eau-de/2.webp","https://cdn.dummyjson.com/product-images/fragrances/dolce-shine-eau-de/3.webp"] },
  { t: "Gucci Bloom Eau de", d: "Gucci Bloom by Gucci is a floral and captivating fragrance, with notes of tuberose, jasmine, and Rangoon creeper.", p: 79.99, s: 91, cat: "fragrances", imgs: ["https://cdn.dummyjson.com/product-images/fragrances/gucci-bloom-eau-de/1.webp","https://cdn.dummyjson.com/product-images/fragrances/gucci-bloom-eau-de/2.webp","https://cdn.dummyjson.com/product-images/fragrances/gucci-bloom-eau-de/3.webp"] },
  { t: "Annibale Colombo Bed", d: "The Annibale Colombo Bed is a luxurious and elegant bed frame, crafted with high-quality materials.", p: 1899.99, s: 88, cat: "furniture", imgs: ["https://cdn.dummyjson.com/product-images/furniture/annibale-colombo-bed/1.webp","https://cdn.dummyjson.com/product-images/furniture/annibale-colombo-bed/2.webp","https://cdn.dummyjson.com/product-images/furniture/annibale-colombo-bed/3.webp"] },
  { t: "Annibale Colombo Sofa", d: "The Annibale Colombo Sofa is a sophisticated and comfortable seating option, featuring exquisite design.", p: 2499.99, s: 60, cat: "furniture", imgs: ["https://cdn.dummyjson.com/product-images/furniture/annibale-colombo-sofa/1.webp","https://cdn.dummyjson.com/product-images/furniture/annibale-colombo-sofa/2.webp","https://cdn.dummyjson.com/product-images/furniture/annibale-colombo-sofa/3.webp"] },
  { t: "Bedside Table African Cherry", d: "The Bedside Table in African Cherry is a stylish and functional addition to your bedroom.", p: 299.99, s: 64, cat: "furniture", imgs: ["https://cdn.dummyjson.com/product-images/furniture/bedside-table-african-cherry/1.webp","https://cdn.dummyjson.com/product-images/furniture/bedside-table-african-cherry/2.webp","https://cdn.dummyjson.com/product-images/furniture/bedside-table-african-cherry/3.webp"] },
  { t: "Knoll Saarinen Executive Conference Chair", d: "The Knoll Saarinen Executive Conference Chair is a modern and ergonomic chair, perfect for your office.", p: 499.99, s: 26, cat: "furniture", imgs: ["https://cdn.dummyjson.com/product-images/furniture/knoll-saarinen-executive-conference-chair/1.webp","https://cdn.dummyjson.com/product-images/furniture/knoll-saarinen-executive-conference-chair/2.webp","https://cdn.dummyjson.com/product-images/furniture/knoll-saarinen-executive-conference-chair/3.webp"] },
  { t: "Wooden Bathroom Sink With Mirror", d: "The Wooden Bathroom Sink with Mirror is a unique and stylish addition to your bathroom.", p: 799.99, s: 7, cat: "furniture", imgs: ["https://cdn.dummyjson.com/product-images/furniture/wooden-bathroom-sink-with-mirror/1.webp","https://cdn.dummyjson.com/product-images/furniture/wooden-bathroom-sink-with-mirror/2.webp","https://cdn.dummyjson.com/product-images/furniture/wooden-bathroom-sink-with-mirror/3.webp"] },
  { t: "Apple", d: "Fresh and crisp apples, perfect for snacking or incorporating into various recipes.", p: 1.99, s: 8, cat: "groceries", imgs: ["https://cdn.dummyjson.com/product-images/groceries/apple/1.webp"] },
  { t: "Beef Steak", d: "High-quality beef steak, great for grilling or cooking to your preferred level of doneness.", p: 12.99, s: 86, cat: "groceries", imgs: ["https://cdn.dummyjson.com/product-images/groceries/beef-steak/1.webp"] },
  { t: "Cat Food", d: "Nutritious cat food formulated to meet the dietary needs of your feline friend.", p: 8.99, s: 46, cat: "groceries", imgs: ["https://cdn.dummyjson.com/product-images/groceries/cat-food/1.webp"] },
  { t: "Chicken Meat", d: "Fresh and tender chicken meat, suitable for various culinary preparations.", p: 9.99, s: 97, cat: "groceries", imgs: ["https://cdn.dummyjson.com/product-images/groceries/chicken-meat/1.webp","https://cdn.dummyjson.com/product-images/groceries/chicken-meat/2.webp"] },
  { t: "Cooking Oil", d: "Versatile cooking oil suitable for frying, sauteing, and various culinary applications.", p: 4.99, s: 10, cat: "groceries", imgs: ["https://cdn.dummyjson.com/product-images/groceries/cooking-oil/1.webp"] },
  { t: "Cucumber", d: "Crisp and hydrating cucumbers, ideal for salads, snacks, or as a refreshing side.", p: 1.49, s: 84, cat: "groceries", imgs: ["https://cdn.dummyjson.com/product-images/groceries/cucumber/1.webp"] },
  { t: "Dog Food", d: "Specially formulated dog food designed to provide essential nutrients for your canine companion.", p: 10.99, s: 71, cat: "groceries", imgs: ["https://cdn.dummyjson.com/product-images/groceries/dog-food/1.webp"] },
  { t: "Eggs", d: "Fresh eggs, a versatile ingredient for baking, cooking, or breakfast.", p: 2.99, s: 9, cat: "groceries", imgs: ["https://cdn.dummyjson.com/product-images/groceries/eggs/1.webp"] },
  { t: "Fish Steak", d: "Quality fish steak, suitable for grilling, baking, or pan-searing.", p: 14.99, s: 74, cat: "groceries", imgs: ["https://cdn.dummyjson.com/product-images/groceries/fish-steak/1.webp"] },
  { t: "Green Bell Pepper", d: "Fresh and vibrant green bell pepper, perfect for adding color and flavor to your dishes.", p: 1.29, s: 33, cat: "groceries", imgs: ["https://cdn.dummyjson.com/product-images/groceries/green-bell-pepper/1.webp"] },
  { t: "Green Chili Pepper", d: "Spicy green chili pepper, ideal for adding heat to your favorite recipes.", p: 0.99, s: 3, cat: "groceries", imgs: ["https://cdn.dummyjson.com/product-images/groceries/green-chili-pepper/1.webp"] },
  { t: "Honey Jar", d: "Pure and natural honey in a convenient jar, perfect for sweetening beverages or drizzling over food.", p: 6.99, s: 34, cat: "groceries", imgs: ["https://cdn.dummyjson.com/product-images/groceries/honey-jar/1.webp"] },
  { t: "Ice Cream", d: "Creamy and delicious ice cream, available in various flavors for a delightful treat.", p: 5.49, s: 27, cat: "groceries", imgs: ["https://cdn.dummyjson.com/product-images/groceries/ice-cream/1.webp","https://cdn.dummyjson.com/product-images/groceries/ice-cream/2.webp","https://cdn.dummyjson.com/product-images/groceries/ice-cream/3.webp","https://cdn.dummyjson.com/product-images/groceries/ice-cream/4.webp"] },
  { t: "Juice", d: "Refreshing fruit juice, packed with vitamins and great for staying hydrated.", p: 3.99, s: 50, cat: "groceries", imgs: ["https://cdn.dummyjson.com/product-images/groceries/juice/1.webp"] },
  { t: "Kiwi", d: "Nutrient-rich kiwi, ideal for snacking or adding a tropical twist to your dishes.", p: 2.49, s: 99, cat: "groceries", imgs: ["https://cdn.dummyjson.com/product-images/groceries/kiwi/1.webp"] }
];

function generate() {
  const sellerMap = {
    beauty: '60c72b2f9b1d4a3e7f8a1002',
    fragrances: '60c72b2f9b1d4a3e7f8a1003',
    furniture: '60c72b2f9b1d4a3e7f8a1004'
  };
  const mikeId = '60c72b2f9b1d4a3e7f8a1005';
  const pendingId = '60c72b2f9b1d4a3e7f8a1006';
  const base = '60c72b2f9b1d4a3e7f8a';

  const pDocs = productData.map((p, i) => {
    let sid;
    if (p.cat === 'groceries') {
      sid = i < 25 ? mikeId : pendingId;
    } else {
      sid = sellerMap[p.cat];
    }
    const idHex = (0x1010 + i).toString(16).padStart(3, '0');
    return {
      _id: oid(base + idHex),
      sellerId: oid(sid),
      productName: p.t,
      description: p.d,
      price: p.p,
      stockQuantity: p.s,
      images: p.imgs,
      category: p.cat,
      isActive: true,
      createdAt: dt('2026-04-10T09:00:00Z'),
      updatedAt: dt('2026-04-10T09:00:00Z'),
      __v: 0
    };
  });

  fs.writeFileSync(path.join(dir, 'products.json'), JSON.stringify(pDocs, null, 2), 'utf8');
  console.log('products.json done -', pDocs.length, 'products');

  const buyerIds = ['60c72b2f9b1d4a3e7f8a1007', '60c72b2f9b1d4a3e7f8a1008', '60c72b2f9b1d4a3e7f8a1009'];

  const orderSpecs = [
    { b: 0, items: [[0,2],[3,1]], st: 'pending', ca: '2026-04-16T10:00:00Z', ua: '2026-04-16T10:00:00Z' },
    { b: 1, items: [[5,1],[9,1]], st: 'pending', ca: '2026-04-16T14:00:00Z', ua: '2026-04-16T14:00:00Z' },
    { b: 0, items: [[11,1]], st: 'approved', ca: '2026-04-16T15:00:00Z', ua: '2026-04-17T09:00:00Z' },
    { b: 2, items: [[16,3],[19,2]], st: 'approved', ca: '2026-04-17T11:00:00Z', ua: '2026-04-17T16:00:00Z' },
    { b: 1, items: [[6,2]], st: 'shipped', ca: '2026-04-17T12:00:00Z', ua: '2026-04-18T10:00:00Z' },
    { b: 2, items: [[13,1],[12,1]], st: 'shipped', ca: '2026-04-18T09:00:00Z', ua: '2026-04-19T14:00:00Z' },
    { b: 0, items: [[15,5],[29,3],[28,2]], st: 'delivered', ca: '2026-04-18T11:00:00Z', ua: '2026-04-21T15:00:00Z' },
    { b: 1, items: [[7,1],[4,2]], st: 'delivered', ca: '2026-04-19T10:00:00Z', ua: '2026-04-22T12:00:00Z' },
    { b: 2, items: [[17,4],[21,2]], st: 'cancelled', ca: '2026-04-19T14:00:00Z', ua: '2026-04-20T09:00:00Z' },
    { b: 0, items: [[8,1]], st: 'cancelled', ca: '2026-04-20T11:00:00Z', ua: '2026-04-20T16:00:00Z' }
  ];

  const oDocs = orderSpecs.map((o, i) => {
    const idHex = (0x1030 + i).toString(16);
    const orderItems = o.items.map(([pi, qty]) => ({
      productId: pDocs[pi]._id,
      quantity: qty,
      priceAtPurchase: pDocs[pi].price
    }));
    const total = orderItems.reduce((sum, item) => sum + item.priceAtPurchase * item.quantity, 0);
    return {
      _id: oid(base + idHex),
      buyerId: oid(buyerIds[o.b]),
      orderItems,
      totalAmount: Math.round(total * 100) / 100,
      orderStatus: o.st,
      createdAt: dt(o.ca),
      updatedAt: dt(o.ua),
      __v: 0
    };
  });

  fs.writeFileSync(path.join(dir, 'orders.json'), JSON.stringify(oDocs, null, 2), 'utf8');
  console.log('orders.json done -', oDocs.length, 'orders');
}

generate();
