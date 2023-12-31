import mongoose from 'mongoose';
import PostMessage from '../models/postMessage.js';

export const getPosts = async (req, res) => {
    const { page } = req.query;
    const LIMIT = 8;
    const startIndex = (Number(page) - 1) * LIMIT;
    try {
        const total = await PostMessage.countDocuments({});
        const posts = await PostMessage.find().sort({ _id: -1 }).limit(LIMIT).skip(startIndex);
        res.status(200).json({ data: posts, numberOfPages: Math.ceil(total / LIMIT), currentPage: Number(page) });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

// QUERY -> /posts?page=1 -> page = 1
// PARAMS -> /posts/123 (/posts/:id) -> id = 123
// BODY -> someting you send as payload

export const getPostsBySearch = async (req, res) => {
    const { searchQuery, tags } = req.query;

    try {
        const title = new RegExp(searchQuery, 'i');

        const posts = await PostMessage.find({ $or: [{ title }, { tags: { $in: tags.split(',') } }] });
        res.status(200).json(posts);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}


export const createPosts = async (req, res) => {
    const post = req.body;

    const newPost = new PostMessage({ ...post, creator: req.userId, createdAt: new Date().toISOString() });
    try {
        await newPost.save();
        res.status(201).json(newPost);
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
}

export const getPost = async (req, res) => {
    try {
        const { id: _id } = req.params;
        // if (!mongoose.Types.ObjectId.isValid(_id)) return res.status(404).send('No post with that id');
        const post = await PostMessage.findById(_id);
        res.status(200).json(post);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const updatePost = async (req, res) => {
    const { id: _id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(_id)) return res.status(404).send('No post with that id');
    const post = req.body;
    const updatedPost = await PostMessage.findByIdAndUpdate(_id, { ...post, _id }, { new: true });
    res.json(updatedPost);
}

export const deletePost = async (req, res) => {
    const { id: _id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(_id)) return res.status(404).send('No post with that id');
    await PostMessage.findByIdAndDelete(_id);
    res.json({ message: 'Post deleted successfully' });
}

export const likePost = async (req, res) => {
    const { id: _id } = req.params;
    if (!req.userId) return res.status(401).json({ message: 'Unauthenticated' });
    if (!mongoose.Types.ObjectId.isValid(_id)) return res.status(404).send('No post with that id');
    const post = await PostMessage.findById(_id);
    const index = post.likes.findIndex((id) => id === String(req.userId));
    if (index === -1) {
        post.likes.push(req.userId);
    } else {
        post.likes.splice(index, 1);//splice works filter doesn't
    }
    const updatedPost = await PostMessage.findByIdAndUpdate(_id, post, { new: true });
    res.json(updatedPost);
}