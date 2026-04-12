const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const gardenPath = path.join(root, "GardenGrid.jsx");
const garden = fs.readFileSync(gardenPath, "utf8");

const sections = [
  {
    key: "login",
    start: "// LOGIN SCREEN",
    end: "// ACCOUNT SCREEN",
    file: "src/screens/LoginScreen.jsx",
    signature: "function LoginScreen({ state, dispatch, onLogin })",
    replacement: "export default function LoginScreen({ state, dispatch, onLogin })",
    header: `import { useState } from "react";
import { JourneyPanel, buildJourneyTrack } from "../layout/GardenJourney.jsx";
import { Btn } from "../ui/Btn.jsx";
import { Badge } from "../ui/Badge.jsx";
import { Card } from "../ui/Card.jsx";
import { Input } from "../ui/Input.jsx";
import { Sel } from "../ui/Sel.jsx";
import { T } from "../theme.js";
import { LANG, useT } from "../translations.js";
import { USER_COLORS, USER_AVATARS } from "../constants.js";
import { gid } from "../helpers.js";
import { setSession } from "../state/persistence.js";

`,
  },
  {
    key: "account",
    start: "// ACCOUNT SCREEN",
    end: "// SCREEN: GARDEN EDITOR",
    file: "src/screens/AccountScreen.jsx",
    signature: "function AccountScreen({ state, dispatch, navigate, lang, onLogout })",
    replacement: "export default function AccountScreen({ state, dispatch, navigate, lang, onLogout })",
    header: `import { useState } from "react";
import { JourneyPanel, buildUserQuestProgress } from "../layout/GardenJourney.jsx";
import { Badge } from "../ui/Badge.jsx";
import { Btn } from "../ui/Btn.jsx";
import { Card } from "../ui/Card.jsx";
import { Input } from "../ui/Input.jsx";
import { StatCard } from "../ui/StatCard.jsx";
import { T } from "../theme.js";
import { LANG, LOCALE_MAP, useT } from "../translations.js";
import { USER_COLORS, USER_AVATARS } from "../constants.js";
import { forUser } from "../helpers.js";

`,
  },
  {
    key: "editor",
    start: "// SCREEN: GARDEN EDITOR",
    end: "// SCREEN: BEDS & FIELDS",
    file: "src/screens/EditorScreen.jsx",
    signature: "function EditorScreen({ state, dispatch, navigate, lang })",
    replacement: "export default function EditorScreen({ state, dispatch, navigate, lang, GardenEditor })",
    header: `import { useEffect, useState } from "react";
import { PageShell, PageHeader, SectionPanel, PanelGroup, MetaBadge } from "../layout/PageChrome.jsx";
import { Btn } from "../ui/Btn.jsx";
import { Badge } from "../ui/Badge.jsx";
import { Card } from "../ui/Card.jsx";
import { EmptyState } from "../ui/EmptyState.jsx";
import { FormRow } from "../ui/FormRow.jsx";
import { FormActions } from "../ui/FormActions.jsx";
import { InfoBanner } from "../ui/InfoBanner.jsx";
import { Input } from "../ui/Input.jsx";
import { Modal } from "../ui/Modal.jsx";
import { Sel } from "../ui/Sel.jsx";
import { Textarea } from "../ui/Textarea.jsx";
import { BedShapePicker } from "../ui/BedShapePicker.jsx";
import { T } from "../theme.js";
import { LANG, useT } from "../translations.js";
import { GARDEN_TYPES, FIELD_TYPES, FIELD_LABEL_K, FIELD_COLORS, STRUCT_TYPES, STRUCT_LABEL_K, STRUCT_ICONS, ZONE_TYPES, ZONE_LABEL_K, ZONE_ICONS, ZONE_FILL, ZONE_STROKE, GH_TYPES } from "../constants.js";
import { forUser, gid, fmtDate, slotDisplayLabel, childSlotsFor, findFieldAtPoint, polygonArea, polygonPointsString, pointInPolygon, polygonCentroid, isInsideGH } from "../helpers.js";
import { normalizeSearchText } from "../utils/text.js";
import { GARDEN_TYPE_LABEL_K, MAINTENANCE_STRUCT_TYPES } from "../gardenMeta.js";

`,
  },
  {
    key: "fields",
    start: "// SCREEN: BEDS & FIELDS",
    end: "// APP ROOT",
    file: "src/screens/FieldsScreen.jsx",
    signature: "function FieldsScreen({ state, dispatch, navigate, lang })",
    replacement: "export default function FieldsScreen({ state, dispatch, navigate, lang })",
    header: `import { useState } from "react";
import { PageShell, PageHeader, SectionPanel, PanelGroup, MetaBadge } from "../layout/PageChrome.jsx";
import { Btn } from "../ui/Btn.jsx";
import { Badge } from "../ui/Badge.jsx";
import { Card } from "../ui/Card.jsx";
import { EmptyState } from "../ui/EmptyState.jsx";
import { ListRow } from "../ui/ListRow.jsx";
import { Input } from "../ui/Input.jsx";
import { Sel } from "../ui/Sel.jsx";
import { Textarea } from "../ui/Textarea.jsx";
import { Modal } from "../ui/Modal.jsx";
import { FormRow } from "../ui/FormRow.jsx";
import { FormActions } from "../ui/FormActions.jsx";
import { PillFilter } from "../ui/PillFilter.jsx";
import { T } from "../theme.js";
import { LANG, useT } from "../translations.js";
import { FIELD_TYPES, FIELD_LABEL_K, FIELD_COLORS, STRUCT_TYPES, STRUCT_LABEL_K, STRUCT_ICONS, GARDEN_TYPES, GH_TYPES } from "../constants.js";
import { forUser, gid, fmtDate, slotDisplayLabel, childSlotsFor, findFieldAtPoint, polygonArea, polygonPointsString, pointInPolygon, polygonCentroid, isInsideGH } from "../helpers.js";
import { normalizeSearchText } from "../utils/text.js";
import { GARDEN_TYPE_LABEL_K, MAINTENANCE_STRUCT_TYPES } from "../gardenMeta.js";

`,
  },
];

for (const section of sections) {
  const start = garden.indexOf(section.start);
  const end = garden.indexOf(section.end);
  if (start === -1 || end === -1 || end <= start) {
    throw new Error(`Could not locate section ${section.key}`);
  }
  const block = garden.slice(start, end);
  const adjusted = block
    .replace(section.signature, section.replacement)
    .replace(/^\s*\/\/ ----\s*\n\s*/m, "");
  fs.writeFileSync(path.join(root, section.file), section.header + adjusted.trimStart() + "\n", "utf8");
}

let nextGarden = garden;
for (const section of sections.slice().reverse()) {
  const start = nextGarden.indexOf(section.start);
  const end = nextGarden.indexOf(section.end);
  nextGarden = nextGarden.slice(0, start) + nextGarden.slice(end);
}

nextGarden = nextGarden.replace(
  'import DevScreen from "./src/screens/DevScreen.jsx";\nimport { LANG, LOCALE_MAP, useT } from "./src/translations.js";\n',
  'import LoginScreen from "./src/screens/LoginScreen.jsx";\nimport AccountScreen from "./src/screens/AccountScreen.jsx";\nimport EditorScreen from "./src/screens/EditorScreen.jsx";\nimport FieldsScreen from "./src/screens/FieldsScreen.jsx";\nimport DevScreen from "./src/screens/DevScreen.jsx";\nimport { LANG, LOCALE_MAP, useT } from "./src/translations.js";\n'
);

nextGarden = nextGarden.replace(
  '<EditorScreen      {...props}/>',
  '<EditorScreen      {...props} GardenEditor={GardenEditor}/>'
);

fs.writeFileSync(gardenPath, nextGarden, "utf8");
