// ============================================================
// FIGMA SYSTEM
// Main Plugin Runtime
//
// Current responsibilities:
// - Open the plugin UI
// - Track Figma selection automatically
// - Inspect selected nodes
// - Communicate with the UI
//
// This is intentionally kept small.
// The extraction engine will be introduced later.
// ============================================================


// ============================================================
// UI
// ============================================================

figma.showUI(__html__, {
  width: 460,
  height: 720,
});


// ============================================================
// Message Types
// ============================================================

type PluginMessage =
  | {
      type: "ui-ready";
    }
  | {
      type: "close-plugin";
    }
  | {
      type: "get-selection";
    }
  | {
      type: "inspect-selection";
    };


// ============================================================
// Selection Data Types
// ============================================================

type SelectionNodeInfo = {
  id: string;
  name: string;
  type: SceneNode["type"];

  x: number;
  y: number;

  width: number;
  height: number;

  opacity: number | null;

  fills: number;
  strokes: number;

  cornerRadius: string | null;

  text: {
    characters: string;
    fontSize: number | null;
  } | null;
};


type SelectionInfo = {
  count: number;
  nodes: SelectionNodeInfo[];
};


// ============================================================
// Helpers
// ============================================================

function isArrayValue(
  value: unknown
): value is readonly unknown[] {
  return Array.isArray(value);
}


function getOpacity(
  node: SceneNode
): number | null {
  if ("opacity" in node) {
    const value = node.opacity;

    if (typeof value === "number") {
      return value;
    }
  }

  return null;
}


function getFillsCount(
  node: SceneNode
): number {
  if (!("fills" in node)) {
    return 0;
  }

  const fills = node.fills;

  if (!isArrayValue(fills)) {
    return 0;
  }

  return fills.length;
}


function getStrokesCount(
  node: SceneNode
): number {
  if (!("strokes" in node)) {
    return 0;
  }

  const strokes = node.strokes;

  if (!isArrayValue(strokes)) {
    return 0;
  }

  return strokes.length;
}


function getCornerRadius(
  node: SceneNode
): string | null {
  if (!("cornerRadius" in node)) {
    return null;
  }

  const radius = node.cornerRadius;

  if (typeof radius === "number") {
    return String(radius);
  }

  if (radius === figma.mixed) {
    return "Mixed";
  }

  return null;
}


function getTextInfo(
  node: SceneNode
): SelectionNodeInfo["text"] {
  if (node.type !== "TEXT") {
    return null;
  }

  let fontSize: number | null = null;

  if (typeof node.fontSize === "number") {
    fontSize = node.fontSize;
  }

  return {
    characters: node.characters,
    fontSize,
  };
}


// ============================================================
// Extract Basic Selection Information
//
// IMPORTANT:
// This is NOT the final Design System extraction engine.
//
// This function only proves that our runtime can safely read
// real values from selected Figma nodes.
//
// Later this will be replaced/expanded by the extraction layer.
// ============================================================

function getSelectionInfo(): SelectionInfo {
  const selection = figma.currentPage.selection;

  return {
    count: selection.length,

    nodes: selection.map((node) => ({
      id: node.id,

      name: node.name,

      type: node.type,

      x: node.x,

      y: node.y,

      width: node.width,

      height: node.height,

      opacity: getOpacity(node),

      fills: getFillsCount(node),

      strokes: getStrokesCount(node),

      cornerRadius: getCornerRadius(node),

      text: getTextInfo(node),
    })),
  };
}


// ============================================================
// Send Message To UI
// ============================================================

function sendToUI(
  message: unknown
): void {
  figma.ui.postMessage(message);
}


// ============================================================
// Send Current Selection
// ============================================================

function sendSelectionInfo(): void {
  sendToUI({
    type: "selection-info",
    selection: getSelectionInfo(),
  });
}


// ============================================================
// Automatic Selection Tracking
//
// Figma officially exposes "selectionchange" for this.
//
// This means the UI does not need a Refresh button to know
// when the user selects/deselects something in Figma.
// ============================================================

figma.on("selectionchange", () => {
  sendSelectionInfo();
});


// ============================================================
// Message Handler
// ============================================================

figma.ui.onmessage = (
  msg: PluginMessage
) => {
  switch (msg.type) {

    // --------------------------------------------------------
    // UI Ready
    // --------------------------------------------------------

    case "ui-ready": {
      sendToUI({
        type: "plugin-ready",
        selection: getSelectionInfo(),
      });

      break;
    }


    // --------------------------------------------------------
    // Manual Selection Request
    //
    // Kept as a fallback/debug action.
    // Automatic selection tracking is still the primary system.
    // --------------------------------------------------------

    case "get-selection": {
      sendSelectionInfo();

      break;
    }


    // --------------------------------------------------------
    // Inspect Selection
    // --------------------------------------------------------

    case "inspect-selection": {
      sendToUI({
        type: "selection-inspection",
        selection: getSelectionInfo(),
      });

      break;
    }


    // --------------------------------------------------------
    // Close
    // --------------------------------------------------------

    case "close-plugin": {
      figma.closePlugin();

      break;
    }


    // --------------------------------------------------------
    // Exhaustiveness Check
    // --------------------------------------------------------

    default: {
      const exhaustiveCheck: never = msg;

      return exhaustiveCheck;
    }
  }
};