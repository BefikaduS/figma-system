"use strict";
// ============================================================
// FIGMA SYSTEM
// Main Plugin Runtime
// ============================================================
figma.showUI(__html__, {
    width: 420,
    height: 680,
});
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
function sendToUI(message) {
    figma.ui.postMessage(message);
}
// ------------------------------------------------------------
// Message Handler
// ------------------------------------------------------------
figma.ui.onmessage = (msg) => {
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
            const exhaustiveCheck = msg;
            return exhaustiveCheck;
        }
    }
};
