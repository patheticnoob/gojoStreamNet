import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import { useSearchAnimeQuery } from "src/store/slices/hiAnimeApi";
import VideoItemWithHover from "src/components/VideoItemWithHover";
import { SearchResultsSkeleton } from "src/components/skeletons";
import ErrorMessages from "src/components/ErrorMessages";

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const query = searchParams.get("q") || "";

  // Reset page when query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  const {
    data: searchResults,
    isLoading,
    error,
    isFetching,
  } = useSearchAnimeQuery(
    { keyword: query, page: currentPage },
    { skip: !query || query.length < 2 }
  );

  const handleLoadMore = () => {
    if (searchResults?.hasNextPage) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  if (!query || query.length < 2) {
    return (
      <Container
        maxWidth={false}
        sx={{
          px: { xs: "30px", sm: "60px" },
          pb: 4,
          pt: "150px",
          bgcolor: "inherit",
          minHeight: "100vh",
        }}
      >
        <Typography variant="h5" sx={{ color: "text.primary", mb: 2 }}>
          Search Anime
        </Typography>
        <Typography variant="body1" sx={{ color: "text.secondary" }}>
          Enter at least 2 characters to search for anime.
        </Typography>
      </Container>
    );
  }

  if (isLoading && currentPage === 1) {
    return (
      <Container
        maxWidth={false}
        sx={{
          px: { xs: "30px", sm: "60px" },
          pb: 4,
          pt: "150px",
          bgcolor: "inherit",
          minHeight: "100vh",
        }}
      >
        <Typography variant="h5" sx={{ color: "text.primary", mb: 3 }}>
          Searching for "{query}"...
        </Typography>
        <SearchResultsSkeleton itemCount={12} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container
        maxWidth={false}
        sx={{
          px: { xs: "30px", sm: "60px" },
          pb: 4,
          pt: "150px",
          bgcolor: "inherit",
          minHeight: "100vh",
        }}
      >
        <Typography variant="h5" sx={{ color: "text.primary", mb: 2 }}>
          Search Results for "{query}"
        </Typography>
        <Box sx={{ mt: 2 }}>
          <ErrorMessages 
            error={error} 
            context="api"
            showDetails={import.meta.env.DEV}
          />
        </Box>
      </Container>
    );
  }

  return (
    <Container
      maxWidth={false}
      sx={{
        px: { xs: "30px", sm: "60px" },
        pb: 4,
        pt: "150px",
        bgcolor: "inherit",
        minHeight: "100vh",
      }}
    >
      <Typography variant="h5" sx={{ color: "text.primary", mb: 2 }}>
        Search Results for "{query}"
      </Typography>
      
      {searchResults?.animes && searchResults.animes.length > 0 ? (
        <>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
            Found {searchResults.animes.length} results
            {searchResults.totalPages > 1 && ` (Page ${currentPage} of ${searchResults.totalPages})`}
          </Typography>
          
          <Grid container spacing={2}>
            {searchResults.animes.map((anime, idx) => (
              <Grid
                key={`${anime.id}_${idx}`}
                item
                xs={6}
                sm={3}
                md={2}
                sx={{ zIndex: 1 }}
              >
                <VideoItemWithHover video={anime} />
              </Grid>
            ))}
          </Grid>

          {searchResults.hasNextPage && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Button
                variant="outlined"
                onClick={handleLoadMore}
                disabled={isFetching}
                sx={{ color: "white", borderColor: "white" }}
              >
                {isFetching ? <CircularProgress size={24} /> : "Load More"}
              </Button>
            </Box>
          )}
        </>
      ) : (
        <Typography variant="body1" sx={{ color: "text.secondary", mt: 2 }}>
          No anime found for "{query}". Try different keywords.
        </Typography>
      )}
    </Container>
  );
}

export const Component = SearchPage;