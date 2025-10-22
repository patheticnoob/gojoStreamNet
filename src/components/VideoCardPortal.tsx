import { useState, useCallback } from "react";
import { Box, Typography, Button, Stack, Chip } from "@mui/material";
import { PlayArrow, Add, ThumbUp } from "@mui/icons-material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import { AnimeContent } from "src/types/Anime";
import { getOptimizedPosterUrl } from "src/utils/imageOptimization";
import { useDetailModal } from "src/providers/DetailModalProvider";
import { MAIN_PATH } from "src/constant";
import NetflixIconButton from "./NetflixIconButton";
import MaxLineTypography from "./MaxLineTypography";

interface VideoCardPortalProps {
  video: AnimeContent;
}

export default function VideoCardPortal({ video }: VideoCardPortalProps) {
  const navigate = useNavigate();
  const { setDetailType } = useDetailModal();
  const [imageLoaded, setImageLoaded] = useState(false);

  const handlePlay = useCallback(() => {
    navigate(`/${MAIN_PATH.watch}?anime=${video.id}&episode=1`);
  }, [navigate, video.id]);

  const handleMoreInfo = useCallback(() => {
    setDetailType({ id: video.id });
  }, [setDetailType, video.id]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2 }}
    >
      <Box
        sx={{
          width: 280,
          bgcolor: "#181818",
          borderRadius: 1,
          overflow: "hidden",
          boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
          border: "2px solid rgba(255,255,255,0.1)",
        }}
      >
        {/* Poster Image */}
        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: 157, // 16:9 aspect ratio for 280px width
            overflow: "hidden",
          }}
        >
          <img
            src={getOptimizedPosterUrl(video.poster, 'medium')}
            alt={video.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: imageLoaded ? 1 : 0,
              transition: "opacity 0.3s ease",
            }}
            onLoad={() => setImageLoaded(true)}
          />
          
          {/* Gradient Overlay */}
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "50%",
              background: "linear-gradient(transparent, rgba(24,24,24,0.8))",
            }}
          />
        </Box>

        {/* Content */}
        <Box sx={{ p: 2 }}>
          {/* Action Buttons */}
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <NetflixIconButton
              size="large"
              onClick={handlePlay}
              sx={{
                bgcolor: "white",
                color: "black",
                "&:hover": { bgcolor: "rgba(255,255,255,0.8)" },
              }}
            >
              <PlayArrow />
            </NetflixIconButton>
            
            <NetflixIconButton size="large">
              <Add />
            </NetflixIconButton>
            
            <NetflixIconButton size="large">
              <ThumbUp />
            </NetflixIconButton>
          </Stack>

          {/* Title */}
          <MaxLineTypography
            variant="subtitle1"
            maxLine={2}
            sx={{
              fontWeight: 600,
              color: "white",
              mb: 1,
              lineHeight: 1.2,
            }}
          >
            {video.title}
          </MaxLineTypography>

          {/* Metadata */}
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            {video.rating > 0 && (
              <Typography variant="caption" sx={{ color: "success.main", fontWeight: 600 }}>
                {Math.round(video.rating * 10)}% Match
              </Typography>
            )}
            
            {video.year > 0 && (
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {video.year}
              </Typography>
            )}
            
            {video.episodes > 0 && (
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {video.episodes} Episodes
              </Typography>
            )}
          </Stack>

          {/* Genres */}
          {video.genres && video.genres.length > 0 && (
            <Stack direction="row" spacing={0.5} sx={{ mb: 1, flexWrap: "wrap" }}>
              {video.genres.slice(0, 3).map((genre) => (
                <Chip
                  key={genre}
                  label={genre}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: "0.7rem",
                    bgcolor: "rgba(255,255,255,0.1)",
                    color: "text.secondary",
                    border: "1px solid rgba(255,255,255,0.2)",
                  }}
                />
              ))}
            </Stack>
          )}

          {/* Description */}
          {video.description && (
            <MaxLineTypography
              variant="caption"
              maxLine={3}
              sx={{
                color: "text.secondary",
                lineHeight: 1.3,
                mb: 2,
              }}
            >
              {video.description}
            </MaxLineTypography>
          )}

          {/* More Info Button */}
          <Button
            variant="outlined"
            size="small"
            onClick={handleMoreInfo}
            sx={{
              width: "100%",
              color: "white",
              borderColor: "rgba(255,255,255,0.3)",
              "&:hover": {
                borderColor: "white",
                bgcolor: "rgba(255,255,255,0.1)",
              },
            }}
          >
            More Info
          </Button>
        </Box>
      </Box>
    </motion.div>
  );
}