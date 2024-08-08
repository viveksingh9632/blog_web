const express = require("express");
const router = express.Router();

const Blog = require("../models/blog");

const multer = require("multer");

// Multer configuration for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  },
});

const upload = multer({ storage: storage }).single("image");

router.post("/add-blog", upload, async (req, res) => {
  try {
    const blog = new Blog({
      title: req.body.title,
      content: req.body.content,
      image: req.file.filename,
      
    });

    await blog.save();
    req.session.message = {
      type: "success",
      message: "blog added successfully!",
    };
    res.redirect("/blog/blogs");
  } catch (err) {
    // Send an error response if something goes wrong
    res.json({ message: err.message, type: "danger" });
  }
});

router.get("/add-blog", async (req, res) => {
  res.render("add-blog", {
    title: "Blog Page",
  });
});

router.get("/blogs", async (req, res) => {
  const blogs = await Blog.find().exec(); // Corrected syntax
  try {
    res.render("blogs", { title: "blog List", blogs: blogs });
  } catch (error) {
    res.status(500).send("Error fetching blogs");
  }
});

router.get("/edit-blog/:id", async function (req, res) {
  try {
    const blog = await Blog.findById(req.params.id).exec();
    console.log(blog)
    if (!Blog) {
      return res.redirect("/blog/pages/");
    }

    res.render("/edit-blog", {
      title: blog.title,
      content: blog.content,
      image: Blog.image,
      id: blog._id,
      blog: blog,

      title: "edit_post",

      message: "post updated successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// Route to delete a blog post
router.get("/delete-blog/:id", async function (req, res) {
  try {
    const blogId = req.params.id;
    console.log(blogId)
    await Blog.findByIdAndDelete(blogId);
    
    // Fetch all blogs to update locals
    const blogs = await Blog.find({}).sort({ sorting: 1 }).exec();
    req.app.locals.blogs = blogs;

    // Set success message in session
    req.session.message = {
      type: "success",
      message: "Post deleted successfully",
    };

    // Redirect to the blogs page
    res.redirect("/blog/blogs");
  } catch (err) {
    console.error('Error deleting blog post:', err);
    req.session.message = {
      type: "danger",
      message: "An error occurred while deleting the post.",
    };
    res.redirect("/blog/blogs");
  }
});

module.exports = router;





module.exports = router;
