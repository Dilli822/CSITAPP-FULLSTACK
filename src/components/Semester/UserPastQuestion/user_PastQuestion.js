import React, { useState, useEffect, useRef } from "react";
import Container from "@material-ui/core/Container";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const UserPastQuestionDetails = () => {
    const [documents, setDocuments] = useState([]);
    const [value, setValue] = React.useState(0);

    const [mainLoading, setMainLoading] = useState(false);

    const [successMessage, setSuccessMessage] = useState("");
    const [loading, setLoading] = useState(true);

    const [blogs, setBlogs] = useState([]);

    const [isError, setIsError] = useState(false);

    const [newBlogImage, setNewBlogImage] = useState(null);
    const [updatedBlogImage, setUpdatedBlogImage] = useState(null);
    const [user, setUser] = useState("");
    const [imageUrl, setImageUrl] = useState(null);

    const [authorId, setAuthorId] = useState("");
    const [userId, setUserId] = useState("");

    const [created_at, setCreatedAt] = useState("");
    const accessToken = localStorage.getItem("accessToken");
    const tokenParts = accessToken.split(".");
    const [createdMsg, setCreatedMsg] = "";
    // const [blogLikes,setBlogLikes] = useState(0);
    const [blogLikes, setBlogLikes] = useState(0);

    // Decode the access token payload
    const payload = JSON.parse(atob(tokenParts[1]));

    // Get the expiration time from the payload
    const expirationTime = payload.exp;

    // Calculate the remaining time in seconds until the token expires
    const currentTime = Math.floor(Date.now() / 1000);
    const remainingTime = expirationTime - currentTime;

    const [updatedBlogVideo, setUpdatedBlogVideo] = useState(null);

    const [username, setUserName] = useState(null);

    const [countBlogLikes, setCountBlogLikes] = useState(0);

    const handleLikeClick = () => {
        if (blogLikes === 0) {
            setBlogLikes(blogLikes + 1); // Increase like count
        } else {
            setBlogLikes(blogLikes - 1); // Decrease like count
        }
    };

    console.log(`The access token will expire in ${remainingTime} seconds.`);
    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const response = await fetch("http://localhost:8000/api/blog/list/", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                });

                if (response.status === 401) {
                    console.log("token expired and expired time is", remainingTime);

                    // Access token has expired, use refresh token to get a new access token
                    const refreshResponse = await fetch("http://localhost:8000/api/refresh/", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            refresh: localStorage.getItem("refreshToken"),
                        }),
                    });

                    if (refreshResponse.ok) {
                        const tokens = await refreshResponse.json();
                        localStorage.setItem("accessToken", tokens.access);
                        // Try fetching blogs again with the new access token
                        const newResponse = await fetch("http://localhost:8000/api/blog/list/", {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                            },
                        });
                        const data = await newResponse.json();
                        console.log("blog array data is --->", data);
                        setBlogs(data);
                        setAuthorId(data.author_id);
                        setCountBlogLikes(data.likes);
                        setMainLoading(false);
                        setLoading(false);
                    } else {
                        throw new Error("Refresh token is invalid");
                    }
                } else {
                    const data = await response.json();
                    console.log(data);
                    setBlogs(data);
                    setLoading(false);
                }
            } catch (error) {
                console.error(error);
                setMainLoading(true);
            }
        };

        const fetchUser = async () => {
            try {
                const response = await fetch("http://localhost:8000/api/blog/user/", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                });

                const data = await response.json();
                console.log(data);
                console.log(data.id);
                setUser(data);
                setUserId(data.id);
                setUserName(data.username);
                setMainLoading(false);
            } catch (error) {
                console.error(error);
                setMainLoading(true);
            }
        };
        fetchUser();

        fetchBlogs();
    }, []);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const accessToken = localStorage.getItem("accessToken");
                const response = await fetch("http://localhost:8000/api/blog/documents/crud/", {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
                const data = await response.json();
                setDocuments(data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchDocuments();
    }, []);

    const handleDeleteDocument = async (documentId) => {
        const shouldDelete = window.confirm("Are you sure you want to delete this document?");
        if (shouldDelete) {
            try {
                const accessToken = localStorage.getItem("accessToken");
                const response = await fetch(`http://localhost:8000/api/blog/past-question-documents/crud/${documentId}/`, {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });

                if (response.ok) {
                    // Document deleted successfully, update the state
                    setDocuments((prevDocuments) => prevDocuments.filter((doc) => doc.id !== documentId));
                    setSuccessMessage("Document deleted successfully");
                } else {
                    setSuccessMessage("Failed to delete the document");
                }
            } catch (error) {
                console.error(error);
            }
        }
    };

    return (
        <div>
        <Container maxwidth="sm">
            <h1> User Past Question List</h1>
            <ul>
                {documents.map((document) => {
                    // Filter out documents with invalid author_id values
                    if ( document.author_id == userId) {
                        // Only display the document if the userId matches the author_id
                        if (document.author_id == userId) {
                            return (
                                <li key={document.id}>
                                    {/* <h5>{userId} </h5> */}
                                    <h2>Document Title: {document.title}</h2>
                                   <h4> Author/User ID: {document.author_id}</h4> 
                                    

                                    {/* ... (other document details) */}
                                    <span>Past Question name: </span>
                                    {document.document_file ? (
                                        <a href={`http://localhost:8000${document.document_file}`} target="_blank" rel="noreferrer">
                                            {document.document_file.substring(document.document_file.lastIndexOf("/") + 1)}
                                        </a>
                                    ) : (
                                        <span>File not available</span>
                                    )}
                                    <br />
                                    {document.image_file ? (
                                        <img src={`http://localhost:8000${document.image_file}`} alt="Document Image" className="img-fluid" />
                                    ) : (
                                        <p>No image file available</p>
                                    )}
                                    <br></br>
                                    <button onClick={() => handleDeleteDocument(document.id)}>Delete</button>
                                        <hr></hr>
                                </li>
                            
                            );
                        } else {
                            // If userId doesn't match author_id, return null (i.e., don't render this document)
                            <h5>You have not uploaded any past question</h5>
                            return null;
                        }
                    } else {
                        // Invalid author_id value, return null (i.e., don't render this document)
                  
                        return null;
                    }
                })}

              
                {documents.some((document) => document.author_id == userId) === false && <h5>You have not uploaded any past question</h5>}
            </ul>
        </Container>
    </div>
    );
};

export default UserPastQuestionDetails;
