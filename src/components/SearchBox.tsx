import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { styled } from "@mui/material/styles";
import InputBase from "@mui/material/InputBase";
import SearchIcon from "@mui/icons-material/Search";
import { useSearchAnimeQuery } from "src/store/slices/hiAnimeApi";
import { debounce } from "lodash";

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  width: "100%",
  display: "flex",
  alignItems: "center",
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  cursor: "pointer",
  padding: theme.spacing(0, 1),
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .NetflixInputBase-input": {
    width: 0,
    transition: theme.transitions.create("width", {
      duration: theme.transitions.duration.complex,
      easing: theme.transitions.easing.easeIn,
    }),
    "&:focus": {
      width: "auto",
    },
  },
}));

interface SearchBoxProps {
  onSearchResults?: (results: any) => void;
}

export default function SearchBox({ onSearchResults }: SearchBoxProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>();
  const navigate = useNavigate();

  // Use the search API with skip to prevent automatic queries
  const { data: searchResults, isLoading, error } = useSearchAnimeQuery(
    { keyword: searchQuery, page: 1 },
    { skip: !searchQuery || searchQuery.length < 2 }
  );

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      if (query.length >= 2) {
        setSearchQuery(query);
      } else if (query.length === 0) {
        setSearchQuery("");
      }
    }, 300),
    []
  );

  // Handle search results callback
  useEffect(() => {
    if (onSearchResults && searchResults) {
      onSearchResults(searchResults);
    }
  }, [searchResults, onSearchResults]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    debouncedSearch(value);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && searchQuery.length >= 2) {
      // Navigate to search results page
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      searchInputRef.current?.blur();
    }
  };

  const handleClickSearchIcon = () => {
    if (!isFocused) {
      searchInputRef.current?.focus();
    } else if (searchQuery.length >= 2) {
      // Navigate to search results page when clicking search icon
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      searchInputRef.current?.blur();
    }
  };

  return (
    <Search
      sx={
        isFocused ? { border: "1px solid white", backgroundColor: "black" } : {}
      }
    >
      <SearchIconWrapper onClick={handleClickSearchIcon}>
        <SearchIcon />
      </SearchIconWrapper>
      <StyledInputBase
        inputRef={searchInputRef}
        placeholder="Search anime titles, genres..."
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        inputProps={{
          "aria-label": "search",
          onFocus: () => {
            setIsFocused(true);
          },
          onBlur: () => {
            setIsFocused(false);
          },
        }}
      />
    </Search>
  );
}
