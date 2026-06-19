"use client";

import React, { createContext, useContext, useState } from "react";
import type {
  SceneState,
  SceneObject,
  Relation,
} from "@/types/scene";

interface SceneContextValue {
  sceneState: SceneState;
  selectedObjectId: string | null;
  objectTypeCounters: Record<string, number>;
  addObject: (obj: SceneObject) => void;
  removeObject: (id: string) => void;
  updateObject: (id: string, updates: Partial<SceneObject>) => void;
  addRelation: (relation: Relation) => void;
  removeRelation: (subjectId: string, objectId: string) => void;
  setBackground: (url: string, summary: string) => void;
  setSelectedObjectId: (id: string | null) => void;
  incrementTypeCounter: (type: string) => number;
}

const SceneContext = createContext<SceneContextValue | null>(null);

const INITIAL_SCENE: SceneState = {
  scene_summary: "",
  background_image_url: "",
  objects: [],
  relations: [],
};

export function SceneProvider({ children }: { children: React.ReactNode }) {
  const [sceneState, setSceneState] = useState<SceneState>(INITIAL_SCENE);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [objectTypeCounters, setObjectTypeCounters] = useState<Record<string, number>>({});

  function addObject(obj: SceneObject) {
    setSceneState((prev) => ({
      ...prev,
      objects: [...prev.objects, obj],
    }));
  }

  function removeObject(id: string) {
    setSceneState((prev) => ({
      ...prev,
      objects: prev.objects.filter((o) => o.id !== id),
      relations: prev.relations.filter(
        (r) => r.subject_id !== id && r.object_id !== id
      ),
    }));
    if (selectedObjectId === id) setSelectedObjectId(null);
  }

  function updateObject(id: string, updates: Partial<SceneObject>) {
    setSceneState((prev) => ({
      ...prev,
      objects: prev.objects.map((o) =>
        o.id === id ? { ...o, ...updates } : o
      ),
    }));
  }

  function addRelation(relation: Relation) {
    setSceneState((prev) => ({
      ...prev,
      relations: [...prev.relations, relation],
    }));
  }

  function removeRelation(subjectId: string, objectId: string) {
    setSceneState((prev) => ({
      ...prev,
      relations: prev.relations.filter(
        (r) => !(r.subject_id === subjectId && r.object_id === objectId)
      ),
    }));
  }

  function setBackground(url: string, summary: string) {
    setSceneState((prev) => ({
      ...prev,
      background_image_url: url,
      scene_summary: summary,
    }));
  }

  // Returns the new count (1-based) after incrementing, for use in ID generation
  function incrementTypeCounter(type: string): number {
    let next = 1;
    setObjectTypeCounters((prev) => {
      next = (prev[type] ?? 0) + 1;
      return { ...prev, [type]: next };
    });
    return next;
  }

  return (
    <SceneContext.Provider
      value={{
        sceneState,
        selectedObjectId,
        objectTypeCounters,
        addObject,
        removeObject,
        updateObject,
        addRelation,
        removeRelation,
        setBackground,
        setSelectedObjectId,
        incrementTypeCounter,
      }}
    >
      {children}
    </SceneContext.Provider>
  );
}

export function useScene(): SceneContextValue {
  const ctx = useContext(SceneContext);
  if (!ctx) throw new Error("useScene must be used within SceneProvider");
  return ctx;
}
