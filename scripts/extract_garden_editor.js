const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const gardenPath = path.join(root, "GardenGrid.jsx");
const garden = fs.readFileSync(gardenPath, "utf8");

const start = garden.indexOf("// GARDEN EDITOR (SVG with drag/resize/edit)");
const end = garden.indexOf("// APP ROOT");
if (start === -1 || end === -1 || end <= start) {
  throw new Error("Could not locate GardenEditor block");
}

const block = garden.slice(start, end).trimStart();
const header = `import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Btn } from "../ui/Btn.jsx";
import { Badge } from "../ui/Badge.jsx";
import { Card } from "../ui/Card.jsx";
import { Input } from "../ui/Input.jsx";
import { Sel } from "../ui/Sel.jsx";
import { Textarea } from "../ui/Textarea.jsx";
import { Modal } from "../ui/Modal.jsx";
import { EmptyState } from "../ui/EmptyState.jsx";
import { FormRow } from "../ui/FormRow.jsx";
import { InfoBanner } from "../ui/InfoBanner.jsx";
import { BedShapePicker } from "../ui/BedShapePicker.jsx";
import { T } from "../theme.js";
import { LANG, useT } from "../translations.js";
import { FIELD_TYPES, FIELD_LABEL_K, FIELD_COLORS, STRUCT_TYPES, STRUCT_LABEL_K, STRUCT_ICONS, ZONE_TYPES, ZONE_LABEL_K, ZONE_ICONS, ZONE_FILL, ZONE_STROKE, GH_TYPES } from "../constants.js";
import { forUser, gid, fmtDate, slotDisplayLabel, childSlotsFor, findFieldAtPoint, polygonArea, polygonPointsString, pointInPolygon, polygonCentroid, isInsideGH, slotBaseLabel } from "../helpers.js";
import { renderSlotSeedPlan } from "../slotSeedPlanView.jsx";
import { normalizeSearchText } from "../utils/text.js";
import { GARDEN_TYPE_LABEL_K, MAINTENANCE_STRUCT_TYPES } from "../gardenMeta.js";

const SCALE = 62;

`;

fs.writeFileSync(path.join(root, "src/screens/GardenEditor.jsx"), header + block + "\n", "utf8");

let next = garden.slice(0, start) + garden.slice(end);
next = next.replace(
  'import DevScreen from "./src/screens/DevScreen.jsx";\nimport { LANG, LOCALE_MAP, useT } from "./src/translations.js";\n',
  'import DevScreen from "./src/screens/DevScreen.jsx";\nimport GardenEditor from "./src/screens/GardenEditor.jsx";\nimport { LANG, LOCALE_MAP, useT } from "./src/translations.js";\n'
);

fs.writeFileSync(gardenPath, next, "utf8");
