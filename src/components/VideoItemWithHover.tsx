import { useEffect, useState, useRef } from "react";
import { AnimeContent } from "src/types/Anime";
import { usePortal } from "src/providers/PortalProvider";
import { useDetailModal } from "src/providers/DetailModalProvider";
import { getOptimizedPosterUrl } from "src/utils/imageOptimization";
import VideoItemWithHoverPure from "./VideoItemWithHoverPure";

interface VideoItemWithHoverProps {
  video: AnimeContent;
}

export default function VideoItemWithHover({ video }: VideoItemWithHoverProps) {
  const setPortal = usePortal();
  const { setDetailType } = useDetailModal();
  const elementRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) {
      setPortal(elementRef.current, video);
    } else {
      // Clear the portal when not hovered
      setPortal(null, null);
    }
  }, [isHovered, setPortal, video]);

  // Handle click to open detail modal
  const handleClick = () => {
    console.log('🎬 Anime card clicked:', video.id, video.title);
    // Clear hover state when opening modal to prevent stuck hover
    setIsHovered(false);
    setDetailType({ id: video.id });
  };

  // Get the appropriate image source - all content is now anime content
  const getImageSrc = () => {
    return getOptimizedPosterUrl(video.poster, 'medium');
  };

  return (
    <VideoItemWithHoverPure
      ref={elementRef}
      handleHover={setIsHovered}
      handleClick={handleClick}
      src={getImageSrc()}
      alt={video.title}
    />
  );
}
