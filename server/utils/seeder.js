const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

dotenv.config({ path: require('path').resolve(__dirname, '../.env') }); // Look for env file

const mockUsers = [
  {
    username: 'creative_jane',
    email: 'jane@example.com',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    bio: 'Visual designer & photographer capturing moments around the globe. 📸✨'
  },
  {
    username: 'pixel_architect',
    email: 'bob@example.com',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    bio: 'Minimalist designer building interfaces & physical art spaces. Design is in details.'
  },
  {
    username: 'nature_explorer',
    email: 'clara@example.com',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    bio: 'Hiking trails and photographing the wilderness. Leave only footprints.'
  }
];

const mockPosts = [
  {
    title: 'Serene mountain reflection in alpine lake',
    description: 'Caught this perfect reflection right after sunrise. The air was cold, crisp, and completely still. Absolutely magical morning hike.',
    category: 'Nature',
    tags: ['mountains', 'lake', 'reflection', 'nature', 'adventure'],
    image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800'
  },
  {
    title: 'Minimalist desk setup with warm wood accents',
    description: 'Clean workspaces lead to clean code. Current setup featuring mechanical keyboard, custom desk mat, and ambient lighting.',
    category: 'Design',
    tags: ['workspace', 'minimalist', 'setup', 'desk', 'tech'],
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'
  },
  {
    title: 'Neon streets of Tokyo on a rainy evening',
    description: 'The glow of neon signs reflecting off wet streets. Wandering through Shinjuku alleys is always an inspiration.',
    category: 'Travel',
    tags: ['tokyo', 'japan', 'travel', 'neon', 'cityscape', 'rain'],
    image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800'
  },
  {
    title: 'Artistic clay sculpture studies',
    description: 'Playing around with abstract figures and organic curves. The feel of molding clay is incredibly therapeutic.',
    category: 'Art',
    tags: ['sculpture', 'art', 'clay', 'abstract', 'creative'],
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800'
  },
  {
    title: 'Healthy berry-packed breakfast bowl',
    description: 'Starting the week right with organic acai, chia seeds, fresh blueberries, and a drizzle of local honey.',
    category: 'Food',
    tags: ['breakfast', 'healthy', 'acai', 'fruits', 'foodie'],
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800'
  },
  {
    title: 'Cozy cabin in the middle of Norwegian woods',
    description: 'A weekend getaway spot. No Wi-Fi, just a wood-burning fireplace and stacks of books.',
    category: 'Travel',
    tags: ['cabin', 'norway', 'woods', 'cozy', 'architecture'],
    image: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800'
  },
  {
    title: 'Vibrant modern geometric artwork',
    description: 'Digital canvas print exploring bold secondary colors and intersecting geometry. Let me know what emotions this evokes for you!',
    category: 'Art',
    tags: ['geometric', 'digitalart', 'vector', 'colors'],
    image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800'
  },
  {
    title: 'Retro camera collection and vintage film',
    description: 'Old analog cameras still hold so much charm. A small peek at my growing range of 35mm shooters.',
    category: 'Photography',
    tags: ['analog', 'camera', 'film', 'vintage', 'photography'],
    image: 'https://images.unsplash.com/photo-1495707902641-75cac588d2e9?w=800'
  },
  {
    title: 'Brutalist concrete architecture detail',
    description: 'Stunning shadow play on concrete pillars. Architect: Tadao Ando. Minimalist lines at their absolute finest.',
    category: 'Design',
    tags: ['architecture', 'concrete', 'brutalism', 'shadows'],
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'
  },
  {
    title: 'Misty pine forest in early morning light',
    description: 'Drove out to the valley at 4 AM. The fog rolling through the trees was worth every minute of lost sleep.',
    category: 'Nature',
    tags: ['forest', 'fog', 'nature', 'landscape', 'moody'],
    image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800'
  },
  {
    title: 'Delectable homemade sourdough bread loaf',
    description: 'Warm out of the oven! 80% hydration, crispy crust, and open crumb. Best served with salted butter.',
    category: 'Food',
    tags: ['sourdough', 'baking', 'bread', 'food', 'homemade'],
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800'
  },
  {
    title: 'Sunsets over coastal sea stacks',
    description: 'Pacific northwest coastline never disappoints. Taken at Ruby Beach, Washington.',
    category: 'Travel',
    tags: ['ocean', 'sunset', 'beach', 'pnw', 'travel'],
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800'
  }
];

const seedDB = async () => {
  try {
    const localUri = 'mongodb://127.0.0.1:27017/zuntra';
    const uri = process.env.MONGO_URI && !process.env.MONGO_URI.includes('placeholder')
      ? process.env.MONGO_URI
      : localUri;

    console.log(`Connecting to database for seeding: ${uri}...`);
    await mongoose.connect(uri);
    console.log('Connected.');

    // Clear old data
    await User.deleteMany();
    await Post.deleteMany();
    await Comment.deleteMany();
    console.log('Cleaned existing collections.');

    // Hash user passwords and save users
    const users = [];
    for (const u of mockUsers) {
      const salt = await bcrypt.genSalt(10);
      u.password = await bcrypt.hash(u.password, salt);
      const newUser = await User.create(u);
      users.push(newUser);
    }
    console.log(`Seeded ${users.length} mock users.`);

    // Seed posts distributed among users
    const posts = [];
    for (let i = 0; i < mockPosts.length; i++) {
      const postData = mockPosts[i];
      // Distribute author user
      const author = users[i % users.length];
      
      const newPost = await Post.create({
        ...postData,
        userId: author._id
      });
      posts.push(newPost);
    }
    console.log(`Seeded ${posts.length} visual posts.`);

    // Seed some mock comments and likes
    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      const commenter = users[(i + 1) % users.length];
      const liker = users[(i + 2) % users.length];

      // Add a comment
      await Comment.create({
        userId: commenter._id,
        postId: post._id,
        text: `This is absolutely beautiful! Thanks for sharing this post. ✨`
      });

      // Add a like
      post.likes.push(liker._id);
      await post.save();
    }
    console.log('Seeded interactions (likes & comments).');

    console.log('Database Seeding Completed Successfully! 🌱');
    process.exit(0);
  } catch (error) {
    console.error('Error during database seeding:', error.message);
    process.exit(1);
  }
};

seedDB();
