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
    <section
      className="box"
      style={{
        width,
        height,
        margin,
      }}
    >
      <div
        className="skeleton-placeholder"
        style={{
          background: !userStore.currentState().isDarkMode
            ? "linear-gradient(90deg, #e8e8e8, #f8f8f8, #e8e8e8)"
            : "linear-gradient(90deg, #5757a3, #00000052, #5757a3)",
        }}
      />
    </section>
  );
};

export default SkeletonLoading;
