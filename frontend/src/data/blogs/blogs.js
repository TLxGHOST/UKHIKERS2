// src/data/blogs/blogs.js - All-in-One Approach
export const blogList = [
  {
    id: 1,
    title: "Chopta Tungnath Trek Guide",
    excerpt: "Mini Switzerland of Uttarakhand awaits — trek to 13,000 ft, visit the world's highest Shiva temple, and feast on Himalayan views.",
    category: "trekking",
    author: "UK Hikers",
    authorRole: "Trek Guide & Adventure Photographer",
    date: "November 2024",
    imageUrl: "/assets/images/blog/chopta.jpg",
    headerImage: "/assets/images/blog/chopta-header.jpg", // Optional different header image
    featured: true,
    readTime: "8 min read",
    tags: ["trekking", "uttarakhand", "himalaya", "temple"],
    content: [
      {
        type: 'paragraph',
        text: 'Nestled in the heart of Uttarakhand, the Chopta Tungnath trek is often referred to as the "Mini Switzerland of India." This breathtaking journey takes you through pristine meadows, dense forests, and ultimately to the highest Shiva temple in the world at 13,000 feet.'
      },
      {
        type: 'heading',
        text: 'Why Choose Chopta Tungnath Trek?'
      },
      {
        type: 'paragraph',
        text: 'The Chopta Tungnath trek offers an incredible combination of natural beauty, spiritual significance, and adventure. The trail winds through rhododendron forests that bloom magnificently in spring, creating a carpet of vibrant colors against the backdrop of snow-capped peaks.'
      },
      {
        type: 'subheading',
        text: 'Best Time to Visit'
      },
      {
        type: 'paragraph',
        text: 'The ideal time for this trek is from April to June and September to November. During these months, the weather is pleasant, and the views are crystal clear. Winter treks are possible but require proper gear and experience due to heavy snowfall.'
      },
      {
        type: 'image',
        src: '/assets/images/blog/chopta-meadow.jpg',
        alt: 'Chopta meadows in spring',
        caption: 'The beautiful meadows of Chopta during spring season'
      },
      {
        type: 'heading',
        text: 'Trek Difficulty and Duration'
      },
      {
        type: 'paragraph',
        text: 'This is considered a moderate trek suitable for beginners with basic fitness levels. The total distance is approximately 5 kilometers one way, and it typically takes 3-4 hours to reach Tungnath temple from Chopta.'
      },
      {
        type: 'list',
        items: [
          'Distance: 5 km one way',
          'Duration: 3-4 hours ascent',
          'Difficulty: Moderate',
          'Best season: April-June, Sept-Nov'
        ]
      },
      {
        type: 'conclusion',
        text: 'The Chopta Tungnath trek is more than just a hiking adventure; it\'s a spiritual journey that connects you with nature and ancient traditions. Whether you\'re seeking adventure, peace, or simply breathtaking views, this trek delivers an unforgettable experience in the lap of the Himalayas.'
      }
    ]
  },
  {
    id: 2,
    title: "Valley of Flowers Trek: A Botanical Paradise",
    excerpt: "Discover the UNESCO World Heritage site filled with exotic alpine flowers and breathtaking mountain vistas in Uttarakhand.",
    category: "trekking",
    author: "Mountain Explorer",
    authorRole: "Botanist & Trek Leader",
    date: "October 2024",
    imageUrl: "/assets/images/blog/valley-of-flowers.jpg",
    headerImage: "/assets/images/blog/valley-header.jpg",
    featured: false,
    readTime: "12 min read",
    tags: ["trekking", "flowers", "unesco", "photography"],
    content: [
      {
        type: 'paragraph',
        text: 'The Valley of Flowers National Park is a UNESCO World Heritage Site that transforms into a vibrant carpet of alpine flowers during the monsoon season. Located in the Western Himalayas, this valley is a paradise for nature lovers and photographers.'
      },
      {
        type: 'heading',
        text: 'When to Visit'
      },
      {
        type: 'paragraph',
        text: 'The valley is open from June to October, with peak blooming season from mid-July to mid-August. During this time, you can witness over 500 species of flowers in full bloom.'
      }
      // Add more content blocks as needed
    ]
  }
  // Add more blogs as needed
];

// Helper function to get blog by ID
export const getBlogById = (id) => {
  return blogList.find(blog => blog.id === parseInt(id));
};

// Helper function to get featured blog
export const getFeaturedBlog = () => {
  return blogList.find(blog => blog.featured);
};

// Helper function to get blogs by category
export const getBlogsByCategory = (category) => {
  return category === 'all'
    ? blogList
    : blogList.filter(blog => blog.category === category);
};