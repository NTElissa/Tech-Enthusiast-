// controllers/blog/posts.js

import Post from '../../models/Post.js';
import { STATUS_CODES } from '../../config/constants.js';
import slugify from 'slugify';

// Create new post
export const createPost = async (req, res) => {
  const { title, content, summary, category, tags, featured } = req.body;
  
  if (!title || !content || !summary || !category) {
    return res.status(STATUS_CODES.BAD_REQUEST).json({ 
      error: 'Title, content, summary and category are required' 
    });
  }
  
  try {
    // Generate slug from title
    const slug = slugify(title, { lower: true, strict: true });
    
    // Check if slug already exists
    const existingPost = await Post.findOne({ slug });
    if (existingPost) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ 
        error: 'A post with this title already exists' 
      });
    }
    
    const newPost = new Post({
      title,
      slug,
      content,
      summary,
      author: req.user.userId,
      category,
      tags: tags || [],
      featured: featured || false,
      status: 'published',
      publishedAt: new Date()
    });
    
    await newPost.save();
    
    res.status(STATUS_CODES.CREATED).json({
      message: 'Post created successfully',
      post: newPost
    });
  } catch (error) {
    console.error(error);
    res.status(STATUS_CODES.SERVER_ERROR).json({ 
      error: 'Server error' 
    });
  }
};

// Get all posts (paginated)
export const getAllPosts = async (req, res) => {
  const { page = 1, limit = 10, category, tag, search, status = 'published' } = req.query;
  
  try {
    // Build query
    const query = { status };
    
    if (category) query.category = category;
    if (tag) query.tags = { $in: [tag] };
    if (search) query.$text = { $search: search };
    
    // Count total documents
    const totalPosts = await Post.countDocuments(query);
    
    // Execute query with pagination
    const posts = await Post.find(query)
      .populate('author', 'username firstName lastName')
      .populate('category', 'name')
      .sort({ publishedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    
    res.status(STATUS_CODES.OK).json({
      posts,
      totalPages: Math.ceil(totalPosts / limit),
      currentPage: page,
      totalPosts
    });
  } catch (error) {
    console.error(error);
    res.status(STATUS_CODES.SERVER_ERROR).json({ 
      error: 'Server error' 
    });
  }
};

// Get post by ID
export const getPostById = async (req, res) => {
  const { postId } = req.params;
  
  try {
    const post = await Post.findById(postId)
      .populate('author', 'username firstName lastName')
      .populate('category', 'name');
    
    if (!post) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ 
        error: 'Post not found' 
      });
    }
    
    // Increment view count
    post.views += 1;
    await post.save();
    
    res.status(STATUS_CODES.OK).json({ post });
  } catch (error) {
    console.error(error);
    res.status(STATUS_CODES.SERVER_ERROR).json({ 
      error: 'Server error' 
    });
  }
};

// Update post
export const updatePost = async (req, res) => {
  const { postId } = req.params;
  const { title, content, summary, category, tags, featured, status } = req.body;
  
  try {
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ 
        error: 'Post not found' 
      });
    }
    
    // Check if user is the author or admin
    if (post.author.toString() !== req.user.userId && req.user.role === 0) {
      return res.status(STATUS_CODES.FORBIDDEN).json({ 
        error: 'Not authorized to update this post' 
      });
    }
    
    // Update fields if provided
    if (title) {
      post.title = title;
      post.slug = slugify(title, { lower: true, strict: true });
    }
    if (content) post.content = content;
    if (summary) post.summary = summary;
    if (category) post.category = category;
    if (tags) post.tags = tags;
    if (featured !== undefined) post.featured = featured;
    if (status) post.status = status;
    
    await post.save();
    
    res.status(STATUS_CODES.OK).json({
      message: 'Post updated successfully',
      post
    });
  } catch (error) {
    console.error(error);
    res.status(STATUS_CODES.SERVER_ERROR).json({ 
      error: 'Server error' 
    });
  }
};

// Delete post
export const deletePost = async (req, res) => {
  const { postId } = req.params;
  
  try {
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ 
        error: 'Post not found' 
      });
    }
    
    // Check if user is the author or admin
    if (post.author.toString() !== req.user.userId && req.user.role === 0) {
      return res.status(STATUS_CODES.FORBIDDEN).json({ 
        error: 'Not authorized to delete this post' 
      });
    }
    
    await post.deleteOne();
    
    res.status(STATUS_CODES.OK).json({ 
      message: 'Post deleted successfully' 
    });
  } catch (error) {
    console.error(error);
    res.status(STATUS_CODES.SERVER_ERROR).json({ 
      error: 'Server error' 
    });
  }
};

// Like/unlike post
export const likePost = async (req, res) => {
  const { postId } = req.params;
  
  try {
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ 
        error: 'Post not found' 
      });
    }
    
    // Check if user already liked the post
    const index = post.likes.findIndex(
      (id) => id.toString() === req.user.userId
    );
    
    if (index === -1) {
      // Like the post
      post.likes.push(req.user.userId);
    } else {
      // Unlike the post
      post.likes = post.likes.filter(
        (id) => id.toString() !== req.user.userId
      );
    }
    
    await post.save();
    
    res.status(STATUS_CODES.OK).json({
      message: index === -1 ? 'Post liked' : 'Post unliked',
      likesCount: post.likes.length
    });
  } catch (error) {
    console.error(error);
    res.status(STATUS_CODES.SERVER_ERROR).json({ 
      error: 'Server error' 
    });
  }
};