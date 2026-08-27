// ============================================================
// FIGMA SYSTEM
// Main Plugin Runtime
// ============================================================


// ============================================================
// UI
// ============================================================

figma.showUI(__html__, {
  width: 420,
  height: 680,
});


// ============================================================
// MESSAGE TYPES
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
// SOURCE TYPES
// ============================================================

type RGBColor = {
  r: number;
  g: number;
  b: number;
};


type PaintSource = {
  type: Paint["type"];
  visible?: boolean;
  opacity?: number;
  color?: RGBColor;
  blendMode?: BlendMode;
};


type StrokeSource = {
  type: Paint["type"];
  visible?: boolean;
  opacity?: number;
  color?: RGBColor;
  blendMode?: BlendMode;
};


type TypographySource = {
  characters: string;

  fontSize: number | null;

  fontFamily: string | null;

  fontStyle: string | null;

  fontWeight: number | null;

  letterSpacing: LetterSpacing | null;

  lineHeight: LineHeight | null;

  textCase: TextCase | null;

  textDecoration: TextDecoration | null;

  textAlignHorizontal: string | null;

  textAlignVertical: string | null;
};


type EffectSource = {
  type: Effect["type"];

  visible: boolean;

  radius?: number;

  spread?: number;

  offset?: {
    x: number;
    y: number;
  };

  color?: {
    r: number;
    g: number;
    b: number;
    a: number;
  };
};


type SourceNode = {
  id: string;

  name: string;

  type: SceneNode["type"];

  x: number;

  y: number;

  width: number;

  height: number;

  opacity: number | null;

  fills: PaintSource[] | null;

  strokes: StrokeSource[] | null;

  strokeWeight: number | null;

  cornerRadius: number | null;

  effects: EffectSource[] | null;

  layoutMode:
    | "HORIZONTAL"
    | "VERTICAL"
    | "NONE"
    | null;

  itemSpacing: number | null;

  paddingLeft: number | null;

  paddingRight: number | null;

  paddingTop: number | null;

  paddingBottom: number | null;

  typography: TypographySource | null;
};


type SelectionSource = {
  count: number;

  nodes: SourceNode[];
};


// ============================================================
// HELPERS
// ============================================================

function isPaintArray(
  value: readonly Paint[] | typeof figma.mixed,
): value is readonly Paint[] {

  return Array.isArray(value);
}


function isEffectArray(
  value: readonly Effect[] | typeof figma.mixed,
): value is readonly Effect[] {

  return Array.isArray(value);
}


function isSolidPaint(
  paint: Paint,
): paint is SolidPaint {

  return paint.type === "SOLID";
}


function extractColor(
  paint: SolidPaint,
): RGBColor {

  return {
    r: paint.color.r,
    g: paint.color.g,
    b: paint.color.b,
  };
}


// ============================================================
// PAINT EXTRACTION
// ============================================================

function extractPaints(
  paints: readonly Paint[] | typeof figma.mixed,
): PaintSource[] | null {

  if (!isPaintArray(paints)) {
    return null;
  }

  return paints.map((paint) => {

    const result: PaintSource = {
      type: paint.type,
    };

    if ("visible" in paint) {

      result.visible =
        paint.visible;
    }

    if ("opacity" in paint) {

      result.opacity =
        paint.opacity;
    }

    if ("blendMode" in paint) {

      result.blendMode =
        paint.blendMode;
    }

    if (isSolidPaint(paint)) {

      result.color =
        extractColor(paint);
    }

    return result;
  });
}


// ============================================================
// STROKE EXTRACTION
// ============================================================

function extractStrokes(
  node: SceneNode,
): StrokeSource[] | null {

  if (!("strokes" in node)) {
    return null;
  }

  const strokes =
    node.strokes;

  return strokes.map((paint) => {

    const result: StrokeSource = {
      type: paint.type,
    };

    if ("visible" in paint) {

      result.visible =
        paint.visible;
    }

    if ("opacity" in paint) {

      result.opacity =
        paint.opacity;
    }

    if ("blendMode" in paint) {

      result.blendMode =
        paint.blendMode;
    }

    if (isSolidPaint(paint)) {

      result.color =
        extractColor(paint);
    }

    return result;
  });
}


// ============================================================
// EFFECT EXTRACTION
// ============================================================

function extractEffects(
  node: SceneNode,
): EffectSource[] | null {

  if (!("effects" in node)) {
    return null;
  }

  const effects =
    node.effects;

  if (!isEffectArray(effects)) {
    return null;
  }

  return effects.map((effect) => {

    const result: EffectSource = {
      type: effect.type,
      visible: effect.visible,
    };

    if (
      "radius" in effect &&
      typeof effect.radius === "number"
    ) {

      result.radius =
        effect.radius;
    }

    if (
      "spread" in effect &&
      typeof effect.spread === "number"
    ) {

      result.spread =
        effect.spread;
    }

    if ("offset" in effect) {

      result.offset = {
        x: effect.offset.x,
        y: effect.offset.y,
      };
    }

    if (
      "color" in effect &&
      effect.color
    ) {

      result.color = {
        r: effect.color.r,
        g: effect.color.g,
        b: effect.color.b,
        a: effect.color.a,
      };
    }

    return result;
  });
}


// ============================================================
// CORNER RADIUS
// ============================================================

function extractCornerRadius(
  node: SceneNode,
): number | null {

  if (!("cornerRadius" in node)) {
    return null;
  }

  const value =
    node.cornerRadius;

  if (
    typeof value !== "number"
  ) {

    return null;
  }

  return value;
}


// ============================================================
// OPACITY
// ============================================================

function extractOpacity(
  node: SceneNode,
): number | null {

  if (!("opacity" in node)) {
    return null;
  }

  const value =
    node.opacity;

  return typeof value === "number"
    ? value
    : null;
}


// ============================================================
// LAYOUT
// ============================================================

function extractLayout(
  node: SceneNode,
) {

  let layoutMode:
    | "HORIZONTAL"
    | "VERTICAL"
    | "NONE"
    | null = null;

  let itemSpacing:
    number | null = null;

  let paddingLeft:
    number | null = null;

  let paddingRight:
    number | null = null;

  let paddingTop:
    number | null = null;

  let paddingBottom:
    number | null = null;


  if ("layoutMode" in node) {

    const mode =
      node.layoutMode;

    layoutMode =
      mode === "HORIZONTAL"
        ? "HORIZONTAL"
        : mode === "VERTICAL"
          ? "VERTICAL"
          : "NONE";
  }


  if (
    "itemSpacing" in node &&
    typeof node.itemSpacing === "number"
  ) {

    itemSpacing =
      node.itemSpacing;
  }


  if (
    "paddingLeft" in node &&
    typeof node.paddingLeft === "number"
  ) {

    paddingLeft =
      node.paddingLeft;
  }


  if (
    "paddingRight" in node &&
    typeof node.paddingRight === "number"
  ) {

    paddingRight =
      node.paddingRight;
  }


  if (
    "paddingTop" in node &&
    typeof node.paddingTop === "number"
  ) {

    paddingTop =
      node.paddingTop;
  }


  if (
    "paddingBottom" in node &&
    typeof node.paddingBottom === "number"
  ) {

    paddingBottom =
      node.paddingBottom;
  }


  return {
    layoutMode,

    itemSpacing,

    paddingLeft,

    paddingRight,

    paddingTop,

    paddingBottom,
  };
}


// ============================================================
// TYPOGRAPHY
// ============================================================

function extractTypography(
  node: SceneNode,
): TypographySource | null {

  if (node.type !== "TEXT") {
    return null;
  }


  const fontSize =
    typeof node.fontSize === "number"
      ? node.fontSize
      : null;


  let fontFamily:
    string | null = null;

  let fontStyle:
    string | null = null;


  if (
    node.fontName !== figma.mixed
  ) {

    fontFamily =
      node.fontName.family;

    fontStyle =
      node.fontName.style;
  }


  let fontWeight:
    number | null = null;


  if (
    node.fontWeight !== figma.mixed &&
    typeof node.fontWeight === "number"
  ) {

    fontWeight =
      node.fontWeight;
  }


  const letterSpacing =
    node.letterSpacing === figma.mixed
      ? null
      : node.letterSpacing;


  const lineHeight =
    node.lineHeight === figma.mixed
      ? null
      : node.lineHeight;


  const textCase =
    node.textCase === figma.mixed
      ? null
      : node.textCase;


  const textDecoration =
    node.textDecoration === figma.mixed
      ? null
      : node.textDecoration;


const textAlignHorizontal =
  node.textAlignHorizontal;


const textAlignVertical =
  node.textAlignVertical;

  return {

    characters:
      node.characters,

    fontSize,

    fontFamily,

    fontStyle,

    fontWeight,

    letterSpacing,

    lineHeight,

    textCase,

    textDecoration,

    textAlignHorizontal,

    textAlignVertical,
  };
}


// ============================================================
// NODE EXTRACTION
// ============================================================

function extractNode(
  node: SceneNode,
): SourceNode {

  const layout =
    extractLayout(node);


  return {

    id:
      node.id,

    name:
      node.name,

    type:
      node.type,

    x:
      node.x,

    y:
      node.y,

    width:
      node.width,

    height:
      node.height,

    opacity:
      extractOpacity(node),

    fills:
      "fills" in node
        ? extractPaints(node.fills)
        : null,

    strokes:
      extractStrokes(node),

    strokeWeight:
      "strokeWeight" in node &&
      typeof node.strokeWeight === "number"
        ? node.strokeWeight
        : null,

    cornerRadius:
      extractCornerRadius(node),

    effects:
      extractEffects(node),

    layoutMode:
      layout.layoutMode,

    itemSpacing:
      layout.itemSpacing,

    paddingLeft:
      layout.paddingLeft,

    paddingRight:
      layout.paddingRight,

    paddingTop:
      layout.paddingTop,

    paddingBottom:
      layout.paddingBottom,

    typography:
      extractTypography(node),
  };
}


// ============================================================
// SELECTION EXTRACTION
// ============================================================

function extractSelection(): SelectionSource {

  const selection =
    figma.currentPage.selection;


  return {

    count:
      selection.length,

    nodes:
      selection.map(
        (node) =>
          extractNode(node),
      ),
  };
}


// ============================================================
// SEND TO UI
// ============================================================

function sendSelection(
  messageType:
    | "plugin-ready"
    | "selection-info"
    | "selection-inspection",
): void {

  figma.ui.postMessage({

    type:
      messageType,

    selection:
      extractSelection(),
  });
}


// ============================================================
// AUTOMATIC SELECTION UPDATES
// ============================================================

figma.on(
  "selectionchange",
  () => {

    sendSelection(
      "selection-info",
    );
  },
);


// ============================================================
// MESSAGE HANDLER
// ============================================================

figma.ui.onmessage = (
  msg: PluginMessage,
) => {

  switch (msg.type) {

    case "ui-ready": {

      sendSelection(
        "plugin-ready",
      );

      break;
    }


    case "get-selection": {

      sendSelection(
        "selection-info",
      );

      break;
    }


    case "inspect-selection": {

      sendSelection(
        "selection-inspection",
      );

      break;
    }


    case "close-plugin": {

      figma.closePlugin();

      break;
    }


    default: {

      const exhaustiveCheck:
        never = msg;

      return exhaustiveCheck;
    }
  }
};