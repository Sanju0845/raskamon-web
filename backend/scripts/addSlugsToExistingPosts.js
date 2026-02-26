import mongoose from "mongoose";
import blogPostModel from "../models/blogPostModel.js";
import dotenv from "dotenv";

dotenv.config();

// Function to generate slug from title
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters except spaces and hyphens
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .trim("-"); // Remove leading/trailing hyphens
};

// Function to make slug unique
const makeSlugUnique = async (baseSlug, excludeId = null) => {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const query = { slug };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const existingPost = await blogPostModel.findOne(query);
    if (!existingPost) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
};

const migrateSlugs = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Find all blog posts without slugs
    const postsWithoutSlugs = await blogPostModel.find({
      $or: [{ slug: { $exists: false } }, { slug: null }, { slug: "" }],
    });

    console.log(`Found ${postsWithoutSlugs.length} posts without slugs`);

    if (postsWithoutSlugs.length === 0) {
      console.log("All posts already have slugs!");
      return;
    }

    // Update each post
    for (const post of postsWithoutSlugs) {
      const baseSlug = generateSlug(post.title);
      const uniqueSlug = await makeSlugUnique(baseSlug, post._id);

      await blogPostModel.findByIdAndUpdate(post._id, { slug: uniqueSlug });
      console.log(`Updated post "${post.title}" with slug: ${uniqueSlug}`);
    }

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

// Run the migration
migrateSlugs();

