import React from 'react';
import { Box, Grid, Container } from '@mui/material';
import AnimeCardSkeleton from './AnimeCardSkeleton';

interface SearchResultsSkeletonProps {
  itemCount?: number;
}

const SearchResultsSkeleton: React.FC<SearchResultsSkeletonProps> = ({
  itemCount = 12
}) => {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        {Array.from({ length: itemCount }, (_, index) => (
          <Grid item xs={6} sm={4} md={3} lg={2} key={index}>
            <AnimeCardSkeleton variant="poster" />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default SearchResultsSkeleton;