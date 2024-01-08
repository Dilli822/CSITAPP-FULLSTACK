import React, { useState,useEffect, useRef  } from "react";
import Container from "@material-ui/core/Container";
import PastQuestionDetails from "../pastQuestions/pastQuestionDetails";
import { useNavigate } from "react-router-dom"; 

const DocumentForm = () => {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };





  const [mainLoading, setMainLoading] = useState(false);
  // Create references for the file input elements
  const documentFileInputRef = useRef(null);
  const imageFileInputRef = useRef(null);

  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [newBlogTitle, setNewBlogTitle] = useState("");
  const [newBlogContent, setNewBlogContent] = useState("");
  const [newBlogAuthorName, setNewBlogAuthorName] = useState("");

  const [newBlogVideo, setNewBlogVideo] = useState(null);

  const [blogs, setBlogs] = useState([]);
  const [selectedBlogId, setSelectedBlogId] = useState("");
  const [updatedBlogTitle, setUpdatedBlogTitle] = useState(undefined);
  const [updatedBlogContent, setUpdatedBlogContent] = useState(undefined);
  const [updatedBlogAuthorName, setUpdatedBlogAuthorName] = useState(undefined);

  const [documentFiles, setDocumentFiles] = useState([]); // An array to store multiple document files
  const [imageFiles, setImageFiles] = useState([]); 
  const [isError, setIsError] = useState(false); 

  const [newBlogImage, setNewBlogImage] = useState(null);
  const [updatedBlogImage, setUpdatedBlogImage] = useState(null);
  const [user, setUser] = useState("");
  const [imageUrl, setImageUrl] = useState(null);

  const [authorId, setAuthorId] = useState(null)
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
  // State variables to hold the form data
 
  const [yearInserted, setYearInserted] = useState("");
  const [regularField, setRegularField] = useState("");
  const [backField, setBackField] = useState("");
  const [documentFile, setDocumentFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  // Event handlers to update the form data state when the user interacts with the inputs
  const handleYearInsertedChange = (e) => setYearInserted(e.target.value);
  const handleRegularFieldChange = (e) => setRegularField(e.target.value);
  const handleBackFieldChange = (e) => setBackField(e.target.value);

  const handleAuthorIdChange = (e) => setAuthorId(e.target.value);


  const handleDocumentFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setDocumentFiles(selectedFiles);
  };

  const handleImageFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setImageFiles(selectedFiles);
  };


  const [removeDocumentFile, setRemoveDocumentFile] = useState(false);
  const [removeImageFile, setRemoveImageFile] = useState(false);

  // Event handlers to handle checkbox changes
  const handleRemoveDocumentFileChange = (e) => {
    setRemoveDocumentFile(e.target.checked);
    if (e.target.checked) {
      setDocumentFile(null);
      documentFileInputRef.current.value = null;
    }
  };

  const handleRemoveImageFileChange = (e) => {
    setRemoveImageFile(e.target.checked);
    if (e.target.checked) {
      setImageFile(null);
      imageFileInputRef.current.value = null;
    }
  };

  
  const handleLikeClick = () => {
      if (blogLikes === 0) {
          setBlogLikes(blogLikes + 1); // Increase like count
      } else {
          setBlogLikes(blogLikes - 1); // Decrease like count
      }
  };


  const navigate = useNavigate(); // Initialize useNavigate

  // Event handler to show the document list when the button is clicked
  const handleShowDocumentList = () => {

    navigate("/past-question-details"); // Use navigate to go to the desired path
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
              setAuthorId(data.id);
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

  console.log("serUser id is noe", userId);



  // Event handler to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("year_inserted", yearInserted);
    formData.append("regular_field", regularField);
    formData.append("back_field", backField);
    formData.append("document_file", documentFile);
    formData.append("image_file", imageFile);
    formData.append("author_id", authorId);

      // Check if the user provided a document file
      if (documentFile) {
        formData.append("document_file", documentFile);
      } else {
        formData.append("document_file", ""); // Sending an empty string as a placeholder for null
      }
    
      // Check if the user provided an image file
      if (imageFile) {
        formData.append("image_file", imageFile);
      } else {
        formData.append("image_file", ""); // Sending an empty string as a placeholder for null
      }

          // Append multiple document files to the formData
    documentFiles.forEach((file) => {
      formData.append("document_files", file);
    });

    // Append multiple image files to the formData
    imageFiles.forEach((file) => {
      formData.append("image_files", file);
    });

    try {
      const response = await fetch("http://localhost:8000/api/blog/documents/crud/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: formData,
      });

      if (response.ok) {
        // Document created successfully
        console.log("Document created successfully");
                // Clear the form after successful submission
                setTitle("");
                setYearInserted("");
                setRegularField("");
                setBackField("");
                setDocumentFile(null);
                setImageFile(null);
                setAuthorId(userId);
                        // Clear the document and image file inputs using their refs
        documentFileInputRef.current.value = null;
        imageFileInputRef.current.value = null;
        setSuccessMessage("Past question uploaded successfully!");
                // Show the success message for 5 seconds
                setTimeout(() => {
                  setSuccessMessage("");
                }, 5000); // 5000 milliseconds = 5 seconds
              }
            
      else {
        // Error occurred while creating document
        console.error("Failed to create document");
        setSuccessMessage("Failed to upload the past question document");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (

    <Container>
    <form onSubmit={handleSubmit}>
      <div>
        <label>Title:</label> <br></br>
        <input type="text" value={title} onChange={handleTitleChange} />
      </div>
      <div>
        <label>Year Inserted:</label> <br></br>
        <input type="number" value={yearInserted} onChange={handleYearInsertedChange} />
      </div>
      <div>
        <label>Regular Exam Paper:</label>
        <span> if you are back then write  </span> <br></br>
        <input type="text" value={regularField} onChange={handleRegularFieldChange} />
      </div>
      <div>
        <label>Back Exam Paper:</label>
        <span> if you are regular then write no </span> <br></br>
        <input type="text" value={backField} onChange={handleBackFieldChange} />
      </div>
      {/* <div>
        <label>Document File:</label> <br></br>
        <input ref={documentFileInputRef}   type="file" accept=".pdf" onChange={handleDocumentFileChange} />
      </div>
      <div>


          
        <label>Image File:</label> <br></br>
        <input ref={imageFileInputRef}  type="file" accept="image/*" onChange={handleImageFileChange} />
      </div> */}

<div>
          <label>Document Files:</label> <br />
          <input
            ref={documentFileInputRef}
            type="file"
            accept=".pdf"
            multiple // Add the "multiple" attribute to allow multiple file selection
            onChange={handleDocumentFileChange}
          />
        </div>
        <div>
          <label>Image Files:</label> <br />
          <input
            ref={imageFileInputRef}
            type="file"
            accept="image/*"
            multiple // Add the "multiple" attribute to allow multiple file selection
            onChange={handleImageFileChange}
          />
        </div>

      {/* <div>
        <label>Author ID:</label> <br></br>
        <input type="text" value={authorId} onChange={handleAuthorIdChange} />
      </div> */}
      <br></br>
      <button type="submit">Upload</button>

          {/* Display the success message if it exists */}
          {successMessage && <p class="alert alert-secondary" >{successMessage}</p>}

    </form>

    <span >See the Past Question</span>
 
    <button onClick={handleShowDocumentList}>See the Past Question</button>
    </Container>
  );
};

export default DocumentForm;
