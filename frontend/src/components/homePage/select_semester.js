import React, { useState } from 'react';
import { FormControl, InputLabel, Select, MenuItem, Typography } from '@material-ui/core';
import Likes from "../likes/blog_Liked";

const SemesterSelect = () => {
  const [selectedOption, setSelectedOption] = useState('');

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };

  return (
    <div>
      <Typography variant="h6">Select Your Semester:</Typography>
      <FormControl fullWidth>

        <Select
          labelId="select-label"
          value={selectedOption}
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
          <MenuItem value="Visitor Semester">Visitor Semester</MenuItem>
        </Select>
      </FormControl>
      {selectedOption && <Typography variant="subtitle1">{selectedOption}  selected</Typography>}
      {selectedOption && <Likes selectedOptionFromSource={selectedOption} />}
    </div>
  );
};

export default SemesterSelect;
