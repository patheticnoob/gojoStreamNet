import { useEffect, useState, useRef } from "react";
import { AnimeContent } from "src/types/Anime";
import { usePortal } from "src/providers/PortalProvider";
import { getOptimizedPosterUrl } from "src/utils/imageOptimization";
import VideoItemWithHoverPure from "./VideoItemWithHoverPure";

interface VideoItemWithHoverProps {
  video: AnimeContent;
}

export default function VideoItemWithHover({ video }: VideoItemWithHoverProps) {
  const setPortal = usePortal();
  const elementRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) {
      setPortal(elementRef.current, video);
    }
  }, [isHovered]);

  // Get the appropriate image source - all content is now anime content
  const getImageSrc = () => {
    return getOptimizedPosterUrl(video.poster, 'medium');
  };

  return (
    <VideoItemWithHoverPure
      ref={elementRef}
      handleHover={setIsHovered}
      src={getImageSrc()}
    />
  );
}
