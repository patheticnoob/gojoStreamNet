import { useEffect, useRef } from "react";
import Player from "video.js/dist/types/player";
import "video.js/dist/video-js.css";

// Dynamic import for video.js to handle potential loading issues
let videojs: any = null;

export default function VideoJSPlayer({
  options,
  onReady,
}: {
  options: any;
  onReady: (player: Player) => void;
}) {
  const videoRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<Player | null>(null);

  useEffect(() => {
    (async function handleVideojs() {
      try {
        // Dynamic import of video.js
        if (!videojs) {
          const videojsModule = await import("video.js");
          videojs = videojsModule.default;
          
          // Import YouTube plugin if needed
          if (options["techOrder"] && options["techOrder"].includes("youtube")) {
            await import("videojs-youtube");
          }
        }

        // Make sure Video.js player is only initialized once
        if (!playerRef.current && videoRef.current) {
          // The Video.js player needs to be _inside_ the component el for React 18 Strict Mode.
          const videoElement = document.createElement("video-js");
          videoElement.classList.add("vjs-big-play-centered");

          videoRef.current.appendChild(videoElement);
          const player = (playerRef.current = videojs(
            videoElement,
            options,
            () => {
              onReady && onReady(player);
            }
          ));

        // import("video.js").then(async ({ default: videojs }) => {
        //   await import("video.js/dist/video-js.css");
        //   if (options["techOrder"] && options["techOrder"].includes("youtube")) {
        //     // eslint-disable-next-line
        //     await import("videojs-youtube");
        //   }
        //   const player = (playerRef.current = videojs(
        //     videoElement,
        //     options,
        //     () => {
        //       onReady && onReady(player);
        //     }
        //   ));
        // });

        // await import("video.js/dist/video-js.css");
        // const videojs = await import("video.js");
        // if (options["techOrder"] && options["techOrder"].includes("youtube")) {
        //   // eslint-disable-next-line
        //   await import("videojs-youtube");
        // }
        // const player = (playerRef.current = videojs.default(
        //   videoElement,
        //   options,
        //   () => {
        //     onReady && onReady(player);
        //   }
        // ));

        // You could update an existing player in the `else` block here
        // on prop change, for example:
        } else if (playerRef.current) {
          const player = playerRef.current;
          // player.autoplay(options.autoplay);
          if (options.width) player.width(options.width);
          if (options.height) player.height(options.height);
        }
      } catch (error) {
        console.error("Failed to initialize Video.js player:", error);
      }
    })();
  }, [options, videoRef]);

  // Dispose the Video.js player when the functional component unmounts
  useEffect(() => {
    const player = playerRef.current;

    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, [playerRef]);

  return (
    <div data-vjs-player>
      <div ref={videoRef} />
    </div>
  );
}
