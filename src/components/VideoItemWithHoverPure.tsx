import { PureComponent, ForwardedRef, forwardRef } from "react";
import { OptimizedImage } from "./OptimizedImage";

type VideoItemWithHoverPureType = {
  src: string;
  innerRef: ForwardedRef<HTMLDivElement>;
  handleHover: (value: boolean) => void;
};

class VideoItemWithHoverPure extends PureComponent<VideoItemWithHoverPureType> {
  render() {
    return (
      <div
        ref={this.props.innerRef}
        style={{
          zIndex: 9,
          cursor: "pointer",
          borderRadius: 0.5,
          width: "100%",
          position: "relative",
          paddingTop: "calc(9 / 16 * 100%)",
        }}
      >
        <OptimizedImage
          src={this.props.src}
          alt="Video thumbnail"
          imageType="backdrop"
          size="medium"
          style={{
            top: 0,
            height: "100%",
            objectFit: "cover",
            position: "absolute",
            borderRadius: "4px",
          }}
          onPointerEnter={() => {
            // console.log("onPointerEnter");
            this.props.handleHover(true);
          }}
          onPointerLeave={() => {
            // console.log("onPointerLeave");
            this.props.handleHover(false);
          }}
        />
      </div>
    );
  }
}

const VideoItemWithHoverRef = forwardRef<
  HTMLDivElement,
  Omit<VideoItemWithHoverPureType, "innerRef">
>((props, ref) => <VideoItemWithHoverPure {...props} innerRef={ref} />);
VideoItemWithHoverRef.displayName = "VideoItemWithHoverRef";

export default VideoItemWithHoverRef;
