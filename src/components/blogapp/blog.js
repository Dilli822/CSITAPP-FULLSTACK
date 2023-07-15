import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import { Container } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import InputBase from "@mui/material/InputBase";
import { alpha } from "@mui/material/styles";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { Link, useNavigate } from "react-router-dom";
import Paper from "@mui/material/Paper";
import { styled } from "@mui/material/styles";
import AccountMenu from "../listed_Menu/account_Menu";
import DeleteIcon from "@mui/icons-material/Delete";
import PastNestedList from "../listed_Menu/past_menu_list";
import SemesterNestedList from "../listed_Menu/semester_subject_menu";
import SearchAppBar from "../searching/top_menu_search";
import Likes from "../likes/blog_Liked";
import zIndex from "@mui/material/styles/zIndex";
import CreateBlog from "../createBlog/createBlog";
import UpdateBlog from "../updateBlog/updateBlog";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";






const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: "center",
    color: theme.palette.text.secondary,
}));

const Search = styled("div")(({ theme }) => ({
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    "&:hover": {
        backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: "100%",
    [theme.breakpoints.up("sm")]: {
        marginLeft: theme.spacing(1),
        width: "auto",
    },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: "inherit",
    "& .MuiInputBase-input": {
        padding: theme.spacing(1, 1, 1, 0),
        // vertical padding + font size from searchIcon
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create("width"),
        width: "100%",
        [theme.breakpoints.up("sm")]: {
            width: "12ch",
            "&:focus": {
                width: "20ch",
            },
        },
    },
}));

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other}>
            {value === index && (
                <Box sx={{ p: 3 }}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        "aria-controls": `simple-tabpanel-${index}`,
    };
}

const Blog = () => {
    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const [videoLoading, setVideoLoading] = useState(true);
    const [selectedOption, setSelectedOption] = useState("");
    const [mainLoading, setMainLoading] = useState(false);

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
    const [defaultOption, setDefaultOption] = useState('');
  
    const handleLikeClick = () => {
        if (blogLikes === 0) {
            setBlogLikes(blogLikes + 1); // Increase like count
        } else {
            setBlogLikes(blogLikes - 1); // Decrease like count
        }
    };



    const handleOptionChange = (event) => {
      setDefaultOption(event.target.value);
    };
  
    const updateSelectedOption = () => {
      setSelectedOption(defaultOption);
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
            } catch (error) {
                console.error(error);
            }
        };
        fetchUser();

        fetchBlogs();
    }, []);

    const navigate = useNavigate();
    
    if (loading) {
        return <span class="loader"></span>;
    }


    return (
        <div>
            <Container maxWidth="auto" style={{ height: "auto", position: "relative" }}>

 

                <div style={{ position: "sticky", top: "0", width: "100%", zIndex: "99" }}>
                    <div style={{ padding: "15px", backgroundColor: "#FFF" }}>
                        <div class="row">
                            <div class="col-3">
                                {/* <h3> {username}</h3>
                 <h4>{userId} </h4> */}
                                <AccountMenu />
                            </div>

                            <div class="col-5">
     
                                <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                                    <Tab label="NewsFeed" {...a11yProps(0)} />
                                    <Tab label="Edit / Delete" {...a11yProps(1)} />
                                    <Tab label="Create/Add New" {...a11yProps(2)} />
                                </Tabs>

                                {successMessage && <div style={{ backgroundColor: "green", color: "white" }}>{successMessage}</div>}
                            </div>
                            <div class="col-4">
                                <div>
                                    <SearchAppBar />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ minHeight: "100vh", width: "100%" }}>
                    <div style={{ padding: "0px", backgroundColor: "#FFf" }}>
                        <div class="row">
                            <div class="col-3">
                                <div style={{ position: "fixed" }}>
                                    <SemesterNestedList selectedOption={selectedOption} />
                                </div>
                            </div>
                            <div class="col-5">
                                <Box sx={{ borderBottom: 1, borderColor: "divider" }}></Box>
                   

                                <TabPanel value={value} index={0}>
          <Likes />
        </TabPanel>

        <TabPanel value={value} index={1}>
          <UpdateBlog />
        </TabPanel>

        <TabPanel value={value} index={2}>
          <CreateBlog />
        </TabPanel>

                            </div>

                            <div class="col-4">


                                <div style={{ position: "fixed" }}>
                                <div>
      <Typography variant="h6">Select Your Semester:</Typography>
      <FormControl fullWidth>
        <InputLabel id="select-label">Choose an option</InputLabel>
        <Select
          labelId="select-label"
          value={defaultOption}
          label="Choose an option"
          onChange={handleOptionChange}
        >
          <MenuItem value="">Choose Your Semester</MenuItem>
          <MenuItem value="First Semester">First Semester</MenuItem>
          <MenuItem value="Second Semester">Second Semester</MenuItem>
          <MenuItem value="Third Semester">Third Semester</MenuItem>
          <MenuItem value="Fourth Semester">Fourth Semester</MenuItem>
          <MenuItem value="Fifth Semester">Fifth Semester</MenuItem>
          <MenuItem value="Sixth Semester">Sixth Semester</MenuItem>
          <MenuItem value="Seventh Semester">Seventh Semester</MenuItem>
          <MenuItem value="Eight Semester">Eight Semester</MenuItem>
          <MenuItem value="Visitor">Visitor</MenuItem>
        </Select>
      </FormControl>
      <br></br>
      {/* {defaultOption && (
        <Typography variant="subtitle1">
          {defaultOption !== "Visitor Semester" ? defaultOption + " selected" : "Visitor option selected"}
        </Typography>
      )} */}
       
      <Button variant="contained" onClick={updateSelectedOption} style={{ margintop: "1rem"}}>Set Default</Button>

    </div>


                                <PastNestedList selectedOption={selectedOption} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>

            <footer style={{ background: "#000", color: "#fff" }}>footer</footer>
        </div>
    );
}

export default Blog;
