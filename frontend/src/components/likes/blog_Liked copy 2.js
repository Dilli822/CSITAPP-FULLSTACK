import React, { useEffect, useState } from "react";
import { IconButton } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShareIcon from "@mui/icons-material/Share";
import CommentIcon from "@mui/icons-material/Comment";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
//import SharePost from "../sharePost/sharePost";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // Import the carousel styles
import { Carousel } from "react-responsive-carousel"; // Import the Carousel component
import { ChatBubbleOutline } from "@material-ui/icons";
import ChatBubbleIcon from "@material-ui/icons/ChatBubble";
import MapsUgcRoundedIcon from "@mui/icons-material/MapsUgcRounded";
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, TextField, makeStyles } from "@mui/material";
import "./CustomDialog.css";
import { io } from "socket.io-client";


const Likes = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [blogs, setBlogs] = useState([]);
    const [likes, setLikes] = useState([]);
    const [liked, setLiked] = useState([]);
    const [comments, setComments] = useState([]);

    const [anchorEls, setAnchorEls] = useState(new Array(blogs.length).fill(null));
    const [shareUrls, setShareUrls] = useState(new Array(blogs.length).fill(""));
    const [copiedStates, setCopiedStates] = useState(new Array(blogs.length).fill(false));
    const [videoLoading, setVideoLoading] = useState(true);
    const [mainLoading, setMainLoading] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    const [open, setOpen] = useState(false);
    const [currentBlogId, setCurrentBlogId] = useState(null);
    const [userData, setUserData] = useState();
    const [username, setUsername] = useState();

    const [commentContent, setCommentContent] = useState("");

    const handleCommentChange = (event) => {
        setCommentContent(event.target.value);
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopiedStates(new Array(blogs.length).fill(false)); // Reset copiedStates to all false
        setCopiedStates(copiedStates.map((state, index) => (index === copiedStates.indexOf(true) ? true : state))); // Set only the currently copied share button's copied state to true
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
                if (currentLikedState) {
                    updatedBlogLikes[index].likes--;
                } else {
                    updatedBlogLikes[index].likes++;
                }
                setBlogs(updatedBlogLikes);
                setMainLoading(false);

                // update total likes count
                const updatedLikes = [...likes];
                if (currentLikedState) {
                    updatedLikes[index]--;
                } else {
                    updatedLikes[index]++;
                }
                setLikes(updatedLikes);

                // update liked state
                const updatedLiked = [...liked];
                updatedLiked[index] = !currentLikedState;
                setLiked(updatedLiked);
                setMainLoading(false);
            } else {
                console.error("Error updating like state");
            }
        } catch (error) {
            console.error(error);
            setMainLoading(true);
        }
    };

    useEffect(() => {
        const fetchLikes = async () => {
            try {
                const response = await fetch("http://localhost:8000/api/blog/likes/", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                });

                const data = await response.json();
                const blogLikes = data.map((blog) => {
                    return {
                        id: blog.id,
                        likes: blog.likes,
                        liked_state: blog.liked_state,
                        title: blog.title,
                        image: blog.image,
                        content: blog.content,
                        authorName: blog.authorName,
                        created_at: blog.created_at,
                        updated_at: blog.updated_at,
                        total_comments: blog.total_comments,
                        video: blog.video,
                    };
                });

                setBlogs(blogLikes);
                setMainLoading(false);
                setLikes(blogLikes.map((blog) => blog.likes));
                setLiked(blogLikes.map((blog) => blog.liked_state));

                console.log(blogLikes);
                setShareUrls(blogLikes.map((blog) => `${window.location.origin}/blog/${blog.id}`));
            } catch (error) {
                console.error(error);
                setMainLoading(true);
            }
        };

        fetchLikes();
    }, []);
 
    useEffect(() => {
    }, [currentBlogId]);

    const fetchUserBlogs = async () => {
        try {
            const response = await fetch("http://localhost:8000/api/blog/user/", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                console.log("User blogs:", data);
                const username = data.username; // Extract the username property
                console.log("Username:", username);
                // Process the received data as needed
                setUsername(username);
            } else {
                console.error("Failed to fetch user blogs");
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    // Call the fetchUserBlogs function to fetch user blogs
    fetchUserBlogs();

    const handleCommentClick = (event, blogId) => {
        setAnchorEl(event.currentTarget);
        setCurrentBlogId(blogId);
        setOpen(true);
    };

    const handleCommentClose = () => {
        setOpen(false);
    };

const handleCommentSubmit = async () => {
  try {
    const response = await fetch("http://localhost:8000/api/blog/crud/comments/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
      body: JSON.stringify({
        blog: currentBlogId,
        commenter: "dilli",
        author: 1,
        comment_content: commentContent,
      }),
    });

    if (response.ok) {
      // Comment posted successfully, update the comments state
      const newComment = {
        id: Math.random().toString(), // Generate a unique ID for the comment
        commenter: "dilli",
        comment_content: commentContent,
      };
      setComments((prevComments) => [...prevComments, newComment]);

      // Emit a 'comment' event to notify other clients about the new comment
      socket.emit("comment", newComment);

      console.log("Comment posted successfully");
    } else {
      console.error("Failed to post comment");
    }
  } catch (error) {
    console.error("Error:", error);
  }

  // After submitting the comment or handling the response, you can clear the input field
  setCommentContent("");
};


useEffect(() => {
  const socket = io("http://localhost:8000"); // Replace with your server URL
  socket.on("comment", handleNewComment);

  return () => {
    socket.disconnect();
  };
}, []);

const handleNewComment = (comment) => {
  // Update the comments state with the new comment
  setComments((prevComments) => [...prevComments, comment]);
};

const httpServer = require("http").createServer();
const io = require("socket.io")(httpServer);

io.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("comment", (comment) => {
    // Process the comment and save it to the database if needed

    // Broadcast the comment to other clients
    socket.broadcast.emit("comment", comment);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

httpServer.listen(8000, () => {
  console.log("WebSocket server listening on port 8000");
});

    return (
        <div>
            {mainLoading ? (
                <p>Loading...</p>
            ) : (
                <div>
                    {/* .sort((a, b) => b.id - a.id) */}
                    {blogs.map((blog, index) => (
                        <div key={blog.id}>
                            <h2>Title: {blog.title}</h2>
                            <h3>Blog Id: {blog.id}</h3>
                            <Carousel showThumbs={false}>
                                {blog.image ? <img style={{ maxWidth: "100%" }} src={`http://localhost:8000${blog.image}`} alt="Image" /> : <p>No image available</p>}
                                {blog.video ? (
                                    <video controls style={{ maxWidth: "100%" }}>
                                        <source src={`http://localhost:8000${blog.video}`} type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                ) : (
                                    <p>No video available</p>
                                )}
                            </Carousel>

                            <div style={{ height: "150px", width: "100%", overflow: "hidden" }}>
                                <p style={{ marginTop: "15px", fontSize: "17px" }}>{blog.content}</p>
                                <p>Author: {blog.authorName}</p>
                                <p>Published Date: {blog.created_at}</p>
                                <p>Updated Date: {blog.updated_at}</p>

                                <br></br>
                            </div>
                            <Link to={`/blog/${blog.id}`}>
                                <div key={blog.id}>
                                    {/* ... */}
                                    View Detail.....
                                </div>
                            </Link>
                            <div style={{ display: "flex", alignItems: "center" }}>
                                <IconButton onClick={() => handleLike(blog.id, blog.liked_state, index)}>
                                    {liked[index] ? <FavoriteIcon color="error" style={{ width: "30px", height: "30px" }} /> : <FavoriteIcon color="black" style={{ width: "30px", height: "30px" }} />}
                                </IconButton>
                                <IconButton onClick={(event) => handleCommentClick(event, blog.id)}>
                                    <MapsUgcRoundedIcon style={{ color: "rgba(0, 0, 0, 0.54)", fontSize: 35 }} />
                                </IconButton>
                                &nbsp; &nbsp; Share
                                <IconButton
                                    aria-describedby={`popover-${index}`}
                                    onClick={(event) => {
                                        const newAnchorEls = [...anchorEls];
                                        newAnchorEls[index] = event.currentTarget;
                                        setAnchorEls(newAnchorEls);
                                    }}
                                >
                                    <ShareIcon color="action" style={{ width: "30px", height: "30px" }} />
                                </IconButton>
                                <Popover
                                    open={Boolean(anchorEls[index])}
                                    anchorEl={anchorEls[index]}
                                    onClose={() => {
                                        const newAnchorEls = [...anchorEls];
                                        newAnchorEls[index] = null;
                                        setAnchorEls(newAnchorEls);
                                        setCopiedStates((prevState) => {
                                            let newState = [...prevState];
                                            newState[index] = false;
                                            return newState;
                                        });
                                        cancelCopy();
                                    }}
                                    anchorOrigin={{
                                        vertical: "bottom",
                                        horizontal: "center",
                                    }}
                                    transformOrigin={{
                                        vertical: "top",
                                        horizontal: "center",
                                    }}
                                >
                                    {copiedStates[index] && <Typography sx={{ p: 2 }}>Link copied to clipboard!</Typography>}
                                    <Typography sx={{ p: 2 }}>{shareUrls[index]}</Typography>
                                    <Button
                                        variant="contained"
                                        disabled={copiedStates[index]}
                                        onClick={() => {
                                            copyToClipboard(shareUrls[index]);
                                            let newCopiedStates = [...copiedStates];
                                            newCopiedStates[index] = true;
                                            setCopiedStates(newCopiedStates);
                                        }}
                                    >
                                        {copiedStates[index] ? "Copied" : "Copy"}
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={() => {
                                            const newAnchorEls = [...anchorEls];
                                            newAnchorEls[index] = null;
                                            setAnchorEls(newAnchorEls);
                                            setCopiedStates((prevState) => {
                                                let newState = [...prevState];
                                                newState[index] = false;
                                                return newState;
                                            });
                                            cancelCopy();
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </Popover>
                            </div>

                            <div style={{ display: "flex" }}>
                                <h5>{likes[index]} like</h5> &nbsp;&nbsp;&nbsp;
                                <h5>Comments: {blog.total_comments} </h5>
                            </div>

                            <Dialog open={open && currentBlogId === blog.id} onClose={handleCommentClose}>
                                <DialogTitle>
                                    <h3>Post: {blog.authorName}</h3> Comments
                                </DialogTitle>
                                <DialogContent className="custom-dialog">
                                    <DialogContentText>
                                        {comments.filter((comment) => comment.blog === currentBlogId).length > 0 ? (
                                            comments
                                                .filter((comment) => comment.blog === currentBlogId)
                                                .map((comment) => (
                                                    <div key={comment.id}>
                                                        <p>Comment by: {comment.commenter} </p>
                                                        <p>{comment.comment_content}</p>
                                                        <hr></hr>
                                                    </div>
                                                ))
                                        ) : (
                                            <p>0 comments</p>
                                        )}
                                    </DialogContentText>
                                    <div style={{ position: "static" }}>
                                        <TextField label="Add a comment" value={commentContent} onChange={handleCommentChange} fullWidth margin="normal" />

                                        <Button onClick={handleCommentSubmit} color="primary">
                                            Comment
                                        </Button>
                                    </div>
                                </DialogContent>
                                <DialogActions>
                                    <Button onClick={handleCommentClose}>Close</Button>
                                </DialogActions>
                            </Dialog>

                            <hr></hr>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Likes;
