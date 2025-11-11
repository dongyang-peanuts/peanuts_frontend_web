import BottomHeader from "@/components/header/BottomHeader";
import Header from "@/components/header/Header";
import InfoModal from "@/components/modal/InfoModal";
import img from "@/assets/img/image (2).png";
import ArrowRight from "@/assets/icons/arrowRight.png";
import ArrowLeft from "@/assets/icons/arrowLeft.png";
import { useEffect, useState } from "react";
import VideoStream from "@/components/VideoStream";

import { CustomOverlayMap, Map, MapMarker } from "react-kakao-maps-sdk";
import useAlertSocket from "@/hook/useAlertSocket";
import { playFallAlarm, stopFallAlarm } from "@/hook/playFallAlarm";

interface PropsType {
  navigate: (address: string) => void;
}

const AllMonitoringView = ({ navigate }: PropsType) => {
  const [visible, setVisible] = useState<boolean>(false);
  const [showMarker, setShowMarker] = useState<boolean>(false);
  const [center, setCenter] = useState({
    lat: 37.450701,
    lng: 127.570667,
  });

  const markerPosition = {
    lat: 37.5665,
    lng: 126.978,
  };

  useAlertSocket((data: any) => {
    if (data.fall) {
      setShowMarker(true);
      setCenter(markerPosition);
      playFallAlarm();
    } else {
      setShowMarker(false);
      stopFallAlarm();
    }
  });

  return (
    <div className="bg-[#F6F7FB] min-h-screen">
      <Header />
      <BottomHeader page="all" />
      <div className="relative w-full">
        <Map
          center={{ lat: 37.450701, lng: 127.570667 }}
          style={{ width: "100%" }}
          level={10}
          className="h-real-screen"
        >
          {showMarker && (
            <>
              <MapMarker
                position={markerPosition}
                onClick={() => setVisible((prev) => !prev)}
              />
              {visible && (
                <CustomOverlayMap
                  position={markerPosition}
                  xAnchor={0}
                  yAnchor={1}
                >
                  <InfoModal />
                </CustomOverlayMap>
              )}
            </>
          )}
        </Map>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center">
          <div className="w-[37px] h-[65px] bg-[#3a3a3a] rounded-lg flex items-center">
            <img src={ArrowLeft} />
          </div>
          <div
            onClick={() => {
              navigate("/all-monitoring/detail");
            }}
            className="flex justify-between w-[974px] mx-4"
          >
            <div className="w-[311px] h-[191px] bg-white">
              <VideoStream width={311} height={191} />
            </div>

            <img className="w-[311px]" src={img} />
            <img className="w-[311px]" src={img} />
          </div>
          <div className="w-[37px] h-[65px] bg-[#3a3a3a] rounded-lg flex items-center">
            <img src={ArrowRight} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllMonitoringView;
