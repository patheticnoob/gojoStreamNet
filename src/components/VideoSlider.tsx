import { useState, useRef } from "react";
import Slider, { Settings } from "react-slick";
import { motion } from "framer-motion";

import { styled, Theme, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";

import CustomNavigation from "./slick-slider/CustomNavigation";
import VideoItemWithHover from "./VideoItemWithHover";
import { ARROW_MAX_WIDTH } from "src/constant";
import NetflixNavigationLink from "./NetflixNavigationLink";
import MotionContainer from "./animate/MotionContainer";
import { varFadeIn } from "./animate/variants/fade/FadeIn";
import { AnimeContent } from "src/types/Anime";

const RootStyle = styled("div")(() => ({
  position: "relative",
  overflow: "inherit",
}));

const StyledSlider = styled(Slider)(
  ({ theme, padding }: { theme: Theme; padding: number }) => ({
    display: "flex !important",
    justifyContent: "center",
    overflow: "initial !important",
    "& > .slick-list": {
      overflow: "visible",
    },
    [theme.breakpoints.up("sm")]: {
      "& > .slick-list": {
        width: `calc(100% - ${2 * padding}px)`,
      },
      "& .slick-list > .slick-track": {
        margin: "0px !important",
      },
      "& .slick-list > .slick-track > .slick-current > div > .NetflixBox-root > .NetflixPaper-root:hover":
        {
          transformOrigin: "0% 50% !important",
        },
    },
    [theme.breakpoints.down("sm")]: {
      "& > .slick-list": {
        width: `calc(100% - ${padding}px)`,
      },
    },
  })
);

interface SlideItemProps {
  item: AnimeContent;
}

function SlideItem({ item }: SlideItemProps) {
  return (
    <Box sx={{ pr: { xs: 0.5, sm: 1 } }}>
      <VideoItemWithHover video={item} />
    </Box>
  );
}

interface AnimeSliderProps {
  title: string;
  animes: AnimeContent[];
  exploreLink?: string;
}

export default function AnimeSlider({ title, animes, exploreLink }: AnimeSliderProps) {
  const sliderRef = useRef<Slider>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [showExplore, setShowExplore] = useState(false);
  const [isEnd, setIsEnd] = useState(false);
  const theme = useTheme();

  const beforeChange = async (currentIndex: number, nextIndex: number) => {
    if (currentIndex < nextIndex) {
      setActiveSlideIndex(nextIndex);
    } else if (currentIndex > nextIndex) {
      setIsEnd(false);
    }
    setActiveSlideIndex(nextIndex);
  };

  const settings: Settings = {
    speed: 500,
    arrows: false,
    infinite: false,
    lazyLoad: "ondemand",
    slidesToShow: 6,
    slidesToScroll: 6,
    beforeChange,
    responsive: [
      {
        breakpoint: 1536,
        settings: {
          slidesToShow: 5,
          slidesToScroll: 5,
        },
      },
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 4,
        },
      },
      {
        breakpoint: 900,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
        },
      },
    ],
  };

  const handlePrevious = () => {
    sliderRef.current?.slickPrev();
  };

  const handleNext = () => {
    sliderRef.current?.slickNext();
  };

  if (!animes || animes.length === 0) {
    return null;
  }

  return (
    <Box sx={{ overflow: "hidden", height: "100%", zIndex: 1 }}>
      <Stack
        spacing={2}
        direction="row"
        alignItems="center"
        sx={{ mb: 2, pl: { xs: "30px", sm: "60px" } }}
      >
        <NetflixNavigationLink
          variant="h5"
          to={exploreLink || "#"}
          sx={{
            display: "inline-block",
            fontWeight: 700,
          }}
          onMouseOver={() => {
            setShowExplore(true);
          }}
          onMouseLeave={() => {
            setShowExplore(false);
          }}
        >
          {`${title} `}
          {exploreLink && (
            <MotionContainer
              open={showExplore}
              initial="initial"
              sx={{ display: "inline", color: "success.main" }}
            >
              {"Explore All".split("").map((letter, index) => (
                <motion.span key={index} variants={varFadeIn}>
                  {letter}
                </motion.span>
              ))}
            </MotionContainer>
          )}
        </NetflixNavigationLink>
      </Stack>

      <RootStyle>
        <CustomNavigation
          isEnd={isEnd}
          arrowWidth={ARROW_MAX_WIDTH}
          onNext={handleNext}
          onPrevious={handlePrevious}
          activeSlideIndex={activeSlideIndex}
        >
          <StyledSlider
            ref={sliderRef}
            {...settings}
            padding={ARROW_MAX_WIDTH}
            theme={theme}
          >
            {animes.map((item) => (
              <SlideItem key={item.id} item={item} />
            ))}
          </StyledSlider>
        </CustomNavigation>
      </RootStyle>
    </Box>
  );
}
