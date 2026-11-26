// The production icon, as GitHub shows the Offgrid app, whatever this build's channel.
import appIconUrl from "../../../../assets/prod/offgrid-black-web-apple-touch-180.png";

export function OffgridAppIcon(props: { readonly className?: string }) {
  return <img src={appIconUrl} alt="" className={props.className} />;
}
