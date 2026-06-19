"use client";

import { useScene } from "@/context/SceneContext";

export default function ObjectPanel() {
  const { sceneState, selectedObjectId, setSelectedObjectId } = useScene();
  const { objects, relations, scene_summary } = sceneState;

  function handleObjectClick(id: string) {
    setSelectedObjectId(selectedObjectId === id ? null : id);
  }

  return (
    <div className="flex flex-col gap-4 h-full p-4">
      {/* 对象列表 */}
      <section>
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
          对象
        </h2>
        {objects.length === 0 ? (
          <p className="text-xs text-zinc-400 text-center mt-4">
            暂无对象，通过语音创建场景
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {objects.map((obj) => (
              <li
                key={obj.id}
                onClick={() => handleObjectClick(obj.id)}
                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer border transition-colors ${
                  selectedObjectId === obj.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-zinc-200 bg-white hover:bg-zinc-50"
                }`}
              >
                {/* 缩略图占位 */}
                <div className="w-10 h-10 rounded bg-zinc-100 shrink-0 overflow-hidden flex items-center justify-center">
                  {obj.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={obj.image_url}
                      alt={obj.display_name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-lg">🖼</span>
                  )}
                </div>
                <span className="text-sm font-medium text-zinc-800 truncate">
                  {obj.display_name}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 关系列表 */}
      {relations.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
            关系
          </h2>
          <ul className="flex flex-col gap-1">
            {relations.map((rel, i) => {
              const subject = objects.find((o) => o.id === rel.subject_id);
              const object = objects.find((o) => o.id === rel.object_id);
              if (!subject || !object) return null;
              return (
                <li key={i} className="text-xs text-zinc-600 py-1 px-2 bg-white rounded border border-zinc-100">
                  {subject.display_name}
                  <span className="text-zinc-400 mx-1">{rel.relation}</span>
                  {object.display_name}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* 场景摘要 */}
      {scene_summary && (
        <section>
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
            场景摘要
          </h2>
          <p className="text-xs text-zinc-600 bg-white rounded border border-zinc-100 px-2 py-2 leading-relaxed">
            {scene_summary}
          </p>
        </section>
      )}
    </div>
  );
}
