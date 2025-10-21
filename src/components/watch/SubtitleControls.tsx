import { useState, useCallback } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import ListItemText from "@mui/material/ListItemText";
import SubtitlesIcon from "@mui/icons-material/Subtitles";
import SubtitlesOffIcon from "@mui/icons-material/SubtitlesOff";
import Player from "video.js/dist/types/player";

import { SubtitleTrack } from "src/types/Anime";

interface SubtitleControlsProps {
  player: Player | null;
  subtitles: SubtitleTrack[];
  onSubtitleChange?: (subtitle: SubtitleTrack | null) => void;
}

export default function SubtitleControls({
  player,
  subtitles,
  onSubtitleChange,
}: SubtitleControlsProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedSubtitle, setSelectedSubtitle] = useState<SubtitleTrack | null>(
    subtitles.find(sub => sub.default) || null
  );

  const handleMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleSubtitleSelect = useCallback((subtitle: SubtitleTrack | null) => {
    if (!player) return;

    // Disable all text tracks first
    const textTracks = (player as any).textTracks();
    for (let i = 0; i < textTracks.length; i++) {
      const track = textTracks[i];
      if (track.kind === 'subtitles' || track.kind === 'captions') {
        track.mode = 'disabled';
      }
    }

    // Enable the selected subtitle track
    if (subtitle) {
      for (let i = 0; i < textTracks.length; i++) {
        const track = textTracks[i];
        if (track.label === subtitle.label) {
          track.mode = 'showing';
          break;
        }
      }
    }

    setSelectedSubtitle(subtitle);
    handleMenuClose();
    
    if (onSubtitleChange) {
      onSubtitleChange(subtitle);
    }
  }, [player, onSubtitleChange, handleMenuClose]);

  if (!subtitles || subtitles.length === 0) {
    return null;
  }

  return (
    <Box>
      <IconButton
        onClick={handleMenuOpen}
        sx={{
          color: "white",
          bgcolor: "rgba(0, 0, 0, 0.5)",
          "&:hover": {
            bgcolor: "rgba(0, 0, 0, 0.7)",
          },
        }}
      >
        {selectedSubtitle ? <SubtitlesIcon /> : <SubtitlesOffIcon />}
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            bgcolor: "rgba(42, 42, 42, 0.95)",
            color: "white",
            minWidth: 200,
          },
        }}
      >
        <MenuItem
          selected={!selectedSubtitle}
          onClick={() => handleSubtitleSelect(null)}
        >
          <ListItemText>
            <Typography variant="body2">Off</Typography>
          </ListItemText>
        </MenuItem>
        
        {subtitles.map((subtitle) => (
          <MenuItem
            key={subtitle.label}
            selected={selectedSubtitle?.label === subtitle.label}
            onClick={() => handleSubtitleSelect(subtitle)}
          >
            <ListItemText>
              <Typography variant="body2">{subtitle.label}</Typography>
            </ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}