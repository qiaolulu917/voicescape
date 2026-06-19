"use client";

import { useScene } from "@/context/SceneContext";

export default function SceneCanvas() {
  const { sceneState, selectedObjectId } = useScene();
  const { objects, background_image_url } = sceneState;

  return (
    <div className="w-full h-full flex items-center justify-center bg-zinc-100 p-4">
      {/* 16:9 画布容器 */}
      <div
        id="scene-canvas"
        className="relative bg-white shadow-md overflow-hidden"
        style={{ aspectRatio: "16/9", width: "100%", maxHeight: "100%" }}
      >
        {/* 背景图层 */}
        {background_image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={background_image_url}
            alt="场景背景"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ zIndex: 0 }}
          />
        )}

        {/* 空画布提示 */}
        {objects.length === 0 && !background_image_url && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-sm text-zinc-300 select-none">
              通过语音描述场景，对象将出现在这里
            </p>
          </div>
        )}

        {/* 对象图层 */}
        {objects.map((obj) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={obj.id}
            src={obj.image_url}
            alt={obj.display_name}
            className="absolute object-contain"
            style={{
              left: obj.position.x,
              top: obj.position.y,
              width: obj.size.width,
              height: obj.size.height,
              zIndex: obj.z_index,
              boxShadow:
                selectedObjectId === obj.id
                  ? "0 0 0 3px #3b82f6, 0 0 12px 3px rgba(59,130,246,0.4)"
                  : "none",
            }}
          />
        ))}
      </div>
    </div>
  );
}
