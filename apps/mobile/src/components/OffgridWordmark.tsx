import type { ColorValue } from "react-native";
import Svg, { Path } from "react-native-svg";
import { withUniwind } from "uniwind";

const ThemedPath = withUniwind(Path);

export function OffgridWordmark(props: {
  readonly height: number;
  readonly color?: ColorValue;
  readonly colorClassName?: string;
}) {
  const aspectRatio = 1;
  return (
    <Svg
      accessibilityLabel="Offgrid"
      height={props.height}
      width={props.height * aspectRatio}
      viewBox="32 30 192 192"
    >
      <ThemedPath
        d="M208 134A88 88 0 1 1 120 46V92A42 42 0 1 0 162 134ZM182 30H214A10 10 0 0 1 224 40V72A10 10 0 0 1 214 82H182A10 10 0 0 1 172 72V40A10 10 0 0 1 182 30Z"
        color={props.color}
        colorClassName={props.colorClassName}
        fill="currentColor"
      />
    </Svg>
  );
}
