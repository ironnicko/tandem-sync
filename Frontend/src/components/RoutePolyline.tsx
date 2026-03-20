import { useEffect } from "react";
import { useMap } from "@vis.gl/react-google-maps";

type Props = {
  path: { lat: number; lng: number }[];
};

export default function RoutePolyline({ path }: Props) {
  const map = useMap();

  useEffect(() => {
    if (!map || path.length === 0) return;

    const polyline = new google.maps.Polyline({
      path,
      strokeColor: "#2563cb",
      strokeOpacity: 0.9,
      strokeWeight: 5,
    });

    polyline.setMap(map);

    return () => {
      polyline.setMap(null); // cleanup
    };
  }, [path]);

  return null;
}
