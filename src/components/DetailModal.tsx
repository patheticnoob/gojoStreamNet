import { forwardRef, useCallback, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Slide from "@mui/material/Slide";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import { TransitionProps } from "@mui/material/transitions";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import Player from "video.js/dist/types/player";

import MaxLineTypography from "./MaxLineTypography";
import PlayButton from "./PlayButton";
import NetflixIconButton from "./NetflixIconButton";
import AgeLimitChip from "./AgeLimitChip";
import QualityChip from "./QualityChip";
import { getOptimizedPosterUrl } from "src/utils/imageOptimization";
import { useDetailModal } from "src/providers/DetailModalProvider";
import { useGetAnimeDetailQuery, useGetAnimeEpisodesQuery } from "src/store/slices/hiAnimeApi";
import VideoJSPlayer from "./watch/VideoJSPlayer";
import EpisodePlayer from "./watch/EpisodePlayer";

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function DetailModal() {
  const { detail, setDetailType } = useDetailModal();
  const { data: animeDetail, isLoading: isLoadingDetail } = useGetAnimeDetailQuery(
    detail.id!,
    { skip: !detail.id }
  );
  const { data: episodes, isLoading: isLoadingEpisodes } = useGetAnimeEpisodesQuery(
    detail.id!,
    { skip: !detail.id }
  );
  const playerRef = useRef<Player | null>(null);
  const [muted, setMuted] = useState(true);
  const [selectedEpisode, setSelectedEpisode] = useState<string | null>(null);

  const handleReady = useCallback((player: Player) => {
    playerRef.current = player;
    setMuted(player.muted());
  }, []);

  const handleMute = useCallback((status: boolean) => {
    if (playerRef.current) {
      playerRef.current.muted(!status);
      setMuted(!status);
    }
  }, []);

  const handleEpisodeSelect = useCallback((episodeId: string) => {
    setSelectedEpisode(episodeId);
  }, []);

  if (detail.id && animeDetail) {
    return (
      <Dialog
        fullWidth
        scroll="body"
        maxWidth="lg"
        open={!!animeDetail}
        id="detail_dialog"
        TransitionComponent={Transition}
      >
        <DialogContent sx={{ p: 0, bgcolor: "#181818" }}>
          <Box
            sx={{
              top: 0,
              left: 0,
              right: 0,
              position: "relative",
              mb: 3,
            }}
          >
            <Box
              sx={{
                width: "100%",
                position: "relative",
                height: "calc(9 / 16 * 100%)",
                backgroundImage: `url(${getOptimizedPosterUrl(animeDetail.poster, 'xlarge')})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {selectedEpisode ? (
                <EpisodePlayer
                  episodeId={selectedEpisode}
                  onReady={handleReady}
                  autoplay={false}
                  muted={muted}
                />
              ) : (
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<PlayArrowIcon />}
                  sx={{
                    bgcolor: "rgba(255, 255, 255, 0.9)",
                    color: "black",
                    "&:hover": {
                      bgcolor: "rgba(255, 255, 255, 0.7)",
                    },
                  }}
                  onClick={() => {
                    if (episodes?.episodes.length) {
                      handleEpisodeSelect(episodes.episodes[0].id);
                    }
                  }}
                >
                  Play Episode 1
                </Button>
              )}

              <Box
                sx={{
                  background: `linear-gradient(77deg,rgba(0,0,0,.6),transparent 85%)`,
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: "26.09%",
                  opacity: 1,
                  position: "absolute",
                  transition: "opacity .5s",
                }}
              />
              <Box
                sx={{
                  backgroundColor: "transparent",
                  backgroundImage:
                    "linear-gradient(180deg,hsla(0,0%,8%,0) 0,hsla(0,0%,8%,.15) 15%,hsla(0,0%,8%,.35) 29%,hsla(0,0%,8%,.58) 44%,#141414 68%,#141414)",
                  backgroundRepeat: "repeat-x",
                  backgroundPosition: "0px top",
                  backgroundSize: "100% 100%",
                  bottom: 0,
                  position: "absolute",
                  height: "14.7vw",
                  opacity: 1,
                  top: "auto",
                  width: "100%",
                }}
              />
              <IconButton
                onClick={() => {
                  setDetailType({ id: undefined });
                }}
                sx={{
                  top: 15,
                  right: 15,
                  position: "absolute",
                  bgcolor: "#181818",
                  width: { xs: 22, sm: 40 },
                  height: { xs: 22, sm: 40 },
                  "&:hover": {
                    bgcolor: "primary.main",
                  },
                }}
              >
                <CloseIcon
                  sx={{ color: "white", fontSize: { xs: 14, sm: 22 } }}
                />
              </IconButton>
              <Box
                sx={{
                  background: `linear-gradient(77deg,rgba(0,0,0,.6),transparent 85%)`,
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: "26.09%",
                  opacity: 1,
                  position: "absolute",
                  transition: "opacity .5s",
                }}
              />
              <Box
                sx={{
                  backgroundColor: "transparent",
                  backgroundImage:
                    "linear-gradient(180deg,hsla(0,0%,8%,0) 0,hsla(0,0%,8%,.15) 15%,hsla(0,0%,8%,.35) 29%,hsla(0,0%,8%,.58) 44%,#141414 68%,#141414)",
                  backgroundRepeat: "repeat-x",
                  backgroundPosition: "0px top",
                  backgroundSize: "100% 100%",
                  bottom: 0,
                  position: "absolute",
                  height: "14.7vw",
                  opacity: 1,
                  top: "auto",
                  width: "100%",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 16,
                  px: { xs: 2, sm: 3, md: 5 },
                }}
              >
                <MaxLineTypography variant="h4" maxLine={1} sx={{ mb: 2 }}>
                  {animeDetail.title}
                </MaxLineTypography>
                <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                  <PlayButton 
                    sx={{ color: "black", py: 0 }}
                    onClick={() => {
                      if (episodes?.episodes.length) {
                        handleEpisodeSelect(episodes.episodes[0].id);
                      }
                    }}
                  />
                  <NetflixIconButton>
                    <AddIcon />
                  </NetflixIconButton>
                  <NetflixIconButton>
                    <ThumbUpOffAltIcon />
                  </NetflixIconButton>
                  <Box flexGrow={1} />
                  {selectedEpisode && (
                    <NetflixIconButton
                      size="large"
                      onClick={() => handleMute(muted)}
                      sx={{ zIndex: 2 }}
                    >
                      {!muted ? <VolumeUpIcon /> : <VolumeOffIcon />}
                    </NetflixIconButton>
                  )}
                </Stack>

                <Container
                  sx={{
                    p: "0px !important",
                  }}
                >
                  <Grid container spacing={5} alignItems="flex-start">
                    <Grid item xs={12} sm={6} md={8}>
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                        <Typography
                          variant="subtitle1"
                          sx={{ color: "success.main" }}
                        >{`${Math.round(animeDetail.rating * 10)}% Match`}</Typography>
                        <Typography variant="body2">
                          {animeDetail.year}
                        </Typography>
                        <Chip 
                          label={animeDetail.status} 
                          size="small" 
                          sx={{ bgcolor: "rgba(255, 255, 255, 0.1)", color: "white" }}
                        />
                        <Typography variant="subtitle2">
                          {animeDetail.episodes} Episodes
                        </Typography>
                        <Chip 
                          label={animeDetail.type} 
                          size="small" 
                          sx={{ bgcolor: "rgba(255, 255, 255, 0.1)", color: "white" }}
                        />
                        <QualityChip label="HD" />
                      </Stack>

                      <MaxLineTypography
                        maxLine={3}
                        variant="body1"
                        sx={{ mt: 2 }}
                      >
                        {animeDetail.description}
                      </MaxLineTypography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="body2" sx={{ my: 1 }}>
                        {`Genres: ${animeDetail.genres.join(", ")}`}
                      </Typography>
                      <Typography variant="body2" sx={{ my: 1 }}>
                        {`Rating: ${animeDetail.rating}/10`}
                      </Typography>
                      {animeDetail.moreInfo?.aired && (
                        <Typography variant="body2" sx={{ my: 1 }}>
                          {`Aired: ${animeDetail.moreInfo.aired}`}
                        </Typography>
                      )}
                      {animeDetail.moreInfo?.duration && (
                        <Typography variant="body2" sx={{ my: 1 }}>
                          {`Duration: ${animeDetail.moreInfo.duration}`}
                        </Typography>
                      )}
                    </Grid>
                  </Grid>
                </Container>
              </Box>
            </Box>
            
            {/* Episodes Section */}
            {episodes && episodes.episodes.length > 0 && (
              <Container
                sx={{
                  py: 2,
                  px: { xs: 2, sm: 3, md: 5 },
                }}
              >
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Episodes ({episodes.totalEpisodes})
                </Typography>
                <Box
                  sx={{
                    maxHeight: 400,
                    overflowY: "auto",
                    bgcolor: "rgba(42, 42, 42, 0.6)",
                    borderRadius: 1,
                  }}
                >
                  <List dense>
                    {episodes.episodes.map((episode) => (
                      <ListItem key={episode.id} disablePadding>
                        <ListItemButton
                          selected={selectedEpisode === episode.id}
                          onClick={() => handleEpisodeSelect(episode.id)}
                          sx={{
                            "&.Mui-selected": {
                              bgcolor: "rgba(229, 9, 20, 0.2)",
                            },
                            "&:hover": {
                              bgcolor: "rgba(255, 255, 255, 0.1)",
                            },
                          }}
                        >
                          <ListItemText
                            primary={
                              <Stack direction="row" spacing={2} alignItems="center">
                                <Typography variant="body2" sx={{ minWidth: 80 }}>
                                  Episode {episode.number}
                                </Typography>
                                <Typography variant="body1" sx={{ flex: 1 }}>
                                  {episode.title}
                                </Typography>
                                {episode.isFiller && (
                                  <Chip 
                                    label="Filler" 
                                    size="small" 
                                    sx={{ 
                                      bgcolor: "rgba(255, 193, 7, 0.2)", 
                                      color: "#ffc107",
                                      fontSize: "0.7rem"
                                    }}
                                  />
                                )}
                              </Stack>
                            }
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </Container>
            )}
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return null;
}
