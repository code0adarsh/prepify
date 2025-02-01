import Webcam from "react-webcam";
import { useState } from "react";

export default function CameraFeed() {
  const [isCameraOn, setIsCameraOn] = useState(false);

  return (
    <div className="camera-section">
      <button onClick={() => setIsCameraOn(!isCameraOn)}>
        {isCameraOn ? "Turn Off Camera" : "Turn On Camera"}
      </button>
      {isCameraOn && (
        <Webcam
          audio={false}
          mirrored={true}
          screenshotFormat="image/jpeg"
          className="webcam-feed"
        />
      )}
    </div>
  );
}