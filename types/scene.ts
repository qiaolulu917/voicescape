export interface ObjectPosition {
  x: number;
  y: number;
}

export interface ObjectSize {
  width: number;
  height: number;
}

export interface ObjectAttributes {
  color?: string;
}

export interface SceneObject {
  id: string;
  display_name: string;
  type: string;
  image_url: string;
  position: ObjectPosition;
  size: ObjectSize;
  z_index: number;
  attributes: ObjectAttributes;
}

export interface Relation {
  subject_id: string;
  relation_type: "positional" | "attachment";
  relation: string;
  object_id: string;
}

export interface SceneState {
  scene_summary: string;
  background_image_url: string;
  objects: SceneObject[];
  relations: Relation[];
}

export interface ObjectToCreate {
  type: string;
  display_name: string;
  attributes?: ObjectAttributes;
}

// SceneOperation: discriminated union on intent
export type SceneOperation =
  | {
      intent: "create";
      objects_to_create: ObjectToCreate[];
    }
  | {
      intent: "move";
      target_display_name: string;
      position: {
        relation: "left_of" | "right_of" | "front_of" | "behind" | "next_to";
        reference_display_name?: string;
      };
      risk_level: "L1" | "L2" | "L3";
    }
  | {
      intent: "delete";
      target_display_name?: string;
      target_all_of_type?: string;
      risk_level: "L1" | "L2" | "L3";
    }
  | {
      intent: "scale";
      target_display_name: string;
      scale: "larger" | "smaller";
      risk_level: "L1";
    }
  | {
      intent: "recolor";
      target_display_name: string;
      new_color: string;
      risk_level: "L1";
    }
  | {
      intent: "ask_background";
      question: string;
    }
  | {
      intent: "set_background";
      description: string;
    }
  | {
      intent: "clarify";
      clarification_question: string;
      ambiguous_targets: string[];
    }
  | { intent: "confirm" }
  | { intent: "cancel" };
