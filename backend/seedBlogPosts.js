import mongoose from "mongoose";
import blogPostModel from "./models/blogPostModel.js";
import userModel from "./models/userModel.js";
import "dotenv/config";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

const seedBlogPosts = async () => {
  try {
    await connectDB();

    // Get a user to use as author
    const user = await userModel.findOne();
    if (!user) {
      console.log("No users found. Please create a user first.");
      return;
    }

    const testPosts = [
      {
        authorId: user._id,
        author: user.name || user.username || "Test User",
        title: "Understanding Anxiety: A Comprehensive Guide",
        content: `Anxiety affects millions of people worldwide. It's a natural response to stress, but when it becomes overwhelming and persistent, it can interfere with daily life.

This comprehensive guide explores the different types of anxiety disorders, their symptoms, and evidence-based treatment approaches. We'll discuss:

• Generalized Anxiety Disorder (GAD)
• Panic Disorder
• Social Anxiety Disorder
• Specific Phobias
• Obsessive-Compulsive Disorder (OCD)

Understanding the root causes and triggers of anxiety is the first step toward managing it effectively. With proper treatment and support, most people with anxiety disorders can lead fulfilling lives.

Remember, seeking help is a sign of strength, not weakness. If you're struggling with anxiety, reach out to a mental health professional who can provide personalized guidance and support.`,
        category: "mental-health",
        tags: ["anxiety", "mental-health", "stress", "coping"],
        imageUrl:
          "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=250&fit=crop",
        status: "pending",
        isAnonymous: false,
      },
      {
        authorId: user._id,
        author: "Anonymous",
        title: "My Journey with Depression: A Personal Story",
        content: `Depression is often misunderstood. It's not just feeling sad or having a bad day. It's a complex mental health condition that affects every aspect of life.

In this personal story, I share my experience with depression - the dark days, the moments of hope, and the gradual path toward recovery. I want others to know they're not alone.

The journey wasn't easy. There were days when getting out of bed felt impossible, when the world seemed gray and meaningless. But with therapy, medication, and the support of loved ones, I began to see light again.

Key lessons from my journey:
• Depression is treatable
• It's okay to ask for help
• Small steps forward are still progress
• Self-compassion is crucial

If you're struggling with depression, please know that help is available and recovery is possible. You don't have to face this alone.`,
        category: "personal-story",
        tags: ["depression", "personal-story", "recovery", "mental-health"],
        imageUrl:
          "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop",
        status: "pending",
        isAnonymous: true,
      },
      {
        authorId: user._id,
        author: user.name || user.username || "Test User",
        title: "Mindfulness Techniques for Stress Management",
        content: `In today's fast-paced world, stress has become a constant companion for many of us. Mindfulness offers powerful tools to manage stress and cultivate inner peace.

Mindfulness is the practice of being fully present in the moment, without judgment. It helps us observe our thoughts and feelings without getting caught up in them.

Here are some simple mindfulness techniques you can try:

1. **Breathing Meditation**: Focus on your breath for 5-10 minutes daily
2. **Body Scan**: Pay attention to physical sensations throughout your body
3. **Mindful Walking**: Walk slowly and notice each step
4. **Loving-Kindness Meditation**: Send positive thoughts to yourself and others

The benefits of mindfulness include:
• Reduced stress and anxiety
• Improved focus and concentration
• Better emotional regulation
• Enhanced self-awareness
• Increased compassion

Start with just 5 minutes a day and gradually increase your practice. Remember, mindfulness is a skill that develops with consistent practice.`,
        category: "stress-management",
        tags: ["mindfulness", "stress-management", "meditation", "wellness"],
        imageUrl:
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop",
        status: "pending",
        isAnonymous: false,
      },
    ];

    // Clear existing test posts
    await blogPostModel.deleteMany({ status: "pending" });
    console.log("Cleared existing pending posts");

    // Insert new test posts
    const insertedPosts = await blogPostModel.insertMany(testPosts);
    console.log(
      `Successfully inserted ${insertedPosts.length} test blog posts`
    );

    console.log("Blog posts seeded successfully!");
    console.log("You can now test the admin approval flow:");
    console.log("1. Login to admin panel");
    console.log("2. Check the dashboard for pending posts count");
    console.log("3. Navigate to 'Review Posts' section");
    console.log("4. Review and approve/reject the test posts");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding blog posts:", error);
    process.exit(1);
  }
};

seedBlogPosts();
