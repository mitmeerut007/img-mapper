import React, { useEffect, useRef, useState } from "react";
import { Stage, Layer, Rect, Transformer } from "react-konva";

const App = () => {
  const imageRef = useRef(null);
  const [image, setImage] = useState({
    src: "",
    nw: 0,
    nh: 0,
    rw: 0,
    rh: 0,
    smaller: 0,
  });

  const [area, setArea] = useState({
    imgName: "",
    areas: [],
  });

  const labelOptions = ["open-office", "pantry", "cafeteria", "boss-office", "reception", "washroom"];
  const [selectedLabel, setSelectedLabel] = useState("");
  const [generatedCoordinates, setGeneratedCoordinates] = useState("");

  const handleImageUpload = (event) => {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
          setImage((prev) => ({
            ...prev,
            src: img.src,
          }));
        };
      };

      reader.readAsDataURL(file);
    }
  };

  const handleAddRect = () => {
    if (selectedLabel !== "") {
      const newRect = {
        id: area.areas.length + 1,
        label: selectedLabel,
        cords: [0, 0, 100, 100],
        isSelected: false,
        selectedNode: null,
      };

      setArea({
        ...area,
        areas: [...area.areas, newRect],
      });

      setSelectedLabel(""); // Reset to the default value after adding
    }
  };

  const handleRemoveRect = (id) => {
    const updatedAreas = area.areas.filter((rect) => rect.id !== id);
    setArea({
      ...area,
      areas: updatedAreas,
    });
  };

  const handleGenerateCoordinates = () => {
    const coordinates = area.areas.map((rectObj) => ({
      id: rectObj.id,
      label: rectObj.label,
      cords: rectObj.cords,
    }));

    setGeneratedCoordinates(JSON.stringify(coordinates, null, 2));
  };

  const handleRectClicked = (e, id) => {
    setArea((prevArea) => ({
      ...prevArea,
      areas: prevArea.areas.map((rectObj) =>
        rectObj.id === id
          ? { ...rectObj, isSelected: true, selectedNode: e.target }
          : { ...rectObj, isSelected: false, selectedNode: null },
      ),
    }));
  };

  const handleRectDragEnd = (e, id) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    const newAttrs = {
      x: node.x(),
      y: node.y(),
      width: node.width() * scaleX,
      height: node.height() * scaleY,
    };

    const { x, y, width, height } = newAttrs;

    const hike = 100 / (100 - image.smaller);
    console.log(x * hike, y * hike, (x + width) * hike, (y + height) * hike);

    // setArea((prevArea) => ({
    //   ...prevArea,
    //   areas: prevArea.areas.map((rectObj) =>
    //     rectObj.id === id
    //       ? {
    //           ...rectObj,
    //           isSelected: true,
    //           selectedNode: e.target,
    //           cords: [x, y, x + width, y + height],
    //         }
    //       : { ...rectObj, isSelected: false, selectedNode: null },
    //   ),
    // }));
  };

  useEffect(() => {
    handleGenerateCoordinates();
  }, [area]);

  useEffect(() => {
    // Calculate how much smaller the image is rendered as a percentage
    const Ratio = (imageRef.current.clientWidth / imageRef.current.naturalWidth) * 100;

    setImage((prev) => ({
      ...prev,
      nw: imageRef.current.naturalWidth,
      nh: imageRef.current.naturalHeight,
      rw: imageRef.current.clientWidth,
      rh: imageRef.current.clientHeight,
      smaller: 100 - Ratio,
    }));
  }, [image.src]);

  return (
    <div className="w-full max-w-screen-xl mx-auto border min-h-screen p-5">
      <input type="file" accept="image/*" onChange={handleImageUpload} className="border-2 w-full rounded-md p-3" />
      <div>
        <div className="border-2 p-3 mt-10">
          <form className="flex gap-3 items-center">
            <select
              className="w-full border rounded p-3"
              value={selectedLabel}
              onChange={(e) => setSelectedLabel(e.target.value)}
            >
              <option value="">Choose a label from here....</option>
              {labelOptions.map((label) => (
                <option key={label} value={label}>
                  {label}
                </option>
              ))}
            </select>
            <button
              disabled={selectedLabel === ""}
              className="bg-green-500 text-white p-3 rounded w-28 disabled:bg-gray-400"
              onClick={(e) => {
                e.preventDefault();
                handleAddRect();
              }}
            >
              Add Rect
            </button>
          </form>
        </div>
        {area.areas.length > 0 && (
          <div className="p-3 bg-slate-100 mt-10 border-2 rounded grid grid-cols-6 gap-3">
            {area.areas.map((item) => (
              <div key={item.id} className="bg-white border-2 p-2 rounded flex justify-between items-center">
                <p>{item.label}</p>
                <button
                  className="bg-red-500 py-0 px-2.5 pb-1 text-white rounded"
                  onClick={() => {
                    handleRemoveRect(item.id);
                  }}
                >
                  x
                </button>
              </div>
            ))}
          </div>
        )}

        <p className="text-center bg-green-200 my-2">
          Rendered image size : {image?.rw} X {image?.rh} Original image size : {image?.nw} X {image?.nh} Smaller:{" "}
          {image.smaller}%
        </p>

        <div className="p-5 border-2 rounded-md flex justify-center mt-10 bg-slate-100">
          <div className="relative">
            <img ref={imageRef} src={image.src} alt="some" className="w-full max-w-[1000px] mx-auto" />
            <Stage
              width={imageRef?.current?.clientWidth}
              height={imageRef?.current?.clientHeight}
              className="absolute top-0 left-0 z-10 bg-[rgba(0,0,0,0.4)]"
            >
              <Layer>
                {area.areas.map((rectObj) => (
                  <React.Fragment key={rectObj.id}>
                    <Rect
                      x={rectObj.cords[0]}
                      y={rectObj.cords[1]}
                      width={rectObj.cords[2] - rectObj.cords[0]}
                      height={rectObj.cords[3] - rectObj.cords[1]}
                      fill={rectObj?.isSelected ? "green" : "black"}
                      opacity={0.5}
                      onClick={(e) => handleRectClicked(e, rectObj.id)}
                      onDragEnd={(e) => handleRectDragEnd(e, rectObj.id)}
                      draggable={rectObj?.isSelected || false}
                    />
                    {rectObj.selectedNode && (
                      <Transformer
                        anchorSize={6}
                        borderDash={[6, 2]}
                        rotateEnabled={false}
                        onTransformEnd={(e) => handleRectDragEnd(e, rectObj.id)}
                        ref={(node) => {
                          if (node && rectObj?.isSelected) {
                            node.nodes([rectObj?.selectedNode]);
                          }
                        }}
                      />
                    )}
                  </React.Fragment>
                ))}
              </Layer>
            </Stage>
          </div>
        </div>

        <div className="p-5 border-2 rounded-md my-10 bg-slate-100 text-center">
          <button
            className="py-2 px-3 bg-green-500 text-white rounded"
            onClick={() => {
              handleGenerateCoordinates();
            }}
          >
            Generate Image Area Coordinates
          </button>
          <textarea className="w-full border-2 rounded-md mt-5 p-3" rows="10" value={generatedCoordinates} readOnly />
        </div>
      </div>
    </div>
  );
};

export default App;
