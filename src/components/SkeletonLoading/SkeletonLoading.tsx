import { userStore } from "../../store/user";
import "./SkeletonLoading.css";
interface Props {
  width: number | string;
  height: number | string;
  margin: number;
  LoadingComponent: any;
  isLoading: boolean;
}
const SkeletonLoading = ({
  width,
  height,
  margin,
  LoadingComponent,
  isLoading,
}: Props) => {
  if (!isLoading) {
    return LoadingComponent;
  }
  return (
    <svg
      aria-labelledby="3sbdhl-aria"
      role="img"
      style={{
        height: height,
        width: width,
        borderRadius: 10,
        margin: margin,
      }}
    >
      <title id="3sbdhl-aria">Loading...</title>
      <rect
        role="presentation"
        x="0"
        y="0"
        width="100%"
        height="100%"
        clipPath="url(#3sbdhl-diff)"
        style={{ fill: 'url("#3sbdhl-animated-diff")' }}
      ></rect>
      <defs>
        <clipPath id="3sbdhl-diff">
          <rect x="0" y="0" width="100%" height="100%"></rect>
        </clipPath>
        <linearGradient id="3sbdhl-animated-diff">
          <stop
            offset="0%"
            stopColor={
              !userStore.currentState().isDarkMode
                ? "#f5f6f7"
                : "rgb(39, 42, 85)"
            }
            stopOpacity="1"
          >
            <animate
              attributeName="offset"
              values="-2; -2; 1"
              keyTimes="0; 0.25; 1"
              dur="0.2s"
              repeatCount="indefinite"
            ></animate>
          </stop>
          <stop
            offset="50%"
            stopColor={
              !userStore.currentState().isDarkMode ? "#eee" : "rgb(88, 95, 184)"
            }
            stopOpacity="1"
          >
            <animate
              attributeName="offset"
              values="-1; -1; 2"
              keyTimes="0; 0.25; 1"
              dur="0.1s"
              repeatCount="indefinite"
            ></animate>
          </stop>
          <stop
            offset="100%"
            stopColor={
              !userStore.currentState().isDarkMode
                ? "#f5f6f7"
                : "rgb(39, 42, 85)"
            }
            stopOpacity="1"
          >
            <animate
              attributeName="offset"
              values="0; 0; 3"
              keyTimes="0; 0.25; 1"
              dur="1s"
              repeatCount="indefinite"
            ></animate>
          </stop>
        </linearGradient>
      </defs>
    </svg>
  );
};

export default SkeletonLoading;
