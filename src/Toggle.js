import * as React from 'react';
import InsightsIcon from '@mui/icons-material/Insights';
import MapIcon from '@mui/icons-material/Map';
import TuneIcon from '@mui/icons-material/Tune';
import DehazeIcon from '@mui/icons-material/Dehaze';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import Draggable from 'react-draggable';


export default function ToggleButtonsMultiple({ onChange }) {
//   const [formats, setFormats] = React.useState(() => ['bold', 'italic']);

//   const handleFormat = (event, newFormats) => {
//     setFormats(newFormats);
//   };

  return (
    <Draggable>
        <ToggleButtonGroup
            exclusive
            onChange={onChange}
            aria-label="select component"
        >
        <ToggleButton value="statistics" aria-label="statistics">
            <InsightsIcon />
        </ToggleButton>
        <ToggleButton value="map" aria-label="map">
            <MapIcon />
        </ToggleButton>
        <ToggleButton value="config" aria-label="config">
            <TuneIcon />
        </ToggleButton>
        <ToggleButton value="other" aria-label="other" disabled>
            <DehazeIcon />
            <ArrowDropDownIcon />
        </ToggleButton>
        </ToggleButtonGroup>
    </Draggable>
    
  );
}