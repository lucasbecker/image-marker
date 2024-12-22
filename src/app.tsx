import {
  ChangeEvent,
  MouseEvent,
  useEffect,
  useRef,
  useState,
  WheelEvent,
} from "react";

type Positon = { x: number; y: number };

const ORIGIN_POSITION: Positon = {
  x: 0.5,
  y: 0.5,
};

const ORIGIN_SCALE = 1;
const STEP_SCALE = 0.1;
const MIN_SCALE = 1;
const MAX_SCALE = 3;

const COLORS = ["red", "blue", "green", "yellow", "black"];

function formatPosition(position: number): string {
  return `${position * 100}%`;
}

export function App() {
  const [scale, setScale] = useState(ORIGIN_SCALE);
  const [image, setImage] = useState<string | null>(null);
  const [points, setPoints] = useState<Array<Positon & { color: string }>>([]);
  const [position, setPosition] = useState<Positon>(ORIGIN_POSITION);
  const [pointColor, setPointColor] = useState<string>(COLORS[0]);
  const [isZoomKeyPressed, setIsZoomKeyPressed] = useState<boolean>(false);

  const imageContainerRef = useRef<HTMLDivElement | null>(null);

  function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
      setPoints([]);
    }
  }

  function handleImageClick(event: MouseEvent) {
    if (!imageContainerRef.current) return;

    const rect = imageContainerRef.current.getBoundingClientRect();

    const mousePositionX = (event.clientX - rect.left) / rect.width;
    const mousePositionY = (event.clientY - rect.top) / rect.height;

    const clickPositionX = (mousePositionX - position.x) / scale + position.x;
    const clickPositionY = (mousePositionY - position.y) / scale + position.y;

    setPoints([
      ...points,
      { x: clickPositionX, y: clickPositionY, color: pointColor },
    ]);
  }

  function handleWheelZoom(event: WheelEvent) {
    // event.preventDefault();
    event.stopPropagation();

    if (!isZoomKeyPressed || !imageContainerRef.current) return;

    const rect = imageContainerRef.current.getBoundingClientRect();

    const mousePositionX = (event.clientX - rect.left) / rect.width;
    const mousePositionY = (event.clientY - rect.top) / rect.height;

    setPosition({ x: mousePositionX, y: mousePositionY });

    const zoomDelta = event.deltaY < 0 ? STEP_SCALE : -STEP_SCALE;

    setScale((prevScale) =>
      Math.min(MAX_SCALE, Math.max(MIN_SCALE, prevScale + zoomDelta))
    );
  }

  function handleResetZoom() {
    setScale(ORIGIN_SCALE);
    setPosition(ORIGIN_POSITION);
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "z" || event.key === "Z") {
        setIsZoomKeyPressed(true);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === "z" || event.key === "Z") {
        setIsZoomKeyPressed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return (
    <main>
      <h1>Image Marker</h1>

      <div
        style={{
          width: "500px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        <input type="file" accept="image/*" onChange={handleImageUpload} />

        <select
          title="Select mark color"
          value={pointColor}
          onChange={(e) => setPointColor(e.target.value)}
          style={{ textTransform: "capitalize" }}
        >
          {COLORS.map((color) => (
            <option
              key={color}
              value={color}
              style={{ textTransform: "capitalize" }}
            >
              {color}
            </option>
          ))}
        </select>
      </div>

      {image && (
        <>
          <div
            style={{
              width: "500px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1rem",
            }}
          >
            <span style={{ textAlign: "left" }}>
              Click on the image to mark. <br />
              Hold <strong>Z and scroll</strong> over the image to zoom.
            </span>

            <button onClick={handleResetZoom}>Reset Zoom</button>
          </div>

          <div
            ref={imageContainerRef}
            onWheel={handleWheelZoom}
            className="card"
            style={{
              position: "relative",
              width: "500px", // Fixed width or make it responsive
              height: "auto",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "relative",
                transform: `scale(${scale})`,
                transformOrigin: `
                  ${formatPosition(position.x)} ${formatPosition(position.y)}
                `,
                width: "100%",
              }}
              onClick={handleImageClick}
            >
              <img
                src={image}
                alt="Uploaded"
                style={{
                  width: "100%",
                  display: "block",
                }}
              />

              {points.map((point, index) => (
                <div
                  key={index}
                  style={{
                    position: "absolute",
                    top: formatPosition(point.y),
                    left: formatPosition(point.x),
                    transform: "translate(-50%, -50%)",
                    backgroundColor: point.color,
                    borderRadius: "50%",
                    height: "10px",
                    width: "10px",
                  }}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </main>
  );
}
