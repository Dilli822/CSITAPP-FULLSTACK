import React, { useEffect, useState } from "react";
import { IconButton, Popover, Typography, Button, TextField } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShareIcon from "@mui/icons-material/Share";
import MapsUgcRoundedIcon from "@mui/icons-material/MapsUgcRounded";
import { Link } from "react-router-dom";
import { Carousel } from "react-responsive-carousel";
import { io } from "socket.io-client";

const Likes = () => {
  const [anchorEls, setAnchorEls] = useState([]);
  const [copiedStates, setCopiedStates] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [likes, setLikes] = useState([]);
  const [liked, setLiked] = useState([]);
  const [comments, setComments] = useState([]);
  const [videoLoading, setVideoLoading] = useState(true);
  const [mainLoading, setMainLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [currentBlogId, setCurrentBlogId] = useState(null);
  const [commentContent, setCommentContent] = useState("");
  const [username, setUsername] = useState("");

  const handleCommentChange = (event) => {
    setCommentContent(event.target.value);
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    const newCopiedStates = copiedStates.map((state, i) => i === index);
    setCopiedStates(newCopiedStates);
  };

  const cancelCopy = () => {
    setCopiedStates(new Array(blogs.length).fill(false));
  };

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/blog/crud/comments/?blog=${currentBlogId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });

        const data = await response.json();
        setComments(data);
      } catch (error) {
        console.error(error);
      }
    };

    if (currentBlogId !== null) {
      fetchComments();
    }
  }, [currentBlogId]);

  const handleLike = async (blogId, currentLikedState, index) => {
    try {
      const response = await fetch(`http://localhost:8000/api/blog/likes/update/${blogId}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({ liked: !currentLikedState }),
      });

      if (response.ok) {
        // update liked state for the current blog
        const updatedBlogLikes = [...blogs];
        updatedBlogLikes[index].liked_state = !currentLikedState;
        updatedBlogLikes[index].likes = currentLikedState ? updatedBlogLikes[index].likes - 1 : updatedBlogLikes[index].likes + 1;
        setBlogs(updatedBlogLikes);

        // update total likes count
        const updatedLikes = [...likes];
        updatedLikes[index] = currentLikedState ? updatedLikes[index] - 1 : updatedLikes[index] + 1;
        setLikes(updatedLikes);

        // update liked state
        const updatedLiked = [...liked];
        updatedLiked[index] = !currentLikedState;
        setLiked(updatedLiked);
      }   else {
        console.error("Error updating like state");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCommentSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch("http://localhost:8000/api/blog/crud/comments/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({ content: commentContent, blog: currentBlogId }),
      });

      if (response.ok) {
        const newComment = {
          id: response.data.id,
          content: commentContent,
          user: {
            username: username,
          },
        };

        setComments([...comments, newComment]);
        setCommentContent("");
      } else {
        console.error("Error submitting comment");
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchBlogs = async () => {
      setMainLoading(true);
      try {
        const response = await fetch("http://localhost:8000/api/blog/crud/blogs/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setBlogs(data.results);
          setLikes(data.results.map((blog) => blog.likes));
          setLiked(data.results.map((blog) => blog.liked_state));
        } else {
          console.error("Error fetching blogs");
        }
      } catch (error) {
        console.error(error);
      }
      setMainLoading(false);
    };

    fetchBlogs();
  }, []);

  useEffect(() => {
    const socket = io("http://localhost:8000", { transports: ["websocket"] });

    socket.on("like_update", (data) => {
      const { blogId, likedState, likesCount } = data;
      const updatedBlogLikes = blogs.map((blog) => {
        if (blog.id === blogId) {
          return {
            ...blog,
            liked_state: likedState,
            likes: likesCount,
          };
        }
        return blog;
      });
      setBlogs(updatedBlogLikes);

      const updatedLikes = [...likes];
      const updatedLiked = [...liked];
      updatedLikes[currentIndex] = likesCount;
      updatedLiked[currentIndex] = likedState;
      setLikes(updatedLikes);
      setLiked(updatedLiked);
    });

    return () => {
      socket.disconnect();
    };
  }, [blogs, currentIndex, liked, likes]);

  return (
    <div>
      {mainLoading ? (
        <div>Loading...</div>
      ) : (
        <div>
          {blogs.length > 0 ? (
            <div>
              <Carousel selectedItem={currentIndex} onChange={setCurrentIndex}>
                {blogs.map((blog, index) => (
                  <div key={blog.id}>
                    <Typography>{blog.title}</Typography>
                    <Typography>{blog.content}</Typography>
                    <IconButton onClick={() => handleLike(blog.id, liked[index], index)}>
                      <FavoriteIcon color={liked[index] ? "secondary" : "inherit"} />
                    </IconButton>
                    <Typography>{likes[index]}</Typography>
                    <IconButton onClick={() => setOpen(true)}>
                      <ShareIcon />
                    </IconButton>
                    <IconButton>
                      <Link to={`/maps/${blog.location}`}>
                        <MapsUgcRoundedIcon />
                      </Link>
                    </IconButton>
                  </div>
                ))}
              </Carousel>
              <Popover
                open={open}
                onClose={() => setOpen(false)}
                anchorEl={anchorEls[currentIndex]}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
              >
                <Button onClick={() => copyToClipboard(window.location.href, currentIndex)}>
                  {copiedStates[currentIndex] ? "Copied!" : "Copy Link"}
                </Button>
              </Popover>
            </div>
          ) : (
            <div>No blogs found.</div>
          )}
        </div>
      )}
      <div>
        <form onSubmit={handleCommentSubmit}>
          <TextField
            label="Comment"
            variant="outlined"
            value={commentContent}
            onChange={handleCommentChange}
          />
          <Button type="submit">Submit</Button>
        </form>
        {comments.map((comment) => (
          <Typography key={comment.id}>{comment.content}</Typography>
        ))}
      </div>
    </div>
  );
};

export default Likes;

