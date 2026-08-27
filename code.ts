// ============================================================
// FIGMA SYSTEM
// Main Plugin Runtime
// ============================================================

figma.showUI(__html__, {
  width: 520,
  height: 760,
});

// ------------------------------------------------------------
// Message Types
// ------------------------------------------------------------

type PluginMessage =
  | {
      type: "ui-ready";
    }
  | {
      type: "close-plugin";
    }
  | {
      type: "get-selection";
    };

// ------------------------------------------------------------
// Selection Information
// ------------------------------------------------------------

function getSelectionInfo() {
  const selection = figma.currentPage.selection;

  return {
    count: selection.length,
    nodes: selection.map((node) => ({
      id: node.id,
      name: node.name,
      type: node.type,
    })),
  };
}

// ------------------------------------------------------------
// Send message to UI
// ------------------------------------------------------------

function sendToUI(message: unknown): void {
  figma.ui.postMessage(message);
}

// ------------------------------------------------------------
// Message Handler
// ------------------------------------------------------------

figma.ui.onmessage = (msg: PluginMessage) => {
  switch (msg.type) {
    case "ui-ready": {
      sendToUI({
        type: "plugin-ready",
        selection: getSelectionInfo(),
      });

      break;
    }

    case "get-selection": {
      sendToUI({
        type: "selection-info",
        selection: getSelectionInfo(),
      });

      break;
    }

    case "close-plugin": {
      figma.closePlugin();
      break;
    }

    default: {
      const exhaustiveCheck: never = msg;
      return exhaustiveCheck;
    }
  }
};