export const hero = {
  headline:
    "White glove delivery & global shipping of Fine Art, Luxury Furniture & Décor",
  ctaLabel: "Schedule Now",
  ctaHref: "/schedule",
  image: "/images/home/IMG_4133.jpg",
};

export const reviewsSummary = {
  businessName: "California Art Delivery",
  rating: 5,
  reviewCount: 237,
  heading: "What Our Clients Are Saying About Us",
  googleUrl: "https://maps.google.com/?cid=10211041942674643415",
  writeReviewUrl:
    "https://search.google.com/local/writereview?placeid=ChIJYVMNLC1Cs0QR15m844votI0",
};

export const testimonials = [
  {
    quote:
      "Chad was FANTASTIC!!! Thank you so much. The painting is hung perfectly. He was very meticulous and lovely.",
    author: "Greer",
    detail: "Art Collector in Los Angeles",
    date: "April 22, 2026",
  },
  {
    quote:
      "Thank you for making this happen. The best experience!!! I had the best experience and highly recommended in best raves!",
    author: "Art Collector in Los Angeles",
    detail: "",
    date: "April 21, 2026",
  },
  {
    quote:
      "California Art Delivery was exceptionally professional! Samantha and Chad were fantastic and I would use their services again for sure for installing artworks. The communication was perfect and delivery time was excellent. Chad was exactly on time and he did a fabulous and meticulous job in helping us to find the right spot and angle for the sculpture. I highly recommend them.",
    author: "Art Collector in Rancho Santa Fe",
    detail: "",
    date: "April 10, 2026",
  },
  {
    quote:
      "Chad was wonderful and professional. He communicated clearly, he had a great attitude and most importantly he handled our art with like a care of a parent holding their newborn. He is the best.",
    author: "Tom",
    detail: "La Quinta",
    date: "March 27, 2026",
  },
  {
    quote:
      "Safety, professionalism, and individuals taking pride in their work, that is exactly what California Art Delivery delivers. Thank you!",
    author: "Eric",
    detail: "Artist from Laguna Beach",
    date: "March 27, 2026",
  },
  {
    quote:
      "We really appreciate the good service and the communication we received from California Art Delivery Team. Chad & I spoke about future opportunities to move some things we have.",
    author: "Mark",
    detail: "Rancho Palos Verdes",
    date: "March 12, 2026",
  },
  {
    quote:
      "We had a wonderful experience with California Art Delivery and would work with them again in a heartbeat. They were communicative about arrival time, super personable, and took great care with delivery and unpacking. Thanks for everything.",
    author: "Daniel",
    detail: "Art Collector in San Francisco",
    date: "March 12, 2026",
  },
  {
    quote:
      "The delivery went well and it was a smooth experience! Definitely a 5 star service experience.",
    author: "Francisco Aguilar",
    detail: "",
    date: "July 6, 2026",
  },
  {
    quote:
      "Chad & Samantha were terrific They keep me updated all throughout! Will definitely use them again.",
    author: "Bob Goldberg",
    detail: "",
    date: "July 21, 2026",
  },
  {
    quote:
      "We appreciate the California Art Delivery's excellent communication",
    author: "Christi Hall",
    detail: "",
    date: "July 22, 2026",
  },
];

export const intro = {
  heading:
    "We are your trusted experts in delivering fine art, luxury furniture & décor across California and providing global shipping services",
  body: "We specialize in delivery of fine art, luxury furniture and décor. Our services include performing pickups and deliveries with the utmost care. We also offer competitive shipping rates, providing expert crating and shipping anywhere in the United States and abroad. We serve discerning clients in prestigious California locations, including Napa Valley, Silicon Valley, Carmel-by-the-Sea, Malibu, Beverly Hills, Laguna Beach, and La Jolla. Our philosophy is to ensure every customer feels celebrated and valued, making each experience truly exceptional.",
  image: "/images/home/450585371_122123984648291652_8177886129219223976_n.jpg",
};

export const serviceAreas = {
  heading: "No one covers California like we do",
  label: "Areas we serve:",
  regions: [
    {
      name: "Northern California",
      image: "/images/home/1000003553.jpg",
      places:
        "St. Helena, Napa, Tiburon, Ross, Sausalito, Presidio Heights, Pacific Heights, Belvedere, Hillsborough, Woodside, Atherton, Menlo Park, Portola Valley, Palo Alto, Los Altos Hills, Saratoga, Monte Sereno, Los Gatos, Santa Cruz, Aptos Hills",
    },
    {
      name: "Central California",
      image: "/images/home/1000003555.jpg",
      places:
        "Pebble Beach, Carmel-by-the-Sea, Carmel Valley Village, Carmel Highlands, Big Sur, San Luis Obispo",
    },
    {
      name: "Southern California",
      image: "/images/home/1000003554.jpg",
      places:
        "Santa Barbara, Montecito, Hidden Hills, Calabasas, Malibu, Pacific Palisades, Brentwood, Bel Air, Beverly Hills, Los Angeles, Newport Beach, Crystal Cove, Laguna Beach, Dana Point, Palm Springs, Rancho Mirage, Palm Desert, Indian Wells, La Quinta, Rancho Santa Fe, Fairbanks Ranch, La Jolla, San Diego",
    },
  ],
};

export type ServiceSection = {
  heading: string;
  body?: string;
  image: string;
  imageRight?: boolean;
};

export const serviceSections: ServiceSection[] = [
  {
    heading: "Auction Houses",
    body: "We pick up and deliver to and from California's premier auction houses.",
    image: "/images/home/IMG_4120.jpg",
  },
  {
    heading: "Private Fine Art Collectors",
    body: "Whether it's a gallery purchase, a transfer to a home or second home, we help private art collectors with their art transportation and installation needs. We also frequently work with interior designers and artists.",
    image: "/images/home/IMG_4413.jpg",
    imageRight: true,
  },
  {
    heading: "Paintings",
    body: "We specialize in fine art delivery and shipping such as paintings and can handle your installation needs.",
    image: "/images/home/449475643_122122647890291652_4032750062915678718_n.jpg",
  },
  {
    heading: "Sculptures",
    body: "We deliver, ship, and install sculptures for both interior and exterior presentation.",
    image: "/images/home/1000003546.jpg",
    imageRight: true,
  },
  {
    heading: "Specialized Delivery and Shipping",
    image: "/images/home/1000003548.jpg",
  },
  {
    heading: "Secure Packing",
    image: "/images/home/IMG_4715.jpg",
    imageRight: true,
  },
  {
    heading: "Antiques",
    body: "We provide the secure transport and delivery of an array of antiques.",
    image: "/images/home/1000003549.jpg",
  },
  {
    heading: "Delicate high-end Lighting",
    image: "/images/home/IMG_4270.jpg",
    imageRight: true,
  },
  {
    heading: "Custom Bids",
    image: "/images/home/IMG_4659.jpg",
  },
  {
    heading: "From Fabrication Shops...",
    image: "/images/home/IMG_4203.jpg",
    imageRight: true,
  },
  {
    heading: "...To Five Star Hotels",
    image: "/images/home/IMG_0833.jpg",
  },
  {
    heading: "We Deliver and Ship Your Artistic Vision",
    image: "/images/home/448261189_122119043858291652_1406805484909822863_n.jpg",
    imageRight: true,
  },
  {
    heading: "Luxury Furnishings",
    body: "All handled with the utmost care",
    image: "/images/home/IMG_4218.jpg",
  },
  {
    heading: "Servicing all of California and international shipping",
    image: "/images/home/IMG_4631.jpg",
    imageRight: true,
  },
  {
    heading: "Showroom to Home",
    image: "/images/home/1000003550.jpg",
  },
  {
    heading: "Careful Handling",
    image: "/images/home/IMG_4641.jpg",
    imageRight: true,
  },
  {
    heading: "Collectables",
    image: "/images/home/IMG_4174.jpg",
  },
  {
    heading: "Dependable Transportation",
    image: "/images/home/IMG_4702_ad86605b-81fa-413e-9ed1-819a199731eb.jpg",
    imageRight: true,
  },
  {
    heading: "Installation",
    image: "/images/home/IMG_4705.jpg",
  },
];

export const finalCta = {
  heading:
    "Contact us today for a free estimate. We look forward to serving you.",
  image: "/images/home/IMG_4668.jpg",
  ctaLabel: "Schedule Now",
  ctaHref: "/schedule",
};
