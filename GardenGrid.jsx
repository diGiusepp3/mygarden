import React, { useState, useEffect, useReducer, useCallback, useMemo, useRef, createContext, useContext } from "react";
import { PageShell, PageHeader, SectionPanel, PanelGroup, QuickAction, MetaBadge } from "./src/layout/PageChrome.jsx";
import { JourneyPanel, buildJourneyTrack, buildProfileJourney, buildUserQuestProgress } from "./src/layout/GardenJourney.jsx";
import { SCREEN_ROUTES, SCREEN_NAMES, getRouteFromHash, formatScreenHash } from "./src/routes.js";
import { ScreenErrorBoundary } from "./src/ui/ScreenErrorBoundary.jsx";
import DashboardScreen from "./src/screens/DashboardScreen.jsx";
import GardensScreen from "./src/screens/GardensScreen.jsx";
import PlantsScreen from "./src/screens/PlantsScreen.jsx";
import TasksScreen from "./src/screens/TasksScreen.jsx";
import GreenhouseScreen from "./src/screens/GreenhouseScreen.jsx";
import SettingsScreen from "./src/screens/SettingsScreen.jsx";
import LoginScreen from "./src/screens/LoginScreen.jsx";
import AccountScreen from "./src/screens/AccountScreen.jsx";
import EditorScreen from "./src/screens/EditorScreen.jsx";
import FieldsScreen from "./src/screens/FieldsScreen.jsx";
import DevScreen from "./src/screens/DevScreen.jsx";
import { LANG, LOCALE_MAP, useT } from "./src/translations.js";
import { Btn } from "./src/ui/Btn.jsx";
import { Badge } from "./src/ui/Badge.jsx";
import { ListRow } from "./src/ui/ListRow.jsx";
import { Input } from "./src/ui/Input.jsx";
import { Sel } from "./src/ui/Sel.jsx";
import { Textarea } from "./src/ui/Textarea.jsx";
import { Modal } from "./src/ui/Modal.jsx";
import { EmptyState } from "./src/ui/EmptyState.jsx";
import { Card } from "./src/ui/Card.jsx";
import { StatCard } from "./src/ui/StatCard.jsx";
import { SectionHeader } from "./src/ui/SectionHeader.jsx";
import { FormRow } from "./src/ui/FormRow.jsx";
import { FormActions } from "./src/ui/FormActions.jsx";
import { InfoBanner } from "./src/ui/InfoBanner.jsx";
import { PillFilter } from "./src/ui/PillFilter.jsx";
import { BedShapePicker } from "./src/ui/BedShapePicker.jsx";

const T = {
    // Backgrounds & Surfaces
    bg:"#F5F0E8", surface:"#FFFFFF", surfaceAlt:"#EDE8DF", surfaceSoft:"#FBF9F4",
    surfaceMuted:"#F4F0EA", surfaceHov:"#F0EBE2",
    surfaceGlass:"rgba(255,255,255,0.7)", surfaceGlassHov:"rgba(255,255,255,0.85)",
    panelBg:"#FBF8F7",
    // Borders
    border:"#DDD6CC", borderLight:"#EAE4DA",
    borderSoft:"rgba(31,46,26,0.12)", borderMuted:"rgba(31,46,26,0.08)",
    borderGlass:"rgba(31,46,26,0.15)",
    // Primary (Green)
    primary:"#2B5C10", primaryHov:"#3A7318", primaryActive:"#1F4007",
    primaryBg:"#E8F2DF", primaryBgLight:"#F1F7E9", primaryLight:"#EEF5E8",
    primaryFocus:"rgba(43,92,16,0.4)",
    // Accent (Orange)
    accent:"#C4622D", accentHov:"#A84F20", accentActive:"#8C3F18",
    accentBg:"#FAE8DA", accentBgLight:"#FDF2EA",
    // Text
    text:"#1A1916", textSub:"#5E5955", textMuted:"#9B9690", textLight:"#B8B0A8",
    // Semantic
    success:"#2E7D32", successBg:"#E8F5E9", successHov:"#388E3C",
    warning:"#D4890A", warningBg:"#FFF8E0", warningHov:"#E0931A",
    danger:"#C62828", dangerBg:"#FFEBEE", dangerHov:"#D32F2F",
    info:"#1565C0", infoBg:"#E3F2FD", infoHov:"#1976D2",
    // Spacing
    spacing:16, spacingLg:24, spacingSm:8, spacingXs:4,
    // Border Radius
    r:"10px", rs:"6px", rl:"16px",
    radiusLg:"14px", radiusMd:"10px", radiusSm:"6px", radiusRound:"9999px",
    // Shadows
    sh:"0 1px 3px rgba(0,0,0,0.07),0 1px 2px rgba(0,0,0,0.04)",
    shMd:"0 4px 14px rgba(0,0,0,0.1)",
    shLg:"0 8px 32px rgba(0,0,0,0.14)",
    shUp:"0 -2px 8px rgba(0,0,0,0.08)",
    shInset:"inset 0 1px 0 rgba(255,255,255,0.4)",
    // Glass
    glassBlur:"blur(12px)", glassBlurSm:"blur(8px)", glassBlurLg:"blur(16px)",
    glassBg:"rgba(255,255,255,0.7)", glassBgDim:"rgba(255,255,255,0.6)",
    glassBgStrong:"rgba(255,255,255,0.85)", glassBorder:"rgba(255,255,255,0.25)",
    // Focus
    focusRing:"0 0 0 3px rgba(43,92,16,0.2)", focusRingColor:"rgba(43,92,16,0.2)",
    // Transitions
    transitionFast:"0.15s ease", transitionBase:"0.2s ease", transitionSlow:"0.3s ease",
    // Card
    cardBorder:"rgba(33,33,33,0.08)", cardBg:"#FFFFFF", cardGlass:"rgba(255,255,255,0.7)",
};
const SCALE = 62; 


// ----
// CONSTANTS
// ----
// Bed and field types shown in the garden editor and in the dashboard labels.
const FIELD_TYPES   = ["open_field","raised_bed","greenhouse_bed","herb_bed","flower_bed","fruit_area","nursery"];
const FIELD_LABEL_K = { open_field:"field_open", raised_bed:"field_raised", greenhouse_bed:"field_gh", herb_bed:"field_herb", flower_bed:"field_flower", fruit_area:"field_fruit", nursery:"field_nursery" };
const FIELD_COLORS  = { open_field:"#7CB342", raised_bed:"#558B2F", greenhouse_bed:"#00838F", herb_bed:"#43A047", flower_bed:"#BA68C8", fruit_area:"#FB8C00", nursery:"#8D6E63" };
// Freestanding structures that can be placed in a garden.
const STRUCT_TYPES  = [
    "greenhouse",
    "tunnel_greenhouse",
    "compost_zone",
    "water_point",
    "shed",
    "path",
    "fence",
    "animal_enclosure",
    "chicken_coop",
    "chicken_run",
    "cold_frame",
    "raised_tunnel",
    "rain_barrel",
    "potting_bench",
    "tool_rack",
    "insect_hotel",
    "hedge",
    "trellis",
    "windbreak",
    "orchard_row",
];
const STRUCT_LABEL_K= {
    greenhouse:"struct_greenhouse",
    tunnel_greenhouse:"struct_tunnel",
    compost_zone:"struct_compost",
    water_point:"struct_water",
    shed:"struct_shed",
    path:"struct_path",
    fence:"struct_fence",
    animal_enclosure:"struct_animal",
    chicken_coop:"struct_chicken_coop",
    chicken_run:"struct_chicken_run",
    cold_frame:"struct_cold_frame",
    raised_tunnel:"struct_raised_tunnel",
    rain_barrel:"struct_rain_barrel",
    potting_bench:"struct_potting_bench",
    tool_rack:"struct_tool_rack",
    insect_hotel:"struct_insect_hotel",
    hedge:"struct_hedge",
    trellis:"struct_trellis",
    windbreak:"struct_windbreak",
    orchard_row:"struct_orchard_row",
};
const STRUCT_ICONS  = {
    greenhouse:"??",
    tunnel_greenhouse:"?",
    compost_zone:"??",
    water_point:"??",
    shed:"???",
    path:"???",
    fence:"??",
    animal_enclosure:"??",
    chicken_coop:"??",
    chicken_run:"??",
    cold_frame:"??",
    raised_tunnel:"??",
    rain_barrel:"???",
    potting_bench:"??",
    tool_rack:"??",
    insect_hotel:"??",
    hedge:"??",
    trellis:"??",
    windbreak:"???",
    orchard_row:"??",
};
const STRUCT_FILL   = {
    greenhouse:"rgba(0,131,143,0.18)",
    tunnel_greenhouse:"rgba(0,150,136,0.18)",
    compost_zone:"rgba(121,85,72,0.22)",
    water_point:"rgba(66,165,245,0.55)",
    shed:"rgba(121,85,72,0.28)",
    path:"rgba(188,170,164,0.42)",
    fence:"rgba(78,52,46,0.4)",
    animal_enclosure:"rgba(255,183,77,0.3)",
    chicken_coop:"rgba(255,213,79,0.26)",
    chicken_run:"rgba(245,124,0,0.18)",
    cold_frame:"rgba(96,125,139,0.18)",
    raised_tunnel:"rgba(76,175,80,0.16)",
    rain_barrel:"rgba(33,150,243,0.22)",
    potting_bench:"rgba(139,195,74,0.18)",
    tool_rack:"rgba(158,158,158,0.22)",
    insect_hotel:"rgba(255,193,7,0.20)",
    hedge:"rgba(76,175,80,0.20)",
    trellis:"rgba(121,85,72,0.18)",
    windbreak:"rgba(96,125,139,0.22)",
    orchard_row:"rgba(255,152,0,0.18)",
};
const STRUCT_STROKE = {
    greenhouse:"#00838F",
    tunnel_greenhouse:"#009688",
    compost_zone:"#795548",
    water_point:"#1976D2",
    shed:"#5D4037",
    path:"#8D6E63",
    fence:"#4E342E",
    animal_enclosure:"#F57C00",
    chicken_coop:"#C9A227",
    chicken_run:"#E65100",
    cold_frame:"#607D8B",
    raised_tunnel:"#2E7D32",
    rain_barrel:"#1565C0",
    potting_bench:"#558B2F",
    tool_rack:"#616161",
    insect_hotel:"#F9A825",
    hedge:"#2E7D32",
    trellis:"#795548",
    windbreak:"#607D8B",
    orchard_row:"#FB8C00",
};
// Ground cover / zone types used for decorative or zoning overlays.
const ZONE_TYPES    = ["grass","path","gravel","border","mulch","shade","pond","animal","herb","flower","tree"];
const ZONE_LABEL_K  = { grass:"zone_grass", path:"zone_path", gravel:"zone_gravel", border:"zone_border", mulch:"zone_mulch", shade:"zone_shade", pond:"zone_pond", animal:"zone_animal", herb:"zone_herb", flower:"zone_flower", tree:"zone_tree" };
const ZONE_ICONS    = { grass:"??", path:"??", gravel:"??", border:"??", mulch:"??", shade:"??", pond:"??", animal:"??", herb:"??", flower:"??", tree:"??" };
const ZONE_FILL     = { grass:"rgba(76,175,80,0.24)", path:"rgba(188,170,164,0.48)", gravel:"rgba(158,158,158,0.32)", border:"rgba(139,195,74,0.20)", mulch:"rgba(121,85,72,0.22)", shade:"rgba(96,125,139,0.18)", pond:"rgba(33,150,243,0.25)", animal:"rgba(255,183,77,0.22)", herb:"rgba(67,160,71,0.22)", flower:"rgba(186,104,200,0.20)", tree:"rgba(46,125,50,0.24)" };
const ZONE_STROKE   = { grass:"#4CAF50", path:"#8D6E63", gravel:"#757575", border:"#7CB342", mulch:"#795548", shade:"#607D8B", pond:"#2196F3", animal:"#F57C00", herb:"#43A047", flower:"#BA68C8", tree:"#2E7D32" };
// Plant lifecycle states, mapped to translation keys and UI chips.
const PLANT_STATUSES= ["planned","sown","planted","growing","harvestable","harvested","removed"];
const STATUS_K      = { planned:"status_planned", sown:"status_sown", planted:"status_planted", growing:"status_growing", harvestable:"status_harvestable", harvested:"status_harvested", removed:"status_removed" };
const STATUS_CFG    = { planned:{color:T.info,bg:T.infoBg}, sown:{color:"#5D4037",bg:"#EFEBE9"}, planted:{color:"#2E7D32",bg:"#E8F5E9"}, growing:{color:"#388E3C",bg:"#F1F8E9"}, harvestable:{color:T.accent,bg:T.accentBg}, harvested:{color:"#1B5E20",bg:"#E8F5E9"}, removed:{color:"#757575",bg:"#F5F5F5"} };
// Task lifecycle states and task type icons used across task cards and filters.
const TASK_STATUS_K = { pending:"task_pending", in_progress:"task_in_progress", done:"task_done", skipped:"task_skipped" };
const TASK_STATUS_C = { pending:{color:T.warning,bg:T.warningBg}, in_progress:{color:T.info,bg:T.infoBg}, done:{color:T.success,bg:T.successBg}, skipped:{color:T.textMuted,bg:T.surfaceAlt} };
const TASK_TYPES    = ["sowing","planting","watering","fertilizing","pruning","harvesting","cleaning","repair","general"];
const TASK_ICONS    = { sowing:"??", planting:"??", watering:"??", fertilizing:"??", pruning:"??", harvesting:"??", cleaning:"??", repair:"??", general:"??" };
// Category and garden-type buckets for the plant library and setup flows.
const CATEGORIES    = ["Vegetable","Herb","Fruit","Flower","Legume","Root","Leafy Green","Ornamental","Balcony","Container","Perennial","Shrub","Tree","Climber","Other"];
const CAT_ICONS     = { Vegetable:"??", Herb:"??", Fruit:"??", Flower:"??", Legume:"??", Root:"??", "Leafy Green":"??", Ornamental:"??", Balcony:"??", Container:"??", Perennial:"??", Shrub:"??", Tree:"??", Climber:"??", Other:"??" };
const GARDEN_TYPES  = ["mixed","vegetable","ornamental","balcony","container","herb","flower","fruit","greenhouse","allotment","patio","roof_terrace","wildlife"];
const GARDEN_TYPE_LABEL_K = {
    mixed:"garden_type_mixed",
    vegetable:"garden_type_vegetable",
    ornamental:"garden_type_ornamental",
    balcony:"garden_type_balcony",
    container:"garden_type_container",
    herb:"garden_type_herb",
    flower:"garden_type_flower",
    fruit:"garden_type_fruit",
    greenhouse:"garden_type_greenhouse",
    allotment:"garden_type_allotment",
    patio:"garden_type_patio",
    roof_terrace:"garden_type_roof_terrace",
    wildlife:"garden_type_wildlife",
};
const USER_COLORS   = ["#2B5C10","#1565C0","#C4622D","#7B1FA2","#00695C","#E65100","#37474F","#AD1457"];
const USER_AVATARS  = ["?????","?????","?????","?????","?????","?????","??","??"];
const GH_TYPES      = ["greenhouse","tunnel_greenhouse"];
const MAINTENANCE_STRUCT_TYPES = new Set(["hedge","trellis","windbreak","orchard_row"]);
const normalizeSearchText = (value) => String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

// ----
// PLANT LIBRARY (60+ species)
// ----
const PLANT_LIB = [
    // Vegetables
    { name:"Tomato",       category:"Vegetable",   varieties:["Roma","Cherry","Beefsteak","San Marzano","Black Krim","Yellow Pear","Gardener's Delight","OG","OG-tomaat"] },
    { name:"Pepper",       category:"Vegetable",   varieties:["Sweet Bell","Paprika","Jalapeño","Cayenne","Cayennepeper","Habanero","Banana Pepper"] },
    { name:"Aubergine",    category:"Vegetable",   varieties:["Black Beauty","Listada di Gandia","White Egg","Slim Jim"] },
    { name:"Zucchini",     category:"Vegetable",   varieties:["Dark Green","Golden","Romanesco","Patio Star","Cocozelle"] },
    { name:"Cucumber",     category:"Vegetable",   varieties:["Marketmore","Gherkin","Mini Munch","Straight Eight","Crystal Apple"] },
    { name:"Pumpkin",      category:"Vegetable",   varieties:["Hokkaido","Butternut","Crown Prince","Atlantic Giant","Uchiki Kuri"] },
    { name:"Broccoli",     category:"Vegetable",   varieties:["Calabrese","Purple Sprouting","Romanesco","Tenderstem"] },
    { name:"Cauliflower",  category:"Vegetable",   varieties:["Snowball","Violetta","Graffiti","All the Year Round"] },
    { name:"Cabbage",      category:"Vegetable",   varieties:["January King","Savoy","Red Drumhead","Pointed","Hispi"] },
    { name:"Kale",         category:"Leafy Green", varieties:["Cavolo Nero","Curly Scotch","Red Russian","Dwarf Green Curled"] },
    { name:"Chard",        category:"Leafy Green", varieties:["Rainbow","Bright Lights","White Silver","Rhubarb Chard","Fordhook Giant"] },
    { name:"Lettuce",      category:"Leafy Green", varieties:["Butterhead","Cos","Little Gem","Oakleaf","Lollo Rosso","Batavia","Webb's Wonderful"] },
    { name:"Spinach",      category:"Leafy Green", varieties:["Baby Leaf","Monstrueux de Viroflay","Matador","Giant Noble"] },
    { name:"Rocket",       category:"Leafy Green", varieties:["Wild","Cultivated","Sky Rocket","Wasabi"] },
    { name:"Pak Choi",     category:"Leafy Green", varieties:["Canton White","Joi Choi","Purple Rain","Mei Qing Choi"] },
    { name:"Chicory",      category:"Leafy Green", varieties:["Radicchio","Endive","Witloof","Puntarelle","Sugar Loaf"] },
    { name:"Fennel",       category:"Vegetable",   varieties:["Florence","Romanesco","Zefa Fino","Perfection"] },
    { name:"Celery",       category:"Vegetable",   varieties:["Utah","Self-blanching","Giant Red","Tall Utah"] },
    { name:"Leek",         category:"Vegetable",   varieties:["Musselburgh","King Richard","Bleu de Solaise","Autumn Giant"] },
    { name:"Onion",        category:"Vegetable",   varieties:["Red Baron","Stuttgart","Sturon","White Lisbon","Spring Onion","Lente ui","Ailsa Craig"] },
    { name:"Garlic",       category:"Vegetable",   varieties:["Softneck","Hardneck","Elephant","Solent Wight","Lautrec Wight"] },
    { name:"Shallot",      category:"Vegetable",   varieties:["Zebrune","Ambition","Red Sun","Mikor"] },
    { name:"Sweetcorn",    category:"Vegetable",   varieties:["Earlibird","Golden Bantam","Painted Mountain","Swift","Lark"] },
    { name:"Artichoke",    category:"Vegetable",   varieties:["Green Globe","Violetto","Romanesco","Gros Vert de Laon"] },
    { name:"Asparagus",    category:"Vegetable",   varieties:["Jersey Knight","Gijnlim","Connover's Colossal","Pacific Purple"] },
    { name:"Courgette",    category:"Vegetable",   varieties:["Atena","Venus","Defender","Black Forest"] },
    { name:"Peas (Sugar)", category:"Legume",      varieties:["Oregon Sugar Pod","Carouby de Maussane","Golden Sweet","Shiraz"] },
    // Roots
    { name:"Carrot",       category:"Root",        varieties:["Nantes","Chantenay","Paris Market","Cosmic Purple","White Satin","Autumn King"] },
    { name:"Beetroot",     category:"Root",        varieties:["Boltardy","Chioggia","Golden","Cylindra","Bull's Blood","Action"] },
    { name:"Parsnip",      category:"Root",        varieties:["Gladiator","Tender & True","Hollow Crown","White Gem"] },
    { name:"Turnip",       category:"Root",        varieties:["Purple Top","Tokyo Cross","Milan White","Golden Ball"] },
    { name:"Radish",       category:"Root",        varieties:["French Breakfast","Cherry Belle","Watermelon","Daikon","Black Spanish","Radijs","Radijzen","Rettich"] },
    { name:"Potato",       category:"Root",        varieties:["Charlotte","Maris Piper","King Edward","Desiree","Pink Fir Apple","Jersey Royal"] },
    { name:"Sweet Potato", category:"Root",        varieties:["Beauregard","Hernandez","O'Henry","Erato Orange"] },
    { name:"Celeriac",     category:"Root",        varieties:["Prinz","Giant Prague","Monarch","Brilliant"] },
    { name:"Swede",        category:"Root",        varieties:["Marian","Best of All","Wilhemsburger"] },
    // Herbs
    { name:"Basil",        category:"Herb",        varieties:["Genovese","Thai","Purple Opal","Lemon","Holy","Greek Miniature","Basilicum"] },
    { name:"Parsley",      category:"Herb",        varieties:["Flat-leaf","Curly","Krul peterselie","Hamburg Root","Italian Giant"] },
    { name:"Cilantro",     category:"Herb",        varieties:["Leisure","Confetti","Santo","Calypso"] },
    { name:"Dill",         category:"Herb",        varieties:["Bouquet","Fernleaf","Mammoth","Dukat"] },
    { name:"Chives",       category:"Herb",        varieties:["Common","Garlic Chives","Giant Siberian","Staro"] },
    { name:"Mint",         category:"Herb",        varieties:["Spearmint","Peppermint","Apple Mint","Chocolate Mint","Moroccan","Munt"] },
    { name:"Oregano",      category:"Herb",        varieties:["Greek","Italian","Golden","Compactum"] },
    { name:"Thyme",        category:"Herb",        varieties:["Common","Lemon","Silver Posie","Creeping","Doone Valley"] },
    { name:"Rosemary",     category:"Herb",        varieties:["Tuscan Blue","Miss Jessopp","Majorca Pink","Prostratus"] },
    { name:"Sage",         category:"Herb",        varieties:["Common","Purple","Tricolor","Pineapple","Icterina"] },
    { name:"Tarragon",     category:"Herb",        varieties:["French","Russian","Mexican"] },
    { name:"Lemon Balm",   category:"Herb",        varieties:["Common","Variegated","Aurea","Quedlinburger"] },
    { name:"Lavender",     category:"Herb",        varieties:["Hidcote","Munstead","Vera","Grosso","Phenomenal"] },
    { name:"Borage",       category:"Herb",        varieties:["Common","White Flowered","Creeping"] },
    { name:"Chervil",      category:"Herb",        varieties:["Common","Curled","Brussels Winter"] },
    { name:"Lovage",       category:"Herb",        varieties:["Common"] },
    { name:"Marjoram",     category:"Herb",        varieties:["Sweet","Pot","Golden","Compact"] },
    // Legumes
    { name:"French Bean",  category:"Legume",      varieties:["Blue Lake","Cobra","Borlotti","Dwarf Tendergreen","Climbing Neckarqueen"] },
    { name:"Runner Bean",  category:"Legume",      varieties:["Scarlet Emperor","Enorma","White Lady","Painted Lady","Hestia"] },
    { name:"Broad Bean",   category:"Legume",      varieties:["Aquadulce Claudia","The Sutton","Witkiem Manita","Imperial Green Longpod"] },
    { name:"Pea",          category:"Legume",      varieties:["Kelvedon Wonder","Sugar Snap","Mangetout","Petit Pois","Telephone"] },
    { name:"Borlotti Bean",category:"Legume",      varieties:["Lingua di Fuoco","Lamon","Yin Yang"] },
    // Fruits
    { name:"Strawberry",   category:"Fruit",       varieties:["Elsanta","Mara des Bois","Honeoye","Aromel","Cambridge Favourite"] },
    { name:"Raspberry",    category:"Fruit",       varieties:["Glen Ample","Autumn Bliss","Joan J","Tulameen","Polka"] },
    { name:"Blueberry",    category:"Fruit",       varieties:["Bluecrop","Duke","Chandler","Pink Lemonade","Patriot"] },
    { name:"Rhubarb",      category:"Fruit",       varieties:["Timperley Early","Victoria","Champagne","Glaskin's Perpetual"] },
    { name:"Gooseberry",   category:"Fruit",       varieties:["Invicta","Hinnonmäki Red","Captivator","Pax"] },
    { name:"Currant",      category:"Fruit",       varieties:["Ben Sarek (Black)","Jonkheer van Tets (Red)","White Versailles"] },
    { name:"Fig",          category:"Fruit",       varieties:["Brown Turkey","Brunswick","White Marseilles","Violette de Solliès"] },
    { name:"Melon",        category:"Fruit",       varieties:["Blenheim Orange","Sweetheart","Emir","Ogen"] },
    // Flowers (companion/edible)
    { name:"Marigold",     category:"Flower",      varieties:["French Dwarf","African Giant","Crackerjack","Lemon Gem","Disco Orange"] },
    { name:"Nasturtium",   category:"Flower",      varieties:["Jewel Mix","Alaska","Empress of India","Climbing","Black Velvet"] },
    { name:"Sunflower",    category:"Flower",      varieties:["Dwarf Sunspot","Giant Russian","Teddy Bear","Velvet Queen","Strawberry Blonde"] },
    { name:"Calendula",    category:"Flower",      varieties:["Orange King","Lemon Cream","Pacific Beauty","Indian Prince"] },
    { name:"Sweet Pea",    category:"Flower",      varieties:["Old Spice Mix","Matucana","Cupani","Spencer Mixed","Wiltshire Ripple"] },
    { name:"Cosmos",       category:"Flower",      varieties:["Purity","Sensation Mix","Dazzler","Fizzy","Cupcakes"] },
    { name:"Borage",       category:"Flower",      varieties:["Blue","White","Creeping"] },
    { name:"Phacelia",     category:"Flower",      varieties:["Common","Lacy"] },
    // Ornamental, balcony, patio and support plants
    { name:"Rose",         category:"Ornamental", varieties:["Hybrid Tea","Floribunda","Climbing","Shrub","English Rose"] },
    { name:"Hydrangea",    category:"Ornamental", varieties:["Mophead","Lacecap","Panicle","Oakleaf"] },
    { name:"Dahlia",       category:"Ornamental", varieties:["Decorative","Cactus","Pompon","Dinner Plate","Bishop"] },
    { name:"Geranium",     category:"Balcony",    varieties:["Ivy-leaved","Zonal","Scented","Trailing","Regal"] },
    { name:"Petunia",      category:"Balcony",    varieties:["Grandiflora","Multiflora","Surfinia","Wave","Milliflora"] },
    { name:"Begonia",      category:"Balcony",    varieties:["Tuberous","Wax","Boliviensis","Dragon Wing"] },
    { name:"Fuchsia",      category:"Balcony",    varieties:["Trailing","Hardy","Bush","Half-hardy"] },
    { name:"Hosta",        category:"Perennial",  varieties:["Blue Angel","Francee","Halcyon","Sum and Substance"] },
    { name:"Hellebore",    category:"Perennial",  varieties:["Christmas Rose","Lenten Rose","Ice N' Roses"] },
    { name:"Clematis",     category:"Climber",    varieties:["Montana","Viticella","Jackmanii","Armandii","Nelly Moser"] },
    { name:"Ivy",          category:"Climber",    varieties:["English","Algerian","Persian","Baltic"] },
    { name:"Wisteria",     category:"Climber",    varieties:["Sinensis","Floribunda","Prolific","Black Dragon"] },
    { name:"Boxwood",      category:"Shrub",      varieties:["Suffruticosa","Green Velvet","Faulkner","Winter Gem"] },
    { name:"Bamboo",       category:"Shrub",      varieties:["Fargesia","Black Bamboo","Golden Goddess","Bissetii"] },
    { name:"Ornamental Grass", category:"Ornamental", varieties:["Miscanthus","Panicum","Carex","Pennisetum"] },
    { name:"Container Strawberry", category:"Container", varieties:["Albion","Mara des Bois","Temptation","Rumba"] },
    { name:"Lemon Tree",   category:"Tree",       varieties:["Meyer","Eureka","Lisbon","Ponderosa"] },
    { name:"Apple Tree",   category:"Tree",       varieties:["Elstar","Jonagold","Boskoop","Gala","Discovery"] },
    { name:"Pear Tree",    category:"Tree",       varieties:["Conference","Doyenné du Comice","Williams","Beurré Hardy"] },
    { name:"Cherry Tree",  category:"Tree",       varieties:["Kordia","Regina","Stella","Lapins"] },
    { name:"Wildlife Mix", category:"Other",      varieties:["Bee mix","Bird friendly","Pollinator strip","Meadow blend"] },
];

// ----
// SEED DATA
// ----
const gid = () => Math.random().toString(36).slice(2, 10);

const SEED = {
    // Demo accounts used for the initial dashboard and login state.
    users: [
        { id:"u1", name:"Alex", email:"alex@gardengrid.app", password:"garden123", avatar:"?????", color:"#2B5C10", settings:{ lang:"en" }, created_at:"2026-01-15T10:00:00.000Z" },
        { id:"u2", name:"Sam",  email:"sam@gardengrid.app",  password:"moestuin1", avatar:"?????", color:"#1565C0", settings:{ lang:"nl" }, created_at:"2026-02-01T09:00:00.000Z" },
    ],
    activeUserId: null,
    // Garden canvases with dimensions, type and notes.
    gardens: [
        { id:"g1", user_id:"u1", name:"Backyard Kitchen Garden", width:14, height:10, unit:"m", type:"mixed",     notes:"Main veg garden — raised beds, open rows, greenhouse and tunnel." },
        { id:"g2", user_id:"u1", name:"Herb & Flower Garden",    width:8,  height:6,  unit:"m", type:"herb",      notes:"Dedicated herb and pollinator garden." },
        { id:"g3", user_id:"u2", name:"Sam's Allotment",         width:10, height:8,  unit:"m", type:"allotment", notes:"Rented allotment plot — mostly vegetables." },
    ],
    // Field rectangles placed inside each garden.
    fields: [
        // Garden 1
        { id:"f1",  garden_id:"g1", user_id:"u1", name:"Tomato Bed",       type:"raised_bed",    x:0.5,  y:0.5,  width:3.5, height:2.5, notes:"South-facing, great drainage" },
        { id:"f2",  garden_id:"g1", user_id:"u1", name:"Herb Corner",      type:"herb_bed",      x:4.5,  y:0.5,  width:2.5, height:2.5, notes:"Perennial and annual herbs" },
        { id:"f3",  garden_id:"g1", user_id:"u1", name:"Leafy Greens",     type:"open_field",    x:0.5,  y:3.5,  width:6,   height:2.5, notes:"Lettuce, kale, spinach, chard" },
        { id:"f4",  garden_id:"g1", user_id:"u1", name:"Root Veg Bed",     type:"raised_bed",    x:7.5,  y:0.5,  width:3,   height:3.5, notes:"Carrots, beets, parsnips" },
        { id:"f5",  garden_id:"g1", user_id:"u1", name:"Legume Row",       type:"open_field",    x:0.5,  y:6.5,  width:6,   height:2.5, notes:"Beans and peas rotation" },
        { id:"f6",  garden_id:"g1", user_id:"u1", name:"GH Propagation",   type:"greenhouse_bed",x:8.5,  y:5.5,  width:4,   height:3.5, notes:"Inside the main greenhouse" },
        // Garden 2
        { id:"f7",  garden_id:"g2", user_id:"u1", name:"Mediterranean Herbs", type:"herb_bed",   x:0.5,  y:0.5,  width:3,   height:2,   notes:"Thyme, rosemary, oregano, sage" },
        { id:"f8",  garden_id:"g2", user_id:"u1", name:"Annual Herbs",     type:"herb_bed",      x:4,    y:0.5,  width:3.5, height:2,   notes:"Basil, cilantro, dill, parsley" },
        { id:"f9",  garden_id:"g2", user_id:"u1", name:"Companion Flowers",type:"flower_bed",    x:0.5,  y:3,    width:7,   height:2.5, notes:"Marigolds, nasturtiums, calendula" },
        // Garden 3
        { id:"f10", garden_id:"g3", user_id:"u2", name:"Brassica Bed",     type:"raised_bed",    x:0.5,  y:0.5,  width:4,   height:3,   notes:"Cabbages, broccoli, kale" },
        { id:"f11", garden_id:"g3", user_id:"u2", name:"Allotment Rows",   type:"open_field",    x:0.5,  y:4,    width:9,   height:3.5, notes:"Traditional rows — mixed veg" },
        { id:"f12", garden_id:"g3", user_id:"u2", name:"Soft Fruit Corner",type:"fruit_area",    x:5,    y:0.5,  width:4.5, height:3,   notes:"Raspberries, strawberries, currants" },
    ],
    // Non-field structures like greenhouses, paths and water points.
    structures: [
        // Garden 1
        { id:"s1", garden_id:"g1", user_id:"u1", type:"greenhouse",         name:"Main Greenhouse",   x:7.5, y:4.5, width:5.5, height:5, notes:"Full glass greenhouse — year-round growing", ventilated:false, temperature:"", humidity:"" },
        { id:"s2", garden_id:"g1", user_id:"u1", type:"tunnel_greenhouse",  name:"Poly Tunnel",       x:0.5, y:9,   width:6,   height:0.8,notes:"Early season extension tunnel", ventilated:false, temperature:"", humidity:"" },
        { id:"s3", garden_id:"g1", user_id:"u1", type:"compost_zone",       name:"Compost Corner",    x:0.5, y:6.5, width:0,   height:0, notes:"3-bin composting system" },
        { id:"s4", garden_id:"g1", user_id:"u1", type:"water_point",        name:"Main Water Tap",    x:13.2,y:0.8, width:0.6, height:0.6,notes:"Municipal supply" },
        { id:"s5", garden_id:"g1", user_id:"u1", type:"path",               name:"Central Path",      x:6.8, y:3.5, width:0.6, height:6, notes:"Main walkway" },
        // Garden 2
        { id:"s6", garden_id:"g2", user_id:"u1", type:"tunnel_greenhouse",  name:"Herb Tunnel",       x:0.5, y:5.3, width:7,   height:0.6,notes:"Extends the herb season into winter", ventilated:true,  temperature:"14°C", humidity:"" },
        { id:"s7", garden_id:"g2", user_id:"u1", type:"water_point",        name:"Rainwater Butt",    x:7,   y:4.5, width:0.8, height:0.8,notes:"1000L rainwater collector" },
        // Garden 3
        { id:"s8", garden_id:"g3", user_id:"u2", type:"greenhouse",         name:"Sam's Mini GH",     x:5,   y:4.2, width:4.5, height:3.5,notes:"Unheated — tomatoes in summer", ventilated:true,  temperature:"", humidity:"65" },
        { id:"s9", garden_id:"g3", user_id:"u2", type:"shed",               name:"Tool Shed",         x:0.5, y:4.5, width:2,   height:2,  notes:"Tools and supplies storage" },
        { id:"s10", garden_id:"g1", user_id:"u1", type:"rain_barrel",       name:"Rain Barrel",       x:13.0,y:1.7, width:0.8, height:1.0,notes:"Collects roof runoff" },
        { id:"s11", garden_id:"g1", user_id:"u1", type:"potting_bench",    name:"Potting Bench",     x:11.0,y:9.0, width:2.4, height:0.8,notes:"Seed sowing and transplanting" },
        { id:"s12", garden_id:"g2", user_id:"u1", type:"cold_frame",        name:"Cold Frame",        x:0.5, y:5.8, width:1.8, height:1.0,notes:"Hardening off seedlings" },
        { id:"s13", garden_id:"g2", user_id:"u1", type:"insect_hotel",      name:"Insect Hotel",      x:7.3, y:2.8, width:0.8, height:0.8,notes:"Pollinator habitat" },
        { id:"s14", garden_id:"g2", user_id:"u1", type:"tool_rack",         name:"Tool Rack",         x:6.7, y:5.7, width:1.0, height:0.5,notes:"Hand tools and labels" },
        { id:"s15", garden_id:"g3", user_id:"u2", type:"chicken_coop",      name:"Chicken Coop",      x:7.0, y:0.7, width:1.9, height:1.6,notes:"Shelter for laying hens" },
        { id:"s16", garden_id:"g3", user_id:"u2", type:"chicken_run",       name:"Chicken Run",       x:6.6, y:2.4, width:3.0, height:2.2,notes:"Outdoor run attached to coop" },
        { id:"s17", garden_id:"g3", user_id:"u2", type:"raised_tunnel",     name:"Raised Tunnel",     x:0.6, y:0.5, width:3.8, height:0.7,notes:"Early crops and salad greens" },
        { id:"s18", garden_id:"g2", user_id:"u1", type:"hedge",             name:"Beech Hedge",       x:0.2, y:0.2, width:7.2, height:0.5,notes:"Boundary hedge; prune twice per year", species:"Beech", info:"Evergreen-style boundary screen with dense growth", maintenance_notes:"Clip after first flush and again in late summer", prune_interval_weeks:20, next_prune_date:"2026-04-15" },
        { id:"s19", garden_id:"g1", user_id:"u1", type:"trellis",           name:"Bean Trellis",      x:3.8, y:6.4, width:1.4, height:0.4,notes:"Climbing support for beans and peas", info:"Low timber trellis for vertical cropping", maintenance_notes:"Check ties, straighten stakes and replace damaged canes", prune_interval_weeks:12, next_prune_date:"2026-04-08" },
        { id:"s20", garden_id:"g3", user_id:"u2", type:"windbreak",         name:"North Windbreak",   x:0.2, y:7.4, width:9.2, height:0.5,notes:"Shelters the plot from prevailing wind", species:"Mixed native shrubs", info:"Dense wind shelter on the north edge", maintenance_notes:"Light trim once per year and inspect for gaps", prune_interval_weeks:52, next_prune_date:"2026-10-01" },
        { id:"s21", garden_id:"g3", user_id:"u2", type:"orchard_row",       name:"Apple Row",         x:0.6, y:7.2, width:4.0, height:0.8,notes:"Dwarf apples on a single line", species:"Apple", info:"Compact fruit row with training wire", maintenance_notes:"Winter prune and summer tie-in", prune_interval_weeks:26, next_prune_date:"2026-02-15" },
    ],
    // Crop and plant entries linked to a field and tracked by growth state.
    plants: [
        // Garden 1 — Tomato Bed
        { id:"pl1",  garden_id:"g1", user_id:"u1", field_id:"f1", name:"Tomato",        variety:"San Marzano",    category:"Vegetable",  status:"growing",     quantity:8,  sow_date:"2026-03-01", plant_date:"2026-04-20", harvest_date:"2026-07-15", notes:"Needs regular tying in" },
        { id:"pl2",  garden_id:"g1", user_id:"u1", field_id:"f1", name:"Tomato",        variety:"Gardener's Delight",category:"Vegetable",status:"growing",     quantity:4,  sow_date:"2026-03-01", plant_date:"2026-04-20", harvest_date:"2026-07-01", notes:"Cherry — very prolific" },
        { id:"pl3",  garden_id:"g1", user_id:"u1", field_id:"f1", name:"Basil",         variety:"Genovese",       category:"Herb",       status:"planted",     quantity:6,  sow_date:"2026-03-15", plant_date:"2026-04-20", harvest_date:"2026-06-01", notes:"Companion to tomatoes" },
        // Garden 1 — Herb Corner
        { id:"pl4",  garden_id:"g1", user_id:"u1", field_id:"f2", name:"Rosemary",      variety:"Tuscan Blue",    category:"Herb",       status:"growing",     quantity:2,  sow_date:"2026-01-15", plant_date:"2026-03-10", harvest_date:"",           notes:"Perennial — prune after flowering" },
        { id:"pl5",  garden_id:"g1", user_id:"u1", field_id:"f2", name:"Thyme",         variety:"Common",         category:"Herb",       status:"growing",     quantity:3,  sow_date:"2026-02-01", plant_date:"2026-03-15", harvest_date:"",           notes:"Drought-tolerant perennial" },
        { id:"pl6",  garden_id:"g1", user_id:"u1", field_id:"f2", name:"Chives",        variety:"Common",         category:"Herb",       status:"growing",     quantity:4,  sow_date:"2026-02-15", plant_date:"2026-03-20", harvest_date:"",           notes:"Cut and come again" },
        { id:"pl7",  garden_id:"g1", user_id:"u1", field_id:"f2", name:"Mint",          variety:"Spearmint",      category:"Herb",       status:"growing",     quantity:2,  sow_date:"2026-02-10", plant_date:"2026-03-15", harvest_date:"",           notes:"Contained in pots to stop spreading" },
        // Garden 1 — Leafy Greens
        { id:"pl8",  garden_id:"g1", user_id:"u1", field_id:"f3", name:"Lettuce",       variety:"Butterhead",     category:"Leafy Green",status:"harvestable", quantity:20, sow_date:"2026-03-01", plant_date:"2026-03-20", harvest_date:"2026-05-15", notes:"Ready for outer leaf harvest" },
        { id:"pl9",  garden_id:"g1", user_id:"u1", field_id:"f3", name:"Lettuce",       variety:"Lollo Rosso",    category:"Leafy Green",status:"growing",     quantity:15, sow_date:"2026-03-10", plant_date:"2026-03-28", harvest_date:"2026-05-20", notes:"" },
        { id:"pl10", garden_id:"g1", user_id:"u1", field_id:"f3", name:"Spinach",       variety:"Baby Leaf",      category:"Leafy Green",status:"sown",        quantity:30, sow_date:"2026-03-20", plant_date:"",           harvest_date:"2026-05-10", notes:"" },
        { id:"pl11", garden_id:"g1", user_id:"u1", field_id:"f3", name:"Kale",          variety:"Cavolo Nero",    category:"Leafy Green",status:"growing",     quantity:10, sow_date:"2026-02-20", plant_date:"2026-04-01", harvest_date:"2026-06-01", notes:"" },
        { id:"pl12", garden_id:"g1", user_id:"u1", field_id:"f3", name:"Chard",         variety:"Rainbow",        category:"Leafy Green",status:"growing",     quantity:12, sow_date:"2026-03-05", plant_date:"2026-04-10", harvest_date:"2026-05-25", notes:"Pick outer leaves" },
        // Garden 1 — Root Veg
        { id:"pl13", garden_id:"g1", user_id:"u1", field_id:"f4", name:"Carrot",        variety:"Nantes",         category:"Root",       status:"growing",     quantity:60, sow_date:"2026-03-10", plant_date:"2026-03-10", harvest_date:"2026-06-20", notes:"Direct sown, thin to 5cm" },
        { id:"pl14", garden_id:"g1", user_id:"u1", field_id:"f4", name:"Beetroot",      variety:"Boltardy",       category:"Root",       status:"sown",        quantity:25, sow_date:"2026-03-22", plant_date:"",           harvest_date:"2026-06-15", notes:"" },
        { id:"pl15", garden_id:"g1", user_id:"u1", field_id:"f4", name:"Parsnip",       variety:"Gladiator",      category:"Root",       status:"sown",        quantity:20, sow_date:"2026-03-15", plant_date:"",           harvest_date:"2026-10-01", notes:"Slow germinator — be patient" },
        { id:"pl16", garden_id:"g1", user_id:"u1", field_id:"f4", name:"Radish",        variety:"French Breakfast",category:"Root",      status:"harvestable", quantity:30, sow_date:"2026-03-01", plant_date:"",           harvest_date:"2026-03-25", notes:"Fast crop — harvest before bolting" },
        // Garden 1 — Legume Row
        { id:"pl17", garden_id:"g1", user_id:"u1", field_id:"f5", name:"French Bean",   variety:"Cobra",          category:"Legume",     status:"planned",     quantity:30, sow_date:"2026-04-20", plant_date:"2026-05-05", harvest_date:"2026-07-15", notes:"Climbing variety — needs canes" },
        { id:"pl18", garden_id:"g1", user_id:"u1", field_id:"f5", name:"Pea",           variety:"Sugar Snap",     category:"Legume",     status:"sown",        quantity:40, sow_date:"2026-03-18", plant_date:"",           harvest_date:"2026-06-01", notes:"Direct sown in guttering" },
        { id:"pl19", garden_id:"g1", user_id:"u1", field_id:"f5", name:"Broad Bean",    variety:"Aquadulce Claudia",category:"Legume",   status:"growing",     quantity:25, sow_date:"2026-11-01", plant_date:"2026-11-01", harvest_date:"2026-06-10", notes:"Autumn sown — well established" },
        // Garden 1 — Greenhouse Bed
        { id:"pl20", garden_id:"g1", user_id:"u1", field_id:"f6", name:"Pepper",        variety:"Sweet Bell",     category:"Vegetable",  status:"growing",     quantity:6,  sow_date:"2026-02-10", plant_date:"2026-04-01", harvest_date:"2026-08-01", notes:"In greenhouse — needs high heat" },
        { id:"pl21", garden_id:"g1", user_id:"u1", field_id:"f6", name:"Aubergine",     variety:"Black Beauty",   category:"Vegetable",  status:"planted",     quantity:3,  sow_date:"2026-02-15", plant_date:"2026-04-10", harvest_date:"2026-08-15", notes:"Keep warm — minimum 18°C" },
        { id:"pl22", garden_id:"g1", user_id:"u1", field_id:"f6", name:"Cucumber",      variety:"Mini Munch",     category:"Vegetable",  status:"growing",     quantity:4,  sow_date:"2026-03-10", plant_date:"2026-04-15", harvest_date:"2026-07-01", notes:"Train up vertical wire" },
        { id:"pl23", garden_id:"g1", user_id:"u1", field_id:"f6", name:"Melon",         variety:"Sweetheart",     category:"Fruit",      status:"sown",        quantity:2,  sow_date:"2026-03-20", plant_date:"",           harvest_date:"2026-08-20", notes:"Needs greenhouse warmth" },
        // Garden 1 — greenhouse sowings from 3 March 2026
        { id:"pl46", garden_id:"g1", user_id:"u1", field_id:"f6", name:"Tomato",        variety:"OG-tomaat",      category:"Vegetable",  status:"sown",        quantity:4,  sow_date:"2026-03-03", plant_date:"",           harvest_date:"2026-07-20", notes:"Gezaaid in serre in potjes" },
        { id:"pl47", garden_id:"g1", user_id:"u1", field_id:"f6", name:"Basil",         variety:"Basilicum",      category:"Herb",       status:"sown",        quantity:6,  sow_date:"2026-03-03", plant_date:"",           harvest_date:"2026-06-15", notes:"Volle potjes in serre" },
        { id:"pl48", garden_id:"g1", user_id:"u1", field_id:"f6", name:"Parsley",       variety:"Krul peterselie",category:"Herb",       status:"sown",        quantity:3,  sow_date:"2026-03-03", plant_date:"",           harvest_date:"2026-05-25", notes:"Volle potjes in serre" },
        { id:"pl49", garden_id:"g1", user_id:"u1", field_id:"f6", name:"Onion",         variety:"Lente ui",       category:"Vegetable",  status:"sown",        quantity:6,  sow_date:"2026-03-03", plant_date:"",           harvest_date:"2026-05-20", notes:"In serre, in compacte potjes" },
        { id:"pl50", garden_id:"g1", user_id:"u1", field_id:"f6", name:"Mint",          variety:"Munt",           category:"Herb",       status:"sown",        quantity:2,  sow_date:"2026-03-03", plant_date:"",           harvest_date:"",           notes:"Twee volle potjes in serre" },
        { id:"pl51", garden_id:"g1", user_id:"u1", field_id:"f6", name:"Pepper",        variety:"Cayennepeper",   category:"Vegetable",  status:"sown",        quantity:14, sow_date:"2026-03-03", plant_date:"",           harvest_date:"2026-08-20", notes:"Serrezaailingen in potjes" },
        // Garden 2 — Mediterranean Herbs
        { id:"pl24", garden_id:"g2", user_id:"u1", field_id:"f7", name:"Oregano",       variety:"Greek",          category:"Herb",       status:"growing",     quantity:3,  sow_date:"2026-02-01", plant_date:"2026-03-15", harvest_date:"",           notes:"Perennial" },
        { id:"pl25", garden_id:"g2", user_id:"u1", field_id:"f7", name:"Sage",          variety:"Common",         category:"Herb",       status:"growing",     quantity:2,  sow_date:"2026-01-20", plant_date:"2026-03-10", harvest_date:"",           notes:"Prune hard each spring" },
        { id:"pl26", garden_id:"g2", user_id:"u1", field_id:"f7", name:"Lavender",      variety:"Hidcote",        category:"Herb",       status:"growing",     quantity:4,  sow_date:"2026-02-05", plant_date:"2026-03-20", harvest_date:"",           notes:"Great for pollinators" },
        { id:"pl27", garden_id:"g2", user_id:"u1", field_id:"f7", name:"Rosemary",      variety:"Majorca Pink",   category:"Herb",       status:"growing",     quantity:1,  sow_date:"2026-01-10", plant_date:"2026-03-01", harvest_date:"",           notes:"Pink flowering variety" },
        // Garden 2 — Annual Herbs
        { id:"pl28", garden_id:"g2", user_id:"u1", field_id:"f8", name:"Basil",         variety:"Thai",           category:"Herb",       status:"sown",        quantity:8,  sow_date:"2026-03-25", plant_date:"",           harvest_date:"2026-06-01", notes:"Needs warmth to germinate" },
        { id:"pl29", garden_id:"g2", user_id:"u1", field_id:"f8", name:"Parsley",       variety:"Flat-leaf",      category:"Herb",       status:"growing",     quantity:6,  sow_date:"2026-02-20", plant_date:"2026-03-20", harvest_date:"2026-05-01", notes:"Slow to germinate — worth the wait" },
        { id:"pl30", garden_id:"g2", user_id:"u1", field_id:"f8", name:"Dill",          variety:"Bouquet",        category:"Herb",       status:"sown",        quantity:10, sow_date:"2026-03-20", plant_date:"",           harvest_date:"2026-05-20", notes:"Direct sown" },
        { id:"pl31", garden_id:"g2", user_id:"u1", field_id:"f8", name:"Cilantro",      variety:"Leisure",        category:"Herb",       status:"planned",     quantity:8,  sow_date:"2026-04-01", plant_date:"",           harvest_date:"2026-05-25", notes:"Sow successionally to avoid bolt" },
        // Garden 2 — Flowers
        { id:"pl32", garden_id:"g2", user_id:"u1", field_id:"f9", name:"Marigold",      variety:"French Dwarf",   category:"Flower",     status:"sown",        quantity:30, sow_date:"2026-03-15", plant_date:"",           harvest_date:"",           notes:"Pest repellent" },
        { id:"pl33", garden_id:"g2", user_id:"u1", field_id:"f9", name:"Nasturtium",    variety:"Jewel Mix",      category:"Flower",     status:"sown",        quantity:20, sow_date:"2026-03-20", plant_date:"",           harvest_date:"",           notes:"Edible flowers and aphid trap" },
        { id:"pl34", garden_id:"g2", user_id:"u1", field_id:"f9", name:"Calendula",     variety:"Orange King",    category:"Flower",     status:"growing",     quantity:15, sow_date:"2026-03-01", plant_date:"2026-03-25", harvest_date:"",           notes:"Edible petals — great for skin" },
        { id:"pl35", garden_id:"g2", user_id:"u1", field_id:"f9", name:"Borage",        variety:"Common",         category:"Flower",     status:"planned",     quantity:10, sow_date:"2026-04-05", plant_date:"",           harvest_date:"",           notes:"Pollinator magnet" },
        // Garden 3 — Sam's plots
        { id:"pl36", garden_id:"g3", user_id:"u2", field_id:"f10", name:"Broccoli",     variety:"Calabrese",      category:"Vegetable",  status:"growing",     quantity:8,  sow_date:"2026-03-01", plant_date:"2026-04-15", harvest_date:"2026-06-20", notes:"Net against cabbage white" },
        { id:"pl37", garden_id:"g3", user_id:"u2", field_id:"f10", name:"Cabbage",      variety:"January King",   category:"Vegetable",  status:"planted",     quantity:6,  sow_date:"2026-03-10", plant_date:"2026-04-20", harvest_date:"2026-10-01", notes:"Winter cabbage" },
        { id:"pl38", garden_id:"g3", user_id:"u2", field_id:"f10", name:"Kale",         variety:"Red Russian",    category:"Leafy Green",status:"growing",     quantity:10, sow_date:"2026-02-28", plant_date:"2026-04-10", harvest_date:"2026-06-10", notes:"Cut and come again" },
        { id:"pl39", garden_id:"g3", user_id:"u2", field_id:"f11", name:"Potato",       variety:"Charlotte",      category:"Root",       status:"planted",     quantity:40, sow_date:"2026-03-01", plant_date:"2026-03-28", harvest_date:"2026-07-01", notes:"Salad potato — chit in Feb" },
        { id:"pl40", garden_id:"g3", user_id:"u2", field_id:"f11", name:"Sweetcorn",    variety:"Earlibird",      category:"Vegetable",  status:"sown",        quantity:20, sow_date:"2026-04-01", plant_date:"",           harvest_date:"2026-08-15", notes:"Sow in blocks for pollination" },
        { id:"pl41", garden_id:"g3", user_id:"u2", field_id:"f11", name:"Leek",         variety:"Musselburgh",    category:"Vegetable",  status:"sown",        quantity:30, sow_date:"2026-03-15", plant_date:"",           harvest_date:"2026-11-01", notes:"" },
        { id:"pl42", garden_id:"g3", user_id:"u2", field_id:"f11", name:"Onion",        variety:"Sturon",         category:"Vegetable",  status:"planted",     quantity:50, sow_date:"2026-03-10", plant_date:"2026-03-25", harvest_date:"2026-08-01", notes:"From sets" },
        { id:"pl43", garden_id:"g3", user_id:"u2", field_id:"f12", name:"Raspberry",    variety:"Autumn Bliss",   category:"Fruit",      status:"growing",     quantity:8,  sow_date:"",           plant_date:"2026-03-01", harvest_date:"2026-09-01", notes:"Autumn fruiting — cut all canes in Feb" },
        { id:"pl44", garden_id:"g3", user_id:"u2", field_id:"f12", name:"Strawberry",   variety:"Cambridge Favourite",category:"Fruit", status:"growing",     quantity:20, sow_date:"",           plant_date:"2026-03-15", harvest_date:"2026-06-15", notes:"Mulch with straw before fruiting" },
        { id:"pl45", garden_id:"g3", user_id:"u2", field_id:"f12", name:"Currant",      variety:"Ben Sarek (Black)",category:"Fruit",   status:"growing",     quantity:3,  sow_date:"",           plant_date:"2026-02-20", harvest_date:"2026-07-15", notes:"Net before fruiting" },
    ],
    // Action list linked to gardens, fields, structures or plants.
    tasks: [
        { id:"tk1",  user_id:"u1", title:"Water tomato bed",             type:"watering",    status:"pending",  due_date:"2026-03-23", linked_type:"field",  linked_id:"f1", notes:"" },
        { id:"tk2",  user_id:"u1", title:"Harvest outer lettuce leaves", type:"harvesting",  status:"pending",  due_date:"2026-03-22", linked_type:"field",  linked_id:"f3", notes:"Pick outer leaves only" },
        { id:"tk3",  user_id:"u1", title:"Sow French beans",             type:"sowing",      status:"pending",  due_date:"2026-04-20", linked_type:"field",  linked_id:"f5", notes:"2 rows, 40 cm apart" },
        { id:"tk4",  user_id:"u1", title:"Add compost to raised beds",   type:"fertilizing", status:"done",     due_date:"2026-03-15", linked_type:"garden", linked_id:"g1", notes:"Used homemade compost" },
        { id:"tk5",  user_id:"u1", title:"Ventilate main greenhouse",    type:"general",     status:"pending",  due_date:"2026-03-22", linked_type:"struct", linked_id:"s1", notes:"Open roof vents on warm afternoons" },
        { id:"tk6",  user_id:"u1", title:"Prune herb corner",            type:"pruning",     status:"pending",  due_date:"2026-04-05", linked_type:"field",  linked_id:"f2", notes:"Cut back woody rosemary growth" },
        { id:"tk7",  user_id:"u1", title:"Thin carrot seedlings",        type:"general",     status:"pending",  due_date:"2026-04-10", linked_type:"field",  linked_id:"f4", notes:"Thin to 5 cm spacing" },
        { id:"tk8",  user_id:"u1", title:"Pot on pepper seedlings",      type:"planting",    status:"pending",  due_date:"2026-04-05", linked_type:"field",  linked_id:"f6", notes:"Up to 3L pots" },
        { id:"tk9",  user_id:"u1", title:"Deadhead calendula",           type:"pruning",     status:"pending",  due_date:"2026-04-15", linked_type:"field",  linked_id:"f9", notes:"Regular deadheading extends flowering" },
        { id:"tk10", user_id:"u2", title:"Earth up potatoes",            type:"general",     status:"pending",  due_date:"2026-04-20", linked_type:"field",  linked_id:"f11",notes:"Draw up soil around stems" },
        { id:"tk11", user_id:"u2", title:"Net brassica bed",             type:"general",     status:"pending",  due_date:"2026-04-10", linked_type:"field",  linked_id:"f10",notes:"Protect against cabbage white butterfly" },
        { id:"tk12", user_id:"u2", title:"Harvest radishes",             type:"harvesting",  status:"pending",  due_date:"2026-03-25", linked_type:"garden", linked_id:"g3", notes:"Check size — harvest before bolt" },
    ],
    // UI-specific empty collections that get filled when the editor creates slots/zones.
    slots: [],
    zones: [],
    activeGardenId: "g1",
};

// ----
// PERSISTENCE
// ----
const SK = "gardengrid_v4";
const SESSION_KEY = "gardengrid_session";
const normalizeState = (state) => state ? { ...state, slots: state.slots || [], zones: state.zones || [] } : null;
const apiJson = async (url, options = {}) => {
    const res = await fetch(url, {
        credentials: "same-origin",
        headers: { "Content-Type": "application/json", ...(options.headers || {}) },
        ...options,
    });
    if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`);
    }
    return res.json();
};
const getLegacyState = () => {
    try {
        const raw = localStorage.getItem(SK);
        return raw ? normalizeState(JSON.parse(raw)) : null;
    } catch {
        return null;
    }
};
const clearLegacyStorage = () => {
    try {
        localStorage.removeItem(SK);
        localStorage.removeItem(SESSION_KEY);
    } catch {}
};
const loadState = async () => {
    try {
        const payload = await apiJson("/api/state.php");
        if (payload?.state) {
            clearLegacyStorage();
            return normalizeState(payload.state);
        }
    } catch {}
    const legacy = getLegacyState();
    if (legacy) {
        await saveState(legacy);
        clearLegacyStorage();
        return legacy;
    }
    return null;
};
const saveState = async (state) => {
    await apiJson("/api/state.php", {
        method: "POST",
        body: JSON.stringify({ state }),
    });
};
const resetState = async () => {
    await apiJson("/api/state.php", { method: "DELETE" });
    clearLegacyStorage();
};
const getSession = async () => {
    try {
        const payload = await apiJson("/api/session.php");
        if (payload?.uid) {
            try { localStorage.removeItem(SESSION_KEY); } catch {}
            return payload.uid;
        }
    } catch {}
    try {
        const legacyUid = localStorage.getItem(SESSION_KEY) || null;
        if (legacyUid) {
            await setSession(legacyUid);
            localStorage.removeItem(SESSION_KEY);
            return legacyUid;
        }
    } catch {}
    return null;
};
const setSession = async (uid) => {
    if (uid) {
        await apiJson("/api/session.php", {
            method: "POST",
            body: JSON.stringify({ uid }),
        });
    } else {
        await apiJson("/api/session.php", { method: "DELETE" });
    }
};

// ----
// HELPERS
// ----
const fmtDate = (d, lang="en") => {
    if (!d) return "—";
    try { return new Date(d+"T00:00:00").toLocaleDateString(LOCALE_MAP[lang]||"en-GB",{day:"numeric",month:"short",year:"numeric"}); }
    catch { return d; }
};
const isSameDay = (d, ref = new Date()) => {
    if (!d) return false;
    const value = new Date(d+"T00:00:00");
    return value.getFullYear() === ref.getFullYear() && value.getMonth() === ref.getMonth() && value.getDate() === ref.getDate();
};
const isOverdue = (d, status) => { if (!d||status==="done") return false; return new Date(d+"T00:00:00") < new Date(new Date().toDateString()); };
const clamp = (v, mn, mx) => Math.max(mn, Math.min(mx, v));
const forUser = (arr, uid) => arr.filter(x => !x.user_id || x.user_id === uid);
const isInsideGH = (field, gh) => {
    const cx = field.x + field.width/2, cy = field.y + field.height/2;
    return cx >= gh.x && cx <= gh.x+gh.width && cy >= gh.y && cy <= gh.y+gh.height;
};
const SLOT_TYPE_LABELS = {
    bed_row: "Row",
    bed_section: "?",
    greenhouse_pot: "Pot",
    greenhouse_tray: "Tray",
    greenhouse_table: "Table",
    tray_cell: "??",
    tunnel_row: "??",
};
const SLOT_TYPE_ICONS = {
    bed_row: "??",
    bed_section: "?",
    greenhouse_pot: "??",
    greenhouse_tray: "??",
    greenhouse_table: "??",
    tray_cell: "??",
    tunnel_row: "??",
};
const WEATHER_CODE_LABELS = {
    0: "Clear",
    1: "Mostly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    51: "Light drizzle",
    61: "Rain",
    71: "Snow",
    80: "Rain showers",
    95: "Thunderstorm",
    96: "Thunderstorm with hail",
    99: "Severe thunderstorm",
};
const getHarvestTaskForPlant = (plant, uid) => {
    if (!plant?.harvest_date || plant.status==="harvested" || plant.status==="removed") return null;
    return {
        id: `harvest_${plant.id}`,
        user_id: uid,
        title: `Harvest ${plant.name}${plant.variety ? ` (${plant.variety})` : ""}`,
        type: "harvesting",
        status: "pending",
        due_date: plant.harvest_date,
        linked_type: "plant",
        linked_id: plant.id,
        notes: plant.notes || "",
    };
};
const syncHarvestTask = (tasks, plant, uid) => {
    const nextTask = getHarvestTaskForPlant(plant, uid);
    const existing = tasks.find(t => t.id===`harvest_${plant.id}`);
    if (!nextTask) {
        return existing ? tasks.filter(t => t.id!==existing.id) : tasks;
    }
    if (existing) {
        return tasks.map(t => t.id===existing.id ? { ...existing, ...nextTask, status: plant.status==="harvested" ? "done" : existing.status==="done" ? "done" : "pending" } : t);
    }
    return [...tasks, nextTask];
};
const removeHarvestTask = (tasks, plantId) => tasks.filter(t => t.id!==`harvest_${plantId}`);
const getStructureMaintenanceTask = (struct, uid) => {
    if (!struct) return null;
    const maintenanceMap = {
        hedge: { type:"pruning", label:"Prune hedge", dueKey:"next_prune_date" },
        trellis: { type:"repair", label:"Inspect trellis", dueKey:"next_prune_date" },
        windbreak: { type:"pruning", label:"Trim windbreak", dueKey:"next_prune_date" },
        orchard_row: { type:"pruning", label:"Prune orchard row", dueKey:"next_prune_date" },
    };
    const cfg = maintenanceMap[struct.type];
    if (!cfg) return null;
    return {
        id: `maint_${struct.id}`,
        user_id: uid,
        title: `${cfg.label}: ${struct.name}`,
        type: cfg.type,
        status: "pending",
        due_date: struct[cfg.dueKey] || struct.next_prune_date || "",
        linked_type: "struct",
        linked_id: struct.id,
        notes: struct.maintenance_notes || struct.info || struct.notes || "",
    };
};
const syncStructureTasks = (tasks, struct, uid) => {
    if (!struct) return tasks;
    const nextTask = getStructureMaintenanceTask(struct, uid);
    const existing = tasks.find(t => t.id === `maint_${struct.id}`);
    if (!nextTask) {
        return existing ? tasks.filter(t => t.id !== existing.id) : tasks;
    }
    if (existing) {
        return tasks.map(t => t.id === existing.id ? { ...existing, ...nextTask } : t);
    }
    return [...tasks, nextTask];
};
const removeStructureTasks = (tasks, structId) => tasks.filter(t => t.id !== `maint_${structId}`);
const slotTypeLabel = (slot, t = null) => {
    const key = SLOT_TYPE_LABELS[slot?.type] || slot?.type || "Slot";
    return t && typeof t === "function" ? t(key) || key : key;
};
const slotBaseLabel = (slot) => slot?.label || slot?.name || slot?.type || "Slot";
const SLOT_SEED_COLORS = ["#7AAE39", "#8BC34A", "#9CCC65", "#AED581", "#66BB6A", "#5FA043"];
const slotSeedPlan = (slot) => {
    if (!slot || !["tunnel_row", "bed_row"].includes(slot.type)) return null;
    const orientation = slot.orientation === "vertical" ? "vertical" : "horizontal";
    const rows = Math.max(1, Math.floor(Number(slot.row_count) || 1));
    const plants = Math.max(0, Math.floor(Number(slot.plant_count) || 0));
    const spacingCm = Math.max(0, Number(slot.spacing_cm) || 0);
    const rowLengthM = Number(slot.row_length_m) > 0
        ? Number(slot.row_length_m)
        : (plants > 1 && spacingCm ? ((Math.ceil(plants / rows) - 1) * spacingCm) / 100 : 0);
    const maxDots = 240;
    const visiblePlants = Math.min(plants, maxDots);
    const perRow = plants > 0 ? Math.max(1, Math.ceil(plants / rows)) : 0;
    const visiblePerRow = visiblePlants > 0 ? Math.max(1, Math.ceil(visiblePlants / rows)) : 0;
    const rowsData = [];
    let remainingVisible = visiblePlants;
    for (let r = 0; r < rows; r++) {
        const plannedCount = plants > 0 ? Math.min(perRow, Math.max(0, plants - (r * perRow))) : 0;
        const drawCount = Math.min(visiblePerRow, remainingVisible);
        const seeds = [];
        for (let c = 0; c < drawCount; c++) {
            seeds.push({
                id: `${slot.id}-seed-${r}-${c}`,
                color: SLOT_SEED_COLORS[(r + c) % SLOT_SEED_COLORS.length],
            });
        }
        remainingVisible -= drawCount;
        rowsData.push({
            index: r,
            label: `R${r + 1}`,
            plannedCount,
            drawCount,
            hiddenCount: Math.max(0, plannedCount - drawCount),
            seeds,
        });
    }
    return { rows, plants, perRow, spacingCm, rowLengthM, visiblePlants, hiddenPlants: Math.max(0, plants - visiblePlants), rowsData, orientation };
};
const renderSlotSeedPlan = (slot, { compact = false } = {}) => {
    const plan = slotSeedPlan(slot);
    if (!plan || plan.plants <= 0) return null;
    const dotSize = compact ? 8 : 10;
    const dotGap = compact ? 3 : 4;
    const isVertical = plan.orientation === "vertical";
    return (
        <div style={{ marginTop:8, display:"flex", flexDirection:isVertical ? "row" : "column", gap:6, flexWrap:isVertical ? "wrap" : "nowrap" }}>
            {plan.rowsData.map(row => (
                <div
                    key={row.label}
                    style={{
                        display:"flex",
                        flexDirection:isVertical ? "column" : "row",
                        alignItems:isVertical ? "stretch" : "center",
                        gap:8,
                        minWidth:isVertical ? 54 : 0,
                        flex:isVertical ? "1 1 54px" : "unset",
                    }}
                >
                    <Badge color={T.primary} bg={T.primaryBg} style={{ flexShrink:0, alignSelf:isVertical ? "flex-start" : "auto" }}>{row.label}</Badge>
                    <div
                        style={{
                            display:"flex",
                            flexDirection:isVertical ? "column" : "row",
                            alignItems:"center",
                            gap:dotGap,
                            flexWrap:"nowrap",
                            overflowX:isVertical ? "hidden" : "auto",
                            overflowY:isVertical ? "auto" : "hidden",
                            minWidth:0,
                            minHeight:isVertical ? 0 : "unset",
                            flex:1,
                            paddingBottom:isVertical ? 0 : 2,
                            paddingRight:isVertical ? 2 : 0,
                        }}
                    >
                        {row.seeds.map(seed => (
                            <span
                                key={seed.id}
                                title={`${row.label} seed`}
                                style={{
                                    width:dotSize,
                                    height:dotSize,
                                    borderRadius:"50%",
                                    background:seed.color,
                                    flexShrink:0,
                                    boxShadow:"inset 0 0 0 1px rgba(255,255,255,0.55), 0 0 0 1px rgba(0,0,0,0.08)",
                                }}
                            />
                        ))}
                        {row.hiddenCount > 0 && <span style={{ fontSize:11, color:T.textMuted, whiteSpace:"nowrap" }}>+{row.hiddenCount}</span>}
                    </div>
                </div>
            ))}
            {plan.hiddenPlants > 0 && <div style={{ fontSize:11, color:T.textMuted }}>+{plan.hiddenPlants} more seedlings hidden for performance</div>}
        </div>
    );
};
const slotDisplayLabel = (slot, allSlots = []) => {
    if (!slot) return "";
    const parent = slot.parent_type === "slot" ? allSlots.find(s => s.id === slot.parent_id) : null;
    const base = `${SLOT_TYPE_ICONS[slot.type] || "?"} ${slotBaseLabel(slot)}`;
    const meta = [];
    if (slot.type === "tunnel_row" || slot.type === "bed_row") {
        if (slot.row_count) meta.push(`${slot.row_count} rows`);
        if (slot.spacing_cm) meta.push(`${slot.spacing_cm}cm`);
        if (slot.plant_count) meta.push(`${slot.plant_count} plants`);
        meta.push(slot.orientation === "vertical" ? "90°" : "0°");
    }
    if (slot.type === "greenhouse_tray" && slot.rows && slot.cols) meta.push(`${slot.rows} × ${slot.cols}`);
    const suffix = meta.length ? ` · ${meta.join(" · ")}` : "";
    return parent ? `${slotDisplayLabel(parent, allSlots)} › ${base}${suffix}` : `${base}${suffix}`;
};
const childSlotsFor = (allSlots, parentType, parentId) => {
    const direct = allSlots.filter(s => s.parent_type === parentType && s.parent_id === parentId);
    if (parentType === "struct") {
        const trayChildren = allSlots.filter(s => s.parent_type === "slot" && direct.some(d => d.id === s.parent_id));
        return [...direct, ...trayChildren];
    }
    return direct;
};
const findFieldAtPoint = (fields, x, y) => fields.find(f => x >= f.x && x <= f.x + f.width && y >= f.y && y <= f.y + f.height) || null;
const polygonPointsString = (points=[]) => points.map(p => `${p.x},${p.y}`).join(" ");
const polygonArea = (points=[]) => {
    if (!points || points.length < 3) return 0;
    let area = 0;
    for (let i = 0; i < points.length; i++) {
        const a = points[i];
        const b = points[(i + 1) % points.length];
        area += (a.x * b.y) - (b.x * a.y);
    }
    return Math.abs(area / 2);
};
const pointInPolygon = (x, y, points=[]) => {
    if (!points || points.length < 3) return false;
    let inside = false;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
        const xi = points[i].x, yi = points[i].y;
        const xj = points[j].x, yj = points[j].y;
        const intersect = ((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / ((yj - yi) || 1e-9) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
};
const polygonCentroid = (points=[]) => {
    if (!points || points.length === 0) return { x: 0, y: 0 };
    const sum = points.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
    return { x: sum.x / points.length, y: sum.y / points.length };
};
const syncAllUserProgress = (state) => {
    const now = new Date().toISOString();
    return {
        ...state,
        users: (state.users || []).map(user => {
            const progress = buildUserQuestProgress({
                user,
                gardens: forUser(state.gardens || [], user.id),
                fields: forUser(state.fields || [], user.id),
                structures: forUser(state.structures || [], user.id),
                plants: forUser(state.plants || [], user.id),
                tasks: forUser(state.tasks || [], user.id),
                lang: user?.settings?.lang || state.lang || "en",
            });
            return {
                ...user,
                progress: {
                    version: 1,
                    percent: progress.progress,
                    completed_keys: progress.steps.filter(step => step.done).map(step => step.key),
                    total_steps: progress.steps.length,
                    next_key: progress.nextStep?.key || null,
                    updated_at: now,
                },
            };
        }),
    };
};

// ----
// REDUCER
// ----
function reducer(state, { type, payload }) {
    const uid = state.activeUserId;
    const inj = (p) => ({ ...p, user_id: uid });
    let nextState = state;
    switch (type) {
        case "ADD_USER":          nextState = { ...state, users: [...state.users, payload] }; break;
        case "UPDATE_USER":       nextState = { ...state, users: state.users.map(u => u.id===payload.id ? payload : u) }; break;
        case "DELETE_USER":       nextState = { ...state, users: state.users.filter(u => u.id!==payload), activeUserId: state.activeUserId===payload ? (state.users.find(u=>u.id!==payload)?.id||null) : state.activeUserId }; break;
        case "SET_ACTIVE_USER": {
            const nextGardenId = state.gardens.find(g => g.user_id === payload)?.id || null;
            nextState = { ...state, activeUserId: payload, activeGardenId: nextGardenId };
            break;
        }
        case "ADD_GARDEN":        nextState = { ...state, gardens: [...state.gardens, inj(payload)], activeGardenId: payload.id }; break;
        case "UPDATE_GARDEN":     nextState = { ...state, gardens: state.gardens.map(g => g.id===payload.id ? payload : g) }; break;
        case "DELETE_GARDEN":     nextState = { ...state, gardens: state.gardens.filter(g => g.id!==payload), activeGardenId: state.activeGardenId===payload ? (state.gardens.find(g=>g.user_id===uid&&g.id!==payload)?.id||null) : state.activeGardenId }; break;
        case "SET_ACTIVE_GARDEN": nextState = { ...state, activeGardenId: payload }; break;
        case "ADD_FIELD":         nextState = { ...state, fields: [...state.fields, inj(payload)] }; break;
        case "UPDATE_FIELD":      nextState = { ...state, fields: state.fields.map(f => f.id===payload.id ? payload : f) }; break;
        case "DELETE_FIELD":      nextState = { ...state, fields: state.fields.filter(f => f.id!==payload) }; break;
        case "ADD_STRUCT": {
            const struct = inj(payload);
            nextState = { ...state, structures: [...state.structures, struct], tasks: syncStructureTasks(state.tasks, struct, uid) };
            break;
        }
        case "UPDATE_STRUCT": {
            const struct = payload;
            nextState = { ...state, structures: state.structures.map(s => s.id===payload.id ? payload : s), tasks: syncStructureTasks(state.tasks, struct, uid) };
            break;
        }
        case "DELETE_STRUCT": {
            const nextStructs = state.structures.filter(s => s.id!==payload);
            const removedTasks = removeStructureTasks(state.tasks, payload);
            nextState = { ...state, structures: nextStructs, tasks: removedTasks };
            break;
        }
        case "ADD_SLOT":          nextState = { ...state, slots: [...(state.slots||[]), inj(payload)] }; break;
        case "UPDATE_SLOT":       nextState = { ...state, slots: (state.slots||[]).map(s => s.id===payload.id ? payload : s) }; break;
        case "DELETE_SLOT":       nextState = { ...state, slots: (state.slots||[]).filter(s => s.id!==payload) }; break;
        case "ADD_ZONE":          nextState = { ...state, zones: [...(state.zones||[]), inj(payload)] }; break;
        case "UPDATE_ZONE":       nextState = { ...state, zones: (state.zones||[]).map(z => z.id===payload.id ? payload : z) }; break;
        case "DELETE_ZONE":       nextState = { ...state, zones: (state.zones||[]).filter(z => z.id!==payload) }; break;
        case "ADD_PLANT": {
            const plant = inj(payload);
            nextState = { ...state, plants: [...state.plants, plant], tasks: syncHarvestTask(state.tasks, plant, uid) };
            break;
        }
        case "UPDATE_PLANT": {
            const plant = payload;
            nextState = { ...state, plants: state.plants.map(p => p.id===payload.id ? payload : p), tasks: syncHarvestTask(state.tasks, plant, uid) };
            break;
        }
        case "DELETE_PLANT":      nextState = { ...state, plants: state.plants.filter(p => p.id!==payload), tasks: removeHarvestTask(state.tasks, payload) }; break;
        case "ADD_TASK":          nextState = { ...state, tasks: [...state.tasks, inj(payload)] }; break;
        case "UPDATE_TASK":       nextState = { ...state, tasks: state.tasks.map(t => t.id===payload.id ? payload : t) }; break;
        case "DELETE_TASK":       nextState = { ...state, tasks: state.tasks.filter(t => t.id!==payload) }; break;
        case "SYNC_HARVEST_TASKS": {
            const syncedPlants = state.plants.filter(p => !p.user_id || p.user_id===uid);
            const untouchedTasks = state.tasks.filter(t => !String(t.id).startsWith("harvest_"));
            const harvestTasks = syncedPlants.map(p => getHarvestTaskForPlant(p, uid)).filter(Boolean);
            nextState = { ...state, tasks: [...untouchedTasks, ...harvestTasks] };
            break;
        }
        case "SYNC_STRUCTURE_TASKS": {
            const syncedStructs = state.structures.filter(s => !s.user_id || s.user_id===uid);
            let nextTasks = state.tasks.filter(t => !String(t.id).startsWith("maint_"));
            syncedStructs.forEach(struct => {
                const task = getStructureMaintenanceTask(struct, uid);
                if (task) nextTasks.push(task);
            });
            nextState = { ...state, tasks: nextTasks };
            break;
        }
        case "HYDRATE_STATE":     nextState = normalizeState(payload) || state; break;
        case "SET_SETTING":       nextState = { ...state, users: state.users.map(u => u.id===uid ? {...u, settings:{...u.settings,...payload}} : u) }; break;
        case "SYNC_USER_PROGRESS": nextState = state; break;
        default: nextState = state;
    }
    return syncAllUserProgress(nextState);
}

const Sidebar = React.lazy(() => import("./src/layout/Sidebar.jsx"));
const Garden3DScene = React.lazy(() => import("./src/layout/Garden3DScene.jsx"));
// ----
// GARDEN EDITOR (SVG with drag/resize/edit)
// ----
function GardenEditor({ garden, fields, structures, zones, plants = [], slots = [], dispatch, lang, navigate }) {
    const [zoom, setZoom] = useState(1);
    const [fitZoom, setFitZoom] = useState(1);
    const [viewMode, setViewMode] = useState("2d");
    const pad = 44;
    const sc = SCALE * zoom * fitZoom;
    const gW = garden.width * sc, gH = garden.height * sc;
    const svgRef = useRef(null);
    const canvasWrapRef = useRef(null);
    const [selId, setSelId] = useState(null);
    const [selKind, setSelKind] = useState(null);
    const dragRef = useRef(null);
    const resizeRef = useRef(null);
    const [livePos, setLivePos] = useState(null);
    const [editForm, setEditForm] = useState(null);
    const [zoneDraft, setZoneDraft] = useState(null);
    const [pickMenu, setPickMenu] = useState(null);
    const [panelFilter, setPanelFilter] = useState("all");
    const selItem = selId ? (
        selKind === "field" ? fields.find(f => f.id === selId)
        : selKind === "struct" ? structures.find(s => s.id === selId)
        : selKind === "zone" ? zones.find(z => z.id === selId)
        : slots.find(s => s.id === selId)
    ) : null;
    const renameSlot = useCallback((slot) => {
        const nextName = window.prompt("Rename row", slot.name || slot.label || "");
        if (!nextName || !nextName.trim()) return;
        dispatch({
            type:"UPDATE_SLOT",
            payload:{
                ...slot,
                name: nextName.trim(),
                label: (slot.label || nextName).trim(),
            }
        });
    }, [dispatch]);
    useEffect(() => {
        const updateFitZoom = () => {
            const wrap = canvasWrapRef.current;
            if (!wrap) return;
            const availableWidth = Math.max(320, wrap.clientWidth - 24);
            const naturalWidth = Math.max(1, garden.width * SCALE + pad * 2);
            const nextFit = clamp(availableWidth / naturalWidth, 0.35, 1);
            setFitZoom(nextFit);
        };
        updateFitZoom();
        const wrap = canvasWrapRef.current;
        let observer = null;
        if (wrap && typeof ResizeObserver !== "undefined") {
            observer = new ResizeObserver(updateFitZoom);
            observer.observe(wrap);
        }
        window.addEventListener("resize", updateFitZoom);
        return () => {
            observer?.disconnect?.();
            window.removeEventListener("resize", updateFitZoom);
        };
    }, [garden.width, garden.height]);
    useEffect(() => {
        if (!selItem) {
            setEditForm(null);
            return;
        }
        if (selKind === "zone") {
            setEditForm({
                name: selItem.name,
                type: selItem.type || "grass",
                notes: selItem.notes || "",
            });
            return;
        }
        if (selKind === "slot") {
            setEditForm({
                name: selItem.name || "",
                label: selItem.label || "",
                row_count: String(selItem.row_count || 1),
                spacing_cm: selItem.spacing_cm ? String(selItem.spacing_cm) : "",
                plant_count: selItem.plant_count ? String(selItem.plant_count) : "",
                row_length_m: selItem.row_length_m ? String(selItem.row_length_m) : "",
                orientation: selItem.orientation || "horizontal",
                notes: selItem.notes || "",
            });
            return;
        }
        setEditForm({
            name:selItem.name,
            x:selItem.x,
            y:selItem.y,
            width:selItem.width,
            height:selItem.height,
            notes:selItem.notes||"",
            linked_field_id:selItem.linked_field_id||"",
            shape: selItem.shape || "rect",
            species: selItem.species || "",
            info: selItem.info || "",
            maintenance_notes: selItem.maintenance_notes || "",
            prune_interval_weeks: selItem.prune_interval_weeks ? String(selItem.prune_interval_weeks) : "",
            next_prune_date: selItem.next_prune_date || "",
        });
    }, [selId, selKind, fields, structures, zones, slots]);

    // Keyboard shortcuts
    const allItems = useMemo(() => [
        ...fields.map(f=>({kind:"field",item:f})),
        ...structures.map(s=>({kind:"struct",item:s})),
        ...zones.map(z=>({kind:"zone",item:z})),
    ], [fields, structures, zones]);
    useEffect(() => {
        const onKey = (e) => {
            // Ignore when typing in an input
            if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT")) return;
            if (e.key === "Escape") {
                setSelId(null); setSelKind(null); setZoneDraft(null); setPickMenu(null);
            }
            if ((e.key === "Delete" || e.key === "Backspace") && selId && selKind) {
                e.preventDefault();
                if (selKind === "field")  { dispatch({type:"DELETE_FIELD",  payload:selId}); setSelId(null); setSelKind(null); }
                if (selKind === "struct") { dispatch({type:"DELETE_STRUCT", payload:selId}); setSelId(null); setSelKind(null); }
                if (selKind === "zone")   { dispatch({type:"DELETE_ZONE",   payload:selId}); setSelId(null); setSelKind(null); }
            }
            if (e.key === "Tab" && allItems.length > 0) {
                e.preventDefault();
                const idx = allItems.findIndex(h => h.item.id === selId);
                const next = allItems[(idx + (e.shiftKey ? -1 : 1) + allItems.length) % allItems.length];
                setSelId(next.item.id); setSelKind(next.kind);
            }
            // Arrow keys: nudge selected item by 0.1m (or 0.5m with Shift)
            if (selId && selKind && selKind !== "zone" && ["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(e.key)) {
                e.preventDefault();
                const step = e.shiftKey ? 0.5 : 0.1;
                const dx = e.key==="ArrowLeft" ? -step : e.key==="ArrowRight" ? step : 0;
                const dy = e.key==="ArrowUp"   ? -step : e.key==="ArrowDown"  ? step : 0;
                const type = selKind==="field" ? "UPDATE_FIELD" : "UPDATE_STRUCT";
                const list = selKind==="field" ? fields : structures;
                const item = list.find(i=>i.id===selId);
                if (item) dispatch({ type, payload:{ ...item, x:Math.max(0,+(item.x+dx).toFixed(1)), y:Math.max(0,+(item.y+dy).toFixed(1)) } });
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [selId, selKind, allItems, dispatch, fields, structures]);

    const getSvgXY = (e) => {
        const r = svgRef.current.getBoundingClientRect();
        return { x:e.clientX-r.left, y:e.clientY-r.top };
    };
    const startDrag = (e, kind, item) => {
        if (zoneDraft || e.button !== 0) return;
        e.preventDefault();
        e.stopPropagation();
        const { x, y } = getSvgXY(e);
        dragRef.current = { kind, id:item.id, startX:x, startY:y, origX:item.x, origY:item.y };
        setSelId(item.id);
        setSelKind(kind);
        setLivePos({ id:item.id, x:item.x, y:item.y, width:item.width, height:item.height });
    };
    const startResize = (e, kind, item, handle) => {
        if (zoneDraft || e.button !== 0) return;
        e.preventDefault();
        e.stopPropagation();
        const { x, y } = getSvgXY(e);
        resizeRef.current = { kind, id:item.id, handle, startX:x, startY:y, origX:item.x, origY:item.y, origW:item.width, origH:item.height };
        setSelId(item.id);
        setSelKind(kind);
        setLivePos({ id:item.id, x:item.x, y:item.y, width:item.width, height:item.height });
    };
    const handleMouseMove = useCallback((e) => {
        if (!dragRef.current && !resizeRef.current) return;
        const r = svgRef.current?.getBoundingClientRect();
        if (!r) return;
        const cx = e.clientX - r.left;
        const cy = e.clientY - r.top;
        if (dragRef.current) {
            const { startX, startY, origX, origY, id } = dragRef.current;
            const dx = (cx - startX) / sc;
            const dy = (cy - startY) / sc;
            const item = [...fields, ...structures].find(i => i.id === id);
            if (!item) return;
            setLivePos(p => ({ ...p, x:Math.round(clamp(origX+dx,0,garden.width-item.width)*10)/10, y:Math.round(clamp(origY+dy,0,garden.height-item.height)*10)/10 }));
        }
        if (resizeRef.current) {
            const { startX, startY, origX, origY, origW, origH, handle } = resizeRef.current;
            const dx = (cx - startX) / sc;
            const dy = (cy - startY) / sc;
            let nx = origX, ny = origY, nw = origW, nh = origH;
            if (handle.includes("e")) nw = Math.max(0.5, origW + dx);
            if (handle.includes("s")) nh = Math.max(0.5, origH + dy);
            if (handle.includes("w")) { nx = clamp(origX + dx, 0, origX + origW - 0.5); nw = origW - (nx - origX); }
            if (handle.includes("n")) { ny = clamp(origY + dy, 0, origY + origH - 0.5); nh = origH - (ny - origY); }
            nw = Math.min(nw, garden.width - nx);
            nh = Math.min(nh, garden.height - ny);
            setLivePos({ id:resizeRef.current.id, x:Math.round(nx*10)/10, y:Math.round(ny*10)/10, width:Math.round(nw*10)/10, height:Math.round(nh*10)/10 });
        }
    }, [sc, fields, structures, garden]);
    const commitChange = useCallback(() => {
        const ref = dragRef.current || resizeRef.current;
        if (ref && livePos && livePos.id === ref.id) {
            const { kind, id } = ref;
            if (kind === "field") {
                const item = fields.find(f => f.id === id);
                if (item) dispatch({ type:"UPDATE_FIELD", payload:{ ...item, ...livePos } });
            } else if (kind === "struct") {
                const item = structures.find(s => s.id === id);
                if (item) dispatch({ type:"UPDATE_STRUCT", payload:{ ...item, ...livePos } });
            }
        }
        dragRef.current = null;
        resizeRef.current = null;
    }, [livePos, fields, structures, dispatch]);
    useEffect(() => {
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", commitChange);
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", commitChange);
        };
    }, [handleMouseMove, commitChange]);
    const eff = (item) => (livePos && livePos.id === item.id) ? { ...item, ...livePos } : item;
    const pickTargetsAt = useCallback((wx, wy) => {
        const hits = [];
        zones.forEach(z => {
            if (pointInPolygon(wx, wy, z.points || [])) hits.push({ kind:"zone", item:z, label:`${ZONE_ICONS[z.type] || "???"} ${z.name}` });
        });
        fields.forEach(f => {
            const ef_ = eff(f);
            if (wx >= ef_.x && wx <= ef_.x + ef_.width && wy >= ef_.y && wy <= ef_.y + ef_.height) {
                hits.push({ kind:"field", item:f, label:`??? ${f.name}` });
            }
        });
        structures.forEach(s => {
            const es_ = eff(s);
            if (wx >= es_.x && wx <= es_.x + es_.width && wy >= es_.y && wy <= es_.y + es_.height) {
                hits.push({ kind:"struct", item:s, label:`${STRUCT_ICONS[s.type] || "???"} ${s.name}` });
            }
        });
        const unique = new Map();
        hits.forEach(hit => unique.set(`${hit.kind}:${hit.item.id}`, hit));
        return [...unique.values()].sort((a, b) => {
            const order = { struct: 0, field: 1, zone: 2 };
            return (order[a.kind] ?? 9) - (order[b.kind] ?? 9);
        });
    }, [fields, structures, zones, livePos]);
    const handleItemPick = (kind, item, e) => {
        if (zoneDraft) return addZonePoint(e);
        e.stopPropagation();
        const { x, y } = getSvgXY(e);
        const wx = (x - pad) / sc;
        const wy = (y - pad) / sc;
        const hits = pickTargetsAt(wx, wy);
        if (hits.length > 1) {
            setPickMenu({ x:e.clientX, y:e.clientY, hits });
            return;
        }
        setPickMenu(null);
        setSelId(item.id);
        setSelKind(kind);
    };
    const handleCanvasPick = (e) => {
        if (zoneDraft) return addZonePoint(e);
        setPickMenu(null);
        setSelId(null);
        setSelKind(null);
    };
    const HS = 8;
    const HCURSORS = { n:"ns-resize", ne:"nesw-resize", e:"ew-resize", se:"nwse-resize", s:"ns-resize", sw:"nesw-resize", w:"ew-resize", nw:"nwse-resize" };
    const menuLeft = pickMenu ? Math.max(12, Math.min(pickMenu.x + 8, (typeof window !== "undefined" ? window.innerWidth : 1200) - 260)) : 12;
    const menuTop = pickMenu ? Math.max(12, Math.min(pickMenu.y + 8, (typeof window !== "undefined" ? window.innerHeight : 900) - 240)) : 12;
    const panelFields = panelFilter === "all" || panelFilter === "fields" ? fields : [];
    const panelStructs = panelFilter === "all" || panelFilter === "structs" || panelFilter === "greenhouses" ? structures : [];
    const panelZones = panelFilter === "all" || panelFilter === "zones" ? zones : [];
    const structSlotIndex = useMemo(() => {
        const index = {};
        const direct = slots.filter(s => s.parent_type === "struct");
        direct.forEach(slot => {
            (index[slot.parent_id] ||= []).push(slot.id);
        });
        slots.filter(s => s.parent_type === "slot").forEach(slot => {
            direct.filter(parent => parent.id === slot.parent_id).forEach(parent => {
                (index[parent.parent_id] ||= []).push(slot.id);
            });
        });
        return index;
    }, [slots]);
    const countPlantsForStruct = useCallback((st) => {
        const insideBeds = fields.filter(f => f.garden_id === st.garden_id && isInsideGH(f, st)).map(f => f.id);
        const slotIds = new Set(structSlotIndex[st.id] || []);
        return plants.reduce((sum, p) => {
            const inStruct = p.struct_id === st.id || insideBeds.includes(p.field_id) || slotIds.has(p.slot_id);
            return inStruct ? sum + Math.max(1, +p.quantity || 1) : sum;
        }, 0);
    }, [fields, plants, structSlotIndex]);
    const fieldSlotIndex = useMemo(() => {
        const index = {};
        slots.filter(s => s.parent_type === "field").forEach(slot => {
            (index[slot.parent_id] ||= []).push(slot);
        });
        Object.values(index).forEach(list => {
            list.sort((a, b) => {
                const ra = (a.type === "bed_row" || a.type === "tunnel_row") ? 0 : 1;
                const rb = (b.type === "bed_row" || b.type === "tunnel_row") ? 0 : 1;
                if (ra !== rb) return ra - rb;
                return (slotBaseLabel(a) || "").localeCompare(slotBaseLabel(b) || "");
            });
        });
        return index;
    }, [slots]);
    const structRowIndex = useMemo(() => {
        const index = {};
        slots.filter(s => s.parent_type === "struct" && (s.type === "bed_row" || s.type === "tunnel_row")).forEach(slot => {
            (index[slot.parent_id] ||= []).push(slot);
        });
        return index;
    }, [slots]);
    const renderRowSlotOverlay = useCallback((rowSlots, fx, fy, fw, fh) => {
        if (!rowSlots || !rowSlots.length) return null;
        const padX = Math.max(4, Math.min(10, fw * 0.05));
        const padY = Math.max(4, Math.min(10, fh * 0.08));
        const usableX = fx + padX;
        const usableY = fy + padY;
        const usableW = Math.max(0, fw - padX * 2);
        const usableH = Math.max(0, fh - padY * 2);
        const horizontalSlots = rowSlots.filter(slot => slot.orientation !== "vertical");
        const verticalSlots = rowSlots.filter(slot => slot.orientation === "vertical");
        const gap = rowSlots.length > 1 ? Math.max(3, Math.min(8, Math.min(fw, fh) * 0.03)) : 0;
        return (
            <g>
                {horizontalSlots.map((slot, idx) => {
                    const rowColor = slot.type === "bed_row" ? T.primary : T.accent;
                    const bandH = Math.max(14, Math.min(24, (usableH - gap * (horizontalSlots.length - 1)) / Math.max(1, horizontalSlots.length)));
                    const horizontalTop = fy + Math.max(padY, (fh - (horizontalSlots.length * bandH + gap * (horizontalSlots.length - 1))) / 2) + idx * (bandH + gap);
                    const rows = Math.max(1, Math.floor(Number(slot.row_count) || 1));
                    const rowGap = rows > 1 ? (bandH - 14) / Math.max(1, rows - 1) : 0;
                    const selected = selId === slot.id && selKind === "slot";
                    return (
                        <g key={slot.id} style={{ cursor:"pointer" }} onClick={e => { e.stopPropagation(); setSelId(slot.id); setSelKind("slot"); setPickMenu(null); }} onDoubleClick={e => { e.stopPropagation(); renameSlot(slot); }}>
                            <rect x={usableX} y={horizontalTop} width={usableW} height={bandH} rx={3} fill={rowColor + "14"} stroke={selected ? T.accent : rowColor + "9A"} strokeWidth={selected ? 2 : 1} strokeDasharray="3,3" />
                            <text x={usableX + 5} y={horizontalTop + 10} fontSize={8} fontFamily="DM Sans,sans-serif" fontWeight={800} fill={rowColor}>{slotBaseLabel(slot)}</text>
                            <text x={usableX + usableW - 5} y={horizontalTop + 10} textAnchor="end" fontSize={8} fontFamily="DM Sans,sans-serif" fontWeight={700} fill={T.textMuted}>{rows} rows · 0?</text>
                            {Array.from({ length: rows }).map((_, r) => {
                                const ry = rows === 1 ? horizontalTop + bandH / 2 : horizontalTop + 14 + r * rowGap;
                                return (
                                    <line
                                        key={`${slot.id}-${r}`}
                                        x1={usableX + 6}
                                        y1={ry}
                                        x2={usableX + usableW - 6}
                                        y2={ry}
                                        stroke={rowColor}
                                        strokeWidth={1.4}
                                        opacity={0.7}
                                    />
                                );
                            })}
                            {slot.plant_count ? <text x={usableX + usableW - 5} y={horizontalTop + bandH - 4} textAnchor="end" fontSize={7.5} fontFamily="DM Sans,sans-serif" fontWeight={700} fill={T.textSub}>{slot.plant_count} plants</text> : null}
                        </g>
                    );
                })}
                {verticalSlots.map((slot, idx) => {
                    const rowColor = slot.type === "bed_row" ? T.primary : T.accent;
                    const bandW = Math.max(18, Math.min(30, (usableW - gap * (verticalSlots.length - 1)) / Math.max(1, verticalSlots.length)));
                    const verticalLeft = fx + Math.max(padX, (fw - (verticalSlots.length * bandW + gap * (verticalSlots.length - 1))) / 2) + idx * (bandW + gap);
                    const rows = Math.max(1, Math.floor(Number(slot.row_count) || 1));
                    const rowGap = rows > 1 ? (bandW - 14) / Math.max(1, rows - 1) : 0;
                    const selected = selId === slot.id && selKind === "slot";
                    return (
                        <g key={slot.id} style={{ cursor:"pointer" }} onClick={e => { e.stopPropagation(); setSelId(slot.id); setSelKind("slot"); setPickMenu(null); }} onDoubleClick={e => { e.stopPropagation(); renameSlot(slot); }}>
                            <rect x={verticalLeft} y={usableY} width={bandW} height={usableH} rx={3} fill={rowColor + "14"} stroke={selected ? T.accent : rowColor + "9A"} strokeWidth={selected ? 2 : 1} strokeDasharray="3,3" />
                            <text x={verticalLeft + 5} y={usableY + 10} fontSize={8} fontFamily="DM Sans,sans-serif" fontWeight={800} fill={rowColor}>{slotBaseLabel(slot)}</text>
                            <text x={verticalLeft + bandW - 5} y={usableY + 10} textAnchor="end" fontSize={8} fontFamily="DM Sans,sans-serif" fontWeight={700} fill={T.textMuted}>{rows} rows · 90?</text>
                            {Array.from({ length: rows }).map((_, r) => {
                                const rx = rows === 1 ? verticalLeft + bandW / 2 : verticalLeft + 14 + r * rowGap;
                                return (
                                    <line
                                        key={`${slot.id}-${r}`}
                                        x1={rx}
                                        y1={usableY + 6}
                                        x2={rx}
                                        y2={usableY + usableH - 6}
                                        stroke={rowColor}
                                        strokeWidth={1.4}
                                        opacity={0.7}
                                    />
                                );
                            })}
                            {slot.plant_count ? <text x={verticalLeft + bandW - 5} y={usableY + usableH - 4} textAnchor="end" fontSize={7.5} fontFamily="DM Sans,sans-serif" fontWeight={700} fill={T.textSub}>{slot.plant_count} plants</text> : null}
                        </g>
                    );
                })}
            </g>
        );
    }, [renameSlot, selId, selKind]);
    const renderBedRowOverlay = useCallback((field, fx, fy, fw, fh) => {
        const bedSlots = (fieldSlotIndex[field.id] || []).filter(slot => slot.type === "bed_row" || slot.type === "tunnel_row");
        if (!bedSlots.length) return null;
        return renderRowSlotOverlay(bedSlots, fx, fy, fw, fh);
    }, [fieldSlotIndex, renderRowSlotOverlay]);
    const renderHandles = (kind, item) => {
        const {x, y, width, height} = eff(item);
        const fx = pad + x*sc, fy = pad + y*sc, fw = width*sc, fh = height*sc;
        const hps = { n:[fx+fw/2-HS/2,fy-HS/2], ne:[fx+fw-HS/2,fy-HS/2], e:[fx+fw-HS/2,fy+fh/2-HS/2], se:[fx+fw-HS/2,fy+fh-HS/2], s:[fx+fw/2-HS/2,fy+fh-HS/2], sw:[fx-HS/2,fy+fh-HS/2], w:[fx-HS/2,fy+fh/2-HS/2], nw:[fx-HS/2,fy-HS/2] };
        return Object.entries(hps).map(([h, [hx, hy]]) => (
            <rect key={h} x={hx} y={hy} width={HS} height={HS} fill="white" stroke={T.accent} strokeWidth={1.5} rx={2} style={{ cursor:HCURSORS[h] }} onMouseDown={e => startResize(e, kind, item, h)} />
        ));
    };
    const addZonePoint = (e) => {
        if (!zoneDraft) return;
        const { x, y } = getSvgXY(e);
        const gx = clamp((x - pad) / sc, 0, garden.width);
        const gy = clamp((y - pad) / sc, 0, garden.height);
        setZoneDraft(d => ({ ...d, points: [...d.points, { x:Math.round(gx*10)/10, y:Math.round(gy*10)/10 }] }));
        setSelId(null);
        setSelKind(null);
        setEditForm(null);
    };
    const beginZoneDraft = () => {
        setZoneDraft({ name:"New Zone", type:"grass", notes:"", points:[] });
        setSelId(null);
        setSelKind(null);
    };
    const cancelZoneDraft = () => setZoneDraft(null);
    const finishZoneDraft = () => {
        if (!zoneDraft || zoneDraft.points.length < 3) return;
        dispatch({
            type:"ADD_ZONE",
            payload:{
                id: gid(),
                garden_id: garden.id,
                name: zoneDraft.name.trim() || "Zone",
                type: zoneDraft.type,
                notes: zoneDraft.notes || "",
                points: zoneDraft.points,
            }
        });
        setZoneDraft(null);
    };
    const saveEdit = () => {
        if (!selItem || !editForm) return;
        if (selKind === "zone") {
            dispatch({ type:"UPDATE_ZONE", payload:{ ...selItem, name:editForm.name, type:editForm.type, notes:editForm.notes } });
            return;
        }
        if (selKind === "slot") {
            const next = {
                ...selItem,
                name: editForm.name,
                label: (editForm.label || editForm.name || selItem.label || selItem.name || "").trim(),
                notes: editForm.notes || "",
                orientation: editForm.orientation || "horizontal",
            };
            if (selItem.type === "tunnel_row" || selItem.type === "bed_row") {
                next.row_count = Math.max(1, +editForm.row_count || 1);
                next.spacing_cm = Math.max(0, +editForm.spacing_cm || 0);
                next.plant_count = Math.max(0, +editForm.plant_count || 0);
                next.row_length_m = Math.max(0, +editForm.row_length_m || 0);
            }
            dispatch({ type:"UPDATE_SLOT", payload: next });
            return;
        }
        const x = clamp(+editForm.x, 0, garden.width - 0.1);
        const y = clamp(+editForm.y, 0, garden.height - 0.1);
        const width = clamp(+editForm.width, 0.1, garden.width - x);
        const height = clamp(+editForm.height, 0.1, garden.height - y);
        const nextStruct = {
            ...selItem,
            name:editForm.name,
            x,
            y,
            width,
            height,
            notes:editForm.notes,
            linked_field_id: selKind==="struct" ? editForm.linked_field_id || "" : selItem.linked_field_id || "",
            ...(selKind === "field" ? { shape: editForm.shape || "rect" } : {}),
        };
        if (selKind === "struct" && MAINTENANCE_STRUCT_TYPES.has(selItem.type)) {
            nextStruct.species = editForm.species || "";
            nextStruct.info = editForm.info || "";
            nextStruct.maintenance_notes = editForm.maintenance_notes || "";
            nextStruct.prune_interval_weeks = Math.max(0, +editForm.prune_interval_weeks || 0);
            nextStruct.next_prune_date = editForm.next_prune_date || "";
        }
        dispatch({
            type: selKind==="field" ? "UPDATE_FIELD" : "UPDATE_STRUCT",
            payload: nextStruct
        });
    };
    const openPlantsForSlot = (slotId) => {
        if (!navigate) return;
        navigate("plants", { slot: slotId });
    };
    const gridLines = [];
    for (let x = 0; x <= garden.width; x++) {
        const m = x === 0 || x === garden.width;
        gridLines.push(<line key={`gx${x}`} x1={pad+x*sc} y1={pad} x2={pad+x*sc} y2={pad+gH} stroke={m?"#BDBDBD":"#E8E0D5"} strokeWidth={m?1.5:0.75} />);
    }
    for (let y = 0; y <= garden.height; y++) {
        const m = y === 0 || y === garden.height;
        gridLines.push(<line key={`gy${y}`} x1={pad} y1={pad+y*sc} x2={pad+garden.width*sc} y2={pad+y*sc} stroke={m?"#BDBDBD":"#E8E0D5"} strokeWidth={m?1.5:0.75} />);
    }
    const labels = [];
    for (let x = 0; x <= garden.width; x += (garden.width > 20 ? 5 : garden.width > 10 ? 2 : 1)) labels.push(<text key={`lx${x}`} x={pad+x*sc} y={pad-8} textAnchor="middle" fontSize={9} fill={T.textMuted} fontFamily="DM Sans,sans-serif">{x}m</text>);
    for (let y = 0; y <= garden.height; y += (garden.height > 20 ? 5 : garden.height > 10 ? 2 : 1)) labels.push(<text key={`ly${y}`} x={pad-8} y={pad+y*sc+4} textAnchor="end" fontSize={9} fill={T.textMuted} fontFamily="DM Sans,sans-serif">{y}m</text>);
    const getFontSize = (w, h, name) => clamp(Math.min(w*sc/Math.max(name.length,4)*1.4, h*sc/3.5), 7, 13);
    const renderZone = (zone) => {
        const pts = zone.points || [];
        const area = polygonArea(pts);
        const center = polygonCentroid(pts);
        const isSel = selId === zone.id;
        const labelSize = clamp(area > 0 ? Math.sqrt(area) * sc * 0.09 : 11, 10, 14);
        const zoneFill = ZONE_FILL[zone.type] || "rgba(127,127,127,0.2)";
        const zoneStroke = ZONE_STROKE[zone.type] || T.textMuted;
        return (
            <g key={zone.id}>
                <polygon
                    points={polygonPointsString(pts)}
                    fill={zoneFill}
                    stroke={isSel ? T.accent : zoneStroke}
                    strokeWidth={isSel ? 2.5 : 1.6}
                    strokeDasharray={zone.type === "path" ? "6,4" : "none"}
                    style={{ cursor:"pointer" }}
                    onClick={e => handleItemPick("zone", zone, e)}
                />
                {pts.map((pt, idx) => (
                    <circle key={idx} cx={pad + pt.x*sc} cy={pad + pt.y*sc} r={isSel ? 3.5 : 2.5} fill={zoneStroke} opacity={0.95} style={{ pointerEvents:"none" }} />
                ))}
                {pts.length >= 3 && (
                    <text
                        x={pad + center.x*sc}
                        y={pad + center.y*sc}
                        textAnchor="middle"
                        fontSize={labelSize}
                        fontFamily="DM Sans,sans-serif"
                        fill={zoneStroke}
                        fontWeight={800}
                        style={{ pointerEvents:"none" }}
                    >
                        {ZONE_ICONS[zone.type] || "???"} {zone.name}
                    </text>
                )}
            </g>
        );
    };
    const renderDraft = () => {
        if (!zoneDraft) return null;
        const pts = zoneDraft.points || [];
        if (!pts.length) return null;
        const fill = ZONE_FILL[zoneDraft.type] || "rgba(127,127,127,0.16)";
        const stroke = ZONE_STROKE[zoneDraft.type] || T.accent;
        return (
            <g>
                {pts.length >= 2 && <polyline points={polygonPointsString(pts)} fill="none" stroke={stroke} strokeWidth={2.2} strokeDasharray="6,4" />}
                {pts.length >= 3 && <polygon points={polygonPointsString(pts)} fill={fill} stroke={stroke} strokeWidth={2.2} strokeDasharray="6,4" opacity={0.95} />}
                {pts.map((pt, idx) => (
                    <circle key={idx} cx={pad + pt.x*sc} cy={pad + pt.y*sc} r={4} fill={stroke} stroke="#fff" strokeWidth={1.2} />
                ))}
            </g>
        );
    };
    return (
        <div>
            <div style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 14px", background:T.surfaceAlt, borderRadius:`${T.r} ${T.r} 0 0`, borderBottom:`1px solid ${T.border}`, flexWrap:"wrap" }}>
                <span style={{ fontSize:12, color:T.textSub, flex:"1 1 320px", fontWeight:600 }}>
                    ?? {garden.width}m × {garden.height}m · <span style={{ color:T.primary }}>Drag</span> to move · <span style={{ color:T.accent }}>Handles</span> to resize · Click to edit
                </span>
                <Btn size="sm" variant={zoneDraft ? "danger" : "accent"} onClick={zoneDraft ? cancelZoneDraft : beginZoneDraft}>
                    {zoneDraft ? "Cancel Zone" : "Add Zone"}
                </Btn>
                {zoneDraft && <Btn size="sm" variant="primary" onClick={finishZoneDraft} disabled={zoneDraft.points.length < 3}>Finish Zone</Btn>}
                <Btn size="sm" variant={viewMode === "3d" ? "primary" : "secondary"} onClick={() => setViewMode(v => v === "3d" ? "2d" : "3d")}>
                    {viewMode === "3d" ? "2D" : "3D"}
                </Btn>
                <Btn size="sm" variant="secondary" onClick={() => setZoom(z => Math.max(0.35, +(z-0.15).toFixed(2)))}>-</Btn>
                <span style={{ fontSize:12, color:T.textSub, minWidth:38, textAlign:"center", fontWeight:700 }}>{Math.round(zoom * fitZoom * 100)}%</span>
                <Btn size="sm" variant="secondary" onClick={() => setZoom(z => Math.min(2.5, +(z+0.15).toFixed(2)))}>+</Btn>
                <Btn size="sm" variant="ghost" onClick={() => setZoom(1)}>Reset</Btn>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"minmax(0,1fr) 280px", gap:12, alignItems:"start" }}>
                <div ref={canvasWrapRef} style={{ overflow:"auto", background:"#F2EDE4", minHeight:320, border:`1px solid ${T.border}`, borderTop:"none" }}>
                    {viewMode === "3d" ? (
                        <React.Suspense fallback={<div style={{ minHeight:460, display:"flex", alignItems:"center", justifyContent:"center", color:T.textMuted, fontSize:13, fontWeight:700 }}>Loading 3D scene…</div>}>
                            <Garden3DScene garden={garden} fields={fields} structures={structures} zones={zones} plants={plants} />
                        </React.Suspense>
                    ) : (
                    <svg ref={svgRef} width={pad*2+gW} height={pad*2+gH} style={{ display:"block", userSelect:"none" }}>
                    <defs>
                        <pattern id="soil" patternUnits="userSpaceOnUse" width="8" height="8">
                            <rect width="8" height="8" fill="#F5F0E3" />
                            <circle cx="2" cy="3" r="0.6" fill="#D9CEB5" opacity="0.5" />
                            <circle cx="6" cy="6" r="0.5" fill="#D9CEB5" opacity="0.4" />
                        </pattern>
                    </defs>
                    <rect
                        x={pad}
                        y={pad}
                        width={gW}
                        height={gH}
                        fill="url(#soil)"
                        onClick={handleCanvasPick}
                    />
                    {gridLines}
                    {labels}
                    {zones.map(renderZone)}
                    {renderDraft()}
                    {structures.map(st => {
                        const e_ = eff(st);
                        const sx = pad + e_.x*sc, sy = pad + e_.y*sc, sw = e_.width*sc, sh = e_.height*sc;
                        const isGH = st.type === "greenhouse" || st.type === "tunnel_greenhouse";
                        const fs = getFontSize(e_.width, e_.height, st.name);
                        const isSel = selId === st.id;
                        const plantCount = countPlantsForStruct(st);
                        const rowSlots = structRowIndex[st.id] || [];
                        const depth = Math.max(8, Math.min(sw, sh) * 0.22);
                        const roofRise = Math.max(10, depth * 0.75);
                        const faceFill = STRUCT_FILL[st.type] || "rgba(128,128,128,0.2)";
                        const faceStroke = STRUCT_STROKE[st.type] || "#888";
                        if (viewMode === "3d" && isGH) {
                            const topY = sy - roofRise;
                            const rightX = sx + depth;
                            const rightY = sy + depth * 0.45;
                            return (
                                <g key={st.id}>
                                    <polygon
                                        points={`${sx},${sy} ${sx + sw},${sy} ${sx + sw},${sy + sh} ${sx},${sy + sh}`}
                                        fill={faceFill}
                                        stroke={isSel ? T.accent : faceStroke}
                                        strokeWidth={isSel ? 2.5 : 1.4}
                                        style={{ cursor:"move" }}
                                        onMouseDown={e => startDrag(e, "struct", st)}
                                        onClick={e => handleItemPick("struct", st, e)}
                                    />
                                    <polygon
                                        points={`${sx},${sy} ${sx + depth},${sy - roofRise} ${sx + sw + depth},${sy - roofRise} ${sx + sw},${sy}`}
                                        fill={faceFill}
                                        opacity={0.96}
                                        stroke={isSel ? T.accent : faceStroke}
                                        strokeWidth={isSel ? 2.2 : 1.2}
                                        onMouseDown={e => startDrag(e, "struct", st)}
                                        onClick={e => handleItemPick("struct", st, e)}
                                    />
                                    <polygon
                                        points={`${sx + sw},${sy} ${sx + sw + depth},${sy - roofRise} ${sx + sw + depth},${sy + sh - roofRise * 0.15} ${sx + sw},${sy + sh}`}
                                        fill={faceFill}
                                        opacity={0.72}
                                        stroke={isSel ? T.accent : faceStroke}
                                        strokeWidth={isSel ? 2 : 1}
                                        onMouseDown={e => startDrag(e, "struct", st)}
                                        onClick={e => handleItemPick("struct", st, e)}
                                    />
                                    <polygon
                                        points={`${sx},${sy} ${sx + depth},${sy - roofRise} ${sx + depth},${sy + sh - roofRise * 0.15} ${sx},${sy + sh}`}
                                        fill="#ffffff"
                                        opacity={0.08}
                                        stroke="none"
                                    />
                                    <rect
                                        x={sx + depth * 0.15}
                                        y={topY + roofRise * 0.2}
                                        width={sw}
                                        height={sh}
                                        fill="none"
                                        stroke={isSel ? T.accent : faceStroke}
                                        strokeWidth={isSel ? 2.5 : 1.3}
                                        strokeDasharray="8,4"
                                        rx={isGH ? 6 : 3}
                                        style={{ cursor:"move" }}
                                        onMouseDown={e => startDrag(e, "struct", st)}
                                        onClick={e => handleItemPick("struct", st, e)}
                                    />
                                    <text x={sx + sw/2 + depth * 0.5} y={sy + sh/2 - fs*0.3 - roofRise * 0.18} textAnchor="middle" fontSize={Math.min(fs+1,15)} fontFamily="DM Sans,sans-serif" fill={faceStroke} fontWeight={800} style={{ pointerEvents:"none" }}>{STRUCT_ICONS[st.type]}</text>
                                    {sh > sc*0.55 && <text x={sx + sw/2 + depth * 0.5} y={sy + sh/2 + fs*0.85 - roofRise * 0.18} textAnchor="middle" fontSize={clamp(fs,7,11)} fontFamily="DM Sans,sans-serif" fill={faceStroke} fontWeight={700} style={{ pointerEvents:"none" }}>{st.name}</text>}
                                    {sh > sc*0.95 && plantCount > 0 && <text x={sx + sw/2 + depth * 0.5} y={sy + sh/2 + fs*2.35 - roofRise * 0.18} textAnchor="middle" fontSize={8} fontFamily="DM Sans,sans-serif" fill={T.primary} fontWeight={700} style={{ pointerEvents:"none" }}>{plantCount} plants</text>}
                                    {sh > sc*1.1 && <text x={sx + sw/2 + depth * 0.5} y={sy + sh/2 + fs*1.65 - roofRise * 0.18} textAnchor="middle" fontSize={8} fontFamily="DM Sans,sans-serif" fill={faceStroke} style={{ pointerEvents:"none" }}>{e_.width} × {e_.height}m</text>}
                                    {rowSlots.length > 0 && <g transform={`translate(${depth * 0.5}, ${-roofRise * 0.15})`}>{renderRowSlotOverlay(rowSlots, sx, sy, sw, sh)}</g>}
                                    {isSel && renderHandles("struct", st)}
                                </g>
                            );
                        }
                        return (
                            <g key={st.id}>
                                <rect x={sx} y={sy} width={sw} height={sh} fill={STRUCT_FILL[st.type] || "rgba(128,128,128,0.2)"} stroke={isSel ? T.accent : (STRUCT_STROKE[st.type] || "#888")} strokeWidth={isSel ? 2.5 : (isGH ? 2 : 1.2)} strokeDasharray={isGH ? "8,4" : "none"} rx={isGH ? 5 : 3} style={{ cursor:"move" }} onMouseDown={e => startDrag(e, "struct", st)} onClick={e => handleItemPick("struct", st, e)} />
                                {rowSlots.length > 0 && renderRowSlotOverlay(rowSlots, sx, sy, sw, sh)}
                                <text x={sx+sw/2} y={sy+sh/2-fs*0.3} textAnchor="middle" fontSize={Math.min(fs+1,15)} fontFamily="DM Sans,sans-serif" fill={STRUCT_STROKE[st.type] || "#555"} fontWeight={700} style={{ pointerEvents:"none" }}>{STRUCT_ICONS[st.type]}</text>
                                {sh > sc*0.6 && <text x={sx+sw/2} y={sy+sh/2+fs*0.9} textAnchor="middle" fontSize={clamp(fs,7,11)} fontFamily="DM Sans,sans-serif" fill={STRUCT_STROKE[st.type] || "#555"} fontWeight={600} style={{ pointerEvents:"none" }}>{st.name}</text>}
                                {sh > sc*1.0 && plantCount > 0 && <text x={sx+sw/2} y={sy+sh/2+fs*2.55} textAnchor="middle" fontSize={8} fontFamily="DM Sans,sans-serif" fill={T.primary} fontWeight={700} style={{ pointerEvents:"none" }}>{plantCount} plants</text>}
                                {sh > sc*1.2 && <text x={sx+sw/2} y={sy+sh/2+fs*1.9} textAnchor="middle" fontSize={8} fontFamily="DM Sans,sans-serif" fill={STRUCT_STROKE[st.type] || "#888"} style={{ pointerEvents:"none" }}>{e_.width} × {e_.height}m</text>}
                                {isSel && renderHandles("struct", st)}
                            </g>
                        );
                    })}
                    {fields.map(f => {
                        const e_ = eff(f), fx = pad + e_.x*sc, fy = pad + e_.y*sc, fw = e_.width*sc, fh = e_.height*sc;
                        const fc = FIELD_COLORS[f.type] || T.primary;
                        const fs = getFontSize(e_.width, e_.height, f.name);
                        const isSel = selId === f.id;
                        const shape = f.shape || "rect";
                        const rowSlots = (fieldSlotIndex[f.id] || []).filter(slot => slot.type === "bed_row" || slot.type === "tunnel_row");
                        const sharedSvgProps = { fill:fc+"28", stroke:isSel?T.accent:fc, strokeWidth:isSel?2.5:2, style:{cursor:"move"}, onMouseDown:e=>startDrag(e,"field",f), onClick:e=>handleItemPick("field",f,e) };
                        // Text center adjusted per shape
                        const [tx, ty] = shape==="semi_n" ? [fx+fw/2, fy+fh*0.38] : shape==="semi_s" ? [fx+fw/2, fy+fh*0.62] : shape==="semi_e" ? [fx+fw*0.65, fy+fh/2] : shape==="semi_w" ? [fx+fw*0.35, fy+fh/2] : [fx+fw/2, fy+fh/2];
                        return (
                            <g key={f.id}>
                                {shape==="circle" && <ellipse cx={fx+fw/2} cy={fy+fh/2} rx={fw/2} ry={fh/2} {...sharedSvgProps}/>}
                                {shape==="semi_n" && <path d={`M ${fx} ${fy+fh} A ${fw/2} ${fh} 0 0 0 ${fx+fw} ${fy+fh} Z`} {...sharedSvgProps}/>}
                                {shape==="semi_s" && <path d={`M ${fx} ${fy} A ${fw/2} ${fh} 0 0 1 ${fx+fw} ${fy} Z`} {...sharedSvgProps}/>}
                                {shape==="semi_e" && <path d={`M ${fx} ${fy} A ${fw} ${fh/2} 0 0 1 ${fx} ${fy+fh} Z`} {...sharedSvgProps}/>}
                                {shape==="semi_w" && <path d={`M ${fx+fw} ${fy} A ${fw} ${fh/2} 0 0 0 ${fx+fw} ${fy+fh} Z`} {...sharedSvgProps}/>}
                                {(!shape || shape==="rect") && <>
                                    <rect x={fx} y={fy} width={fw} height={fh} {...sharedSvgProps} rx={3}/>
                                    <rect x={fx} y={fy} width={fw} height={Math.min(fh,4)} fill={fc} opacity={0.7} style={{pointerEvents:"none"}}/>
                                </>}
                                {rowSlots.length > 0 && renderBedRowOverlay(f, fx, fy, fw, fh)}
                                <text x={tx} y={ty+fs*0.4} textAnchor="middle" fontSize={clamp(fs,7,13)} fontFamily="DM Sans,sans-serif" fill={fc} fontWeight={800} style={{ pointerEvents:"none" }}>{f.name}</text>
                                {fh > sc*0.8 && <text x={tx} y={ty+fs*1.5} textAnchor="middle" fontSize={8} fontFamily="DM Sans,sans-serif" fill={fc+"AA"} style={{ pointerEvents:"none" }}>{e_.width} × {e_.height}m</text>}
                                {isSel && renderHandles("field", f)}
                            </g>
                        );
                    })}
                    <rect x={pad} y={pad} width={gW} height={gH} fill="none" stroke={T.primary} strokeWidth={2.5} rx={3} style={{ pointerEvents:"none" }} />
                    <text x={pad+gW-6} y={pad+16} textAnchor="end" fontSize={14} fill={T.primary} fontFamily="Fraunces,serif" fontWeight={800}>N?</text>
                    <g transform={`translate(${pad},${pad+gH+16})`}>
                        <rect x={0} y={0} width={sc} height={5} fill={T.primary} opacity={0.4} rx={2} />
                        <text x={sc/2} y={17} textAnchor="middle" fontSize={9} fill={T.textSub} fontFamily="DM Sans,sans-serif">1 metre</text>
                    </g>
                    </svg>
                    )}
                </div>
                <Card style={{ padding:14, position:"sticky", top:12, alignSelf:"start", maxHeight:"calc(100vh - 140px)", overflow:"auto" }}>
                    {selItem && editForm ? (
                        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8 }}>
                                <div>
                                    <div style={{ fontSize:12, fontWeight:800, color:T.textMuted, textTransform:"uppercase", letterSpacing:0.5 }}>Selected</div>
                                    <div style={{ fontSize:15, fontWeight:900, color:T.text, fontFamily:"Fraunces, serif" }}>{selItem.name}</div>
                                    <div style={{ fontSize:11, color:T.textMuted }}>{selKind==="zone" ? "Zone" : selKind==="struct" ? "Structure" : "Bed"}</div>
                                </div>
                                <Btn size="sm" variant="ghost" onClick={() => { setSelId(null); setSelKind(null); }}>?</Btn>
                            </div>
                            {selKind === "zone" ? (
                                <div style={{ display:"grid", gap:10 }}>
                                    <Sel label="Type" value={editForm.type} onChange={v=>setEditForm(f=>({...f,type:v}))} options={ZONE_TYPES.map(z => ({ value:z, label:`${ZONE_ICONS[z]} ${LANG[lang]?.[ZONE_LABEL_K[z]] || LANG.en[ZONE_LABEL_K[z]] || z}` }))} />
                                    <Input label="Name" value={editForm.name} onChange={e=>setEditForm(f=>({...f,name:e}))} />
                                    <Textarea label="Notes" value={editForm.notes} onChange={v=>setEditForm(f=>({...f,notes:v}))} rows={2} />
                                    <div style={{ display:"flex", gap:8 }}>
                                        <Btn size="sm" variant="primary" onClick={saveEdit}>Save</Btn>
                                        <Btn size="sm" variant="danger" onClick={() => { if (window.confirm("Delete this zone?")) { dispatch({ type:"DELETE_ZONE", payload:selItem.id }); setSelId(null); setSelKind(null); } }}>Delete</Btn>
                                    </div>
                                    <div style={{ fontSize:11, color:T.textMuted }}>Area: {polygonArea(selItem.points||[]).toFixed(1)}m²</div>
                                </div>
                            ) : (
                                <div style={{ display:"grid", gap:10 }}>
                                    <Input label="Name" value={editForm.name} onChange={e=>setEditForm(f=>({...f,name:e}))} />
                                    {selKind === "field" && (
                                        <BedShapePicker value={editForm.shape||"rect"} onChange={v=>setEditForm(f=>({...f,shape:v}))}/>
                                    )}
                                    <FormRow cols={2}>
                                        <Input label="X (m)" value={editForm.x} onChange={e=>setEditForm(f=>({...f,x:e}))} type="number" min="0" step="0.1" />
                                        <Input label="Y (m)" value={editForm.y} onChange={e=>setEditForm(f=>({...f,y:e}))} type="number" min="0" step="0.1" />
                                        <Input label="W (m)" value={editForm.width} onChange={e=>setEditForm(f=>({...f,width:e}))} type="number" min="0.1" step="0.1" />
                                        <Input label="H (m)" value={editForm.height} onChange={e=>setEditForm(f=>({...f,height:e}))} type="number" min="0.1" step="0.1" />
                                    </FormRow>
                                    {selKind === "struct" && (
                                        <Sel
                                            label="Linked field"
                                            value={editForm.linked_field_id || ""}
                                            onChange={v=>setEditForm(f=>({...f, linked_field_id:v}))}
                                            options={[
                                                { value:"", label:"No link" },
                                                ...fields.filter(f=>f.garden_id===selItem.garden_id).map(f=>({ value:f.id, label:f.name })),
                                            ]}
                                        />
                                    )}
                                    {selKind === "struct" && (
                                        <div style={{ display:"grid", gap:10 }}>
                                            <Textarea label="Info" value={editForm.info || ""} onChange={v=>setEditForm(f=>({...f,info:v}))} rows={2} placeholder="Short description shown in details" />
                                    {MAINTENANCE_STRUCT_TYPES.has(selItem.type) && (
                                        <>
                                            <FormRow cols={2}>
                                                <Input label="Species / type" value={editForm.species || ""} onChange={v=>setEditForm(f=>({...f,species:v}))} placeholder="Beech, yew, privet..." />
                                                <Input label="Prune interval (weeks)" value={editForm.prune_interval_weeks || ""} onChange={v=>setEditForm(f=>({...f,prune_interval_weeks:v}))} type="number" min="0" max="52" />
                                                    </FormRow>
                                                    <Input label="Next prune date" value={editForm.next_prune_date || ""} onChange={v=>setEditForm(f=>({...f,next_prune_date:v}))} type="date" />
                                                    <Textarea label="Maintenance notes" value={editForm.maintenance_notes || ""} onChange={v=>setEditForm(f=>({...f,maintenance_notes:v}))} rows={2} placeholder="Cut in late spring and after summer growth" />
                                                </>
                                            )}
                                        </div>
                                    )}
                                    <Textarea label="Notes" value={editForm.notes} onChange={v=>setEditForm(f=>({...f,notes:v}))} rows={2} />
                                    {selKind === "field" && (fieldSlotIndex[selItem.id] || []).some(slot => slot.type === "bed_row" || slot.type === "tunnel_row") && (
                                        <div style={{ display:"grid", gap:8, marginTop:2 }}>
                                            <div style={{ fontSize:11, fontWeight:800, color:T.textMuted, textTransform:"uppercase", letterSpacing:0.5 }}>Plantrijen</div>
                                            {(fieldSlotIndex[selItem.id] || [])
                                                .filter(slot => slot.type === "bed_row" || slot.type === "tunnel_row")
                                                .map(slot => (
                                                    <div key={slot.id} style={{ padding:10, border:`1px solid ${selId===slot.id&&selKind==="slot"?T.primary:T.border}`, borderRadius:T.rs, background:selId===slot.id&&selKind==="slot"?T.primaryBg:T.surfaceAlt, cursor:"pointer" }} onClick={() => { setSelId(slot.id); setSelKind("slot"); }}>
                                                        <div style={{ display:"flex", justifyContent:"space-between", gap:8, alignItems:"center", marginBottom:6 }}>
                                                            <div style={{ fontSize:12, fontWeight:800, color:T.text }}>{slotBaseLabel(slot)}</div>
                                                            <div style={{ display:"flex", gap:6, alignItems:"center", flexWrap:"wrap" }}>
                                                                <Badge color={slot.type === "bed_row" ? T.primary : T.accent} bg={slot.type === "bed_row" ? T.primaryBg : T.accentBg}>
                                                                    {Math.max(1, Math.floor(Number(slot.row_count) || 1))} rows
                                                                </Badge>
                                                                <Badge color={T.textSub} bg={T.surface}>{slot.orientation === "vertical" ? "90?" : "0?"}</Badge>
                                                                <Btn
                                                                    size="xs"
                                                                    variant="secondary"
                                                                    onClick={(e) => { e.stopPropagation(); dispatch({ type:"UPDATE_SLOT", payload:{ ...slot, orientation: slot.orientation === "vertical" ? "horizontal" : "vertical" } }); }}
                                                                >
                                                                    Rotate 90?
                                                                </Btn>
                                                            </div>
                                                        </div>
                                                        <div style={{ fontSize:11, color:T.textMuted, marginBottom:8 }}>
                                                            {slot.plant_count ? `${slot.plant_count} plants` : "No plant count set yet"}
                                                            {slot.spacing_cm ? ` · ${slot.spacing_cm} cm spacing` : ""}
                                                            {slot.row_length_m ? ` · ${slot.row_length_m} m` : ""}
                                                        </div>
                                                        {renderSlotSeedPlan(slot, { compact: true })}
                                                    </div>
                                                ))}
                                        </div>
                                    )}
                                    <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                                        <Btn size="sm" variant="primary" onClick={saveEdit}>Save</Btn>
                                        <Btn size="sm" variant="danger" onClick={() => {
                                            if (window.confirm(selKind === "field" ? "Delete this bed?" : "Delete this structure?")) {
                                                dispatch({type: selKind==="field" ? "DELETE_FIELD" : "DELETE_STRUCT", payload:selItem.id});
                                                setSelId(null);
                                                setSelKind(null);
                                            }
                                        }}>Delete</Btn>
                                    </div>
                                    <div style={{ fontSize:11, color:T.textMuted }}>{selItem.width}m × {selItem.height}m</div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                            <div>
                                <div style={{ fontSize:12, fontWeight:800, color:T.textMuted, textTransform:"uppercase", letterSpacing:0.5 }}>Context</div>
                                <div style={{ fontSize:15, fontWeight:900, color:T.text, fontFamily:"Fraunces, serif" }}>Objects</div>
                                <div style={{ fontSize:11, color:T.textMuted }}>{fields.length} beds · {structures.length} structures · {zones.length} zones</div>
                            </div>
                            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                                {["all","fields","structs","greenhouses","zones"].map(k => (
                                    <Btn key={k} size="sm" variant={panelFilter===k ? "primary" : "secondary"} onClick={()=>setPanelFilter(k)} style={{ flex:"1 1 96px", justifyContent:"center" }}>
                                        {k === "all" ? "All" : k === "fields" ? "Beds" : k === "structs" ? "Structs" : k === "greenhouses" ? "GH" : "Zones"}
                                    </Btn>
                                ))}
                            </div>
                            <div style={{ display:"grid", gap:10 }}>
                                {panelFields.length>0 && (
                                    <div>
                                        <div style={{ fontSize:11, fontWeight:800, color:T.textMuted, textTransform:"uppercase", letterSpacing:0.5, marginBottom:6 }}>Beds</div>
                                        <div style={{ display:"grid", gap:6 }}>
                                            {panelFields.map(f => (
                                                <button key={f.id} onClick={()=>{ setSelId(f.id); setSelKind("field"); }} style={{ textAlign:"left", border:`1px solid ${selId===f.id&&selKind==="field"?T.primary:T.border}`, background:selId===f.id&&selKind==="field"?T.primaryBg:T.surface, borderRadius:T.rs, padding:"8px 10px", cursor:"pointer", fontFamily:"inherit" }}>
                                                    <div style={{ fontSize:12, fontWeight:800, color:T.text }}>{f.name}</div>
                                                    <div style={{ fontSize:11, color:T.textMuted }}>{LANG[lang]?.[FIELD_LABEL_K[f.type]] || f.type} · {f.width} × {f.height}m</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {panelStructs.length>0 && (
                                    <div>
                                        <div style={{ fontSize:11, fontWeight:800, color:T.textMuted, textTransform:"uppercase", letterSpacing:0.5, marginBottom:6 }}>Structures</div>
                                        <div style={{ display:"grid", gap:6 }}>
                                            {panelStructs.map(st => (
                                                <button key={st.id} onClick={()=>{ setSelId(st.id); setSelKind("struct"); }} style={{ textAlign:"left", border:`1px solid ${selId===st.id&&selKind==="struct"?T.accent:T.border}`, background:selId===st.id&&selKind==="struct"?T.accentBg:T.surface, borderRadius:T.rs, padding:"8px 10px", cursor:"pointer", fontFamily:"inherit" }}>
                                                    <div style={{ display:"flex", justifyContent:"space-between", gap:8, alignItems:"start" }}>
                                                        <div>
                                                            <div style={{ fontSize:12, fontWeight:800, color:T.text }}>{STRUCT_ICONS[st.type] || "???"} {st.name}</div>
                                                            <div style={{ fontSize:11, color:T.textMuted }}>{LANG[lang]?.[STRUCT_LABEL_K[st.type]] || st.type} · {st.width} × {st.height}m</div>
                                                        </div>
                                                        {st.linked_field_id && <Badge color={T.accent} bg={T.accentBg}>linked</Badge>}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {panelZones.length>0 && (
                                    <div>
                                        <div style={{ fontSize:11, fontWeight:800, color:T.textMuted, textTransform:"uppercase", letterSpacing:0.5, marginBottom:6 }}>Zones</div>
                                        <div style={{ display:"grid", gap:6 }}>
                                            {panelZones.map(z => (
                                                <button key={z.id} onClick={()=>{ setSelId(z.id); setSelKind("zone"); }} style={{ textAlign:"left", border:`1px solid ${selId===z.id&&selKind==="zone"?T.primary:T.border}`, background:selId===z.id&&selKind==="zone"?T.primaryBg:T.surface, borderRadius:T.rs, padding:"8px 10px", cursor:"pointer", fontFamily:"inherit" }}>
                                                    <div style={{ fontSize:12, fontWeight:800, color:T.text }}>{ZONE_ICONS[z.type] || "???"} {z.name}</div>
                                                    <div style={{ fontSize:11, color:T.textMuted }}>{LANG[lang]?.[ZONE_LABEL_K[z.type]] || z.type} · {polygonArea(z.points||[]).toFixed(1)}m²</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </Card>
            </div>
            {pickMenu && (
                <div style={{ position:"fixed", inset:0, zIndex:1200 }} onClick={() => setPickMenu(null)}>
                    <div
                        style={{
                            position:"fixed",
                            left:menuLeft,
                            top:menuTop,
                            width:240,
                            background:T.surface,
                            border:`1px solid ${T.border}`,
                            borderRadius:T.rs,
                            boxShadow:T.shLg,
                            padding:10,
                            display:"flex",
                            flexDirection:"column",
                            gap:8,
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{ fontSize:11, fontWeight:800, color:T.textMuted, textTransform:"uppercase", letterSpacing:0.5 }}>Pick item</div>
                        {pickMenu.hits.map(hit => (
                            <Btn
                                key={`${hit.kind}:${hit.item.id}`}
                                variant="secondary"
                                size="sm"
                                onClick={() => {
                                    setSelId(hit.item.id);
                                    setSelKind(hit.kind);
                                    setPickMenu(null);
                                }}
                                style={{ justifyContent:"flex-start", width:"100%" }}
                            >
                                {hit.label}
                            </Btn>
                        ))}
                    </div>
                </div>
            )}
            {zoneDraft && (
                <div style={{ background:T.primaryBg, border:`1px solid ${T.primary}33`, borderTop:"none", borderRadius:`0 0 ${T.r} ${T.r}`, padding:"12px 18px", fontSize:12, color:T.primary, display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
                    <strong>Zone tool</strong>
                    <span>Click to place points. Minimum 3 points. Finish to save a freeform zone.</span>
                    <div style={{ marginLeft:"auto", display:"flex", gap:8 }}>
                        <Btn size="sm" variant="secondary" onClick={() => setZoneDraft(d => d ? ({ ...d, points: [] }) : d)} disabled={!zoneDraft.points.length}>Clear points</Btn>
                    </div>
                </div>
            )}
            {selItem && editForm && (
                <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderTop:"none", borderRadius:`0 0 ${T.r} ${T.r}`, padding:"14px 18px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                        <span style={{ fontSize:20 }}>{selKind==="struct" ? (STRUCT_ICONS[selItem.type]||"???") : selKind==="zone" ? (ZONE_ICONS[selItem.type]||"???") : selKind==="slot" ? "??" : "???"}</span>
                        <div style={{ flex:1 }}>
                            <div style={{ fontSize:13, fontWeight:700, color:T.text }}>{selItem.name}</div>
                            <div style={{ fontSize:11, color:T.textMuted }}>{selKind==="zone" ? "Polygon zone" : selKind==="slot" ? "Plantrij" : "Edit inline or type exact values"}</div>
                        </div>
                        <Btn size="sm" variant="ghost" onClick={() => { setSelId(null); setSelKind(null); }}>?</Btn>
                    </div>
                    {selKind === "zone" ? (
                        <>
                            <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:8, alignItems:"end" }}>
                                <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
                                    <label style={{ fontSize:10, fontWeight:700, color:T.textSub, letterSpacing:0.5, textTransform:"uppercase" }}>Name</label>
                                    <input value={editForm.name} onChange={e=>setEditForm(f=>({...f,name:e.target.value}))} style={{ fontFamily:"inherit", fontSize:13, color:T.text, background:T.bg, border:`1.5px solid ${T.border}`, borderRadius:T.rs, padding:"6px 10px", outline:"none", width:"100%" }} />
                                </div>
                                <Sel label="Type" value={editForm.type} onChange={v=>setEditForm(f=>({...f,type:v}))} options={ZONE_TYPES.map(z => ({ value:z, label:`${ZONE_ICONS[z]} ${LANG[lang]?.[ZONE_LABEL_K[z]] || LANG.en[ZONE_LABEL_K[z]] || z}` }))} />
                            </div>
                            <div style={{ marginTop:10 }}>
                                <Textarea label="Notes" value={editForm.notes} onChange={v=>setEditForm(f=>({...f,notes:v}))} rows={2} />
                            </div>
                            <div style={{ marginTop:10, display:"flex", gap:8, alignItems:"center" }}>
                                <Btn size="sm" variant="primary" onClick={saveEdit}>?? Save Zone</Btn>
                                <span style={{ fontSize:11, color:T.textMuted }}>• {selItem.points?.length || 0} points · {polygonArea(selItem.points||[]).toFixed(1)}m²</span>
                                <div style={{ flex:1 }} />
                                <Btn size="sm" variant="danger" onClick={() => { if (window.confirm("Delete this zone?")) { dispatch({ type:"DELETE_ZONE", payload:selItem.id }); setSelId(null); setSelKind(null); } }}>Delete Zone</Btn>
                            </div>
                        </>
                    ) : selKind === "slot" ? (
                        <>
                            <div style={{ display:"grid", gap:10 }}>
                                <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:8, alignItems:"end" }}>
                                    <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
                                        <label style={{ fontSize:10, fontWeight:700, color:T.textSub, letterSpacing:0.5, textTransform:"uppercase" }}>Name</label>
                                        <input value={editForm.name} onChange={e=>setEditForm(f=>({...f,name:e.target.value}))} style={{ fontFamily:"inherit", fontSize:13, color:T.text, background:T.bg, border:`1.5px solid ${T.border}`, borderRadius:T.rs, padding:"6px 10px", outline:"none", width:"100%" }} />
                                    </div>
                                    <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
                                        <label style={{ fontSize:10, fontWeight:700, color:T.textSub, letterSpacing:0.5, textTransform:"uppercase" }}>Label</label>
                                        <input value={editForm.label} onChange={e=>setEditForm(f=>({...f,label:e.target.value}))} style={{ fontFamily:"inherit", fontSize:13, color:T.text, background:T.bg, border:`1.5px solid ${T.border}`, borderRadius:T.rs, padding:"6px 10px", outline:"none", width:"100%" }} />
                                    </div>
                                </div>
                                <FormRow cols={4}>
                                    <Input label="Rows" value={editForm.row_count} onChange={e=>setEditForm(f=>({...f,row_count:e.target.value}))} type="number" min="1" max="24" />
                                    <Input label="Spacing (cm)" value={editForm.spacing_cm} onChange={e=>setEditForm(f=>({...f,spacing_cm:e.target.value}))} type="number" min="1" max="200" />
                                    <Input label="Plants" value={editForm.plant_count} onChange={e=>setEditForm(f=>({...f,plant_count:e.target.value}))} type="number" min="0" max="1000" />
                                    <Sel label="Orientation" value={editForm.orientation || "horizontal"} onChange={v=>setEditForm(f=>({...f,orientation:v}))} options={[{ value:"horizontal", label:"Horizontal" }, { value:"vertical", label:"Vertical (90°)" }]} />
                                </FormRow>
                                <Input label="Row length (m)" value={editForm.row_length_m} onChange={e=>setEditForm(f=>({...f,row_length_m:e.target.value}))} type="number" min="0.1" max="100" />
                                <Textarea label="Notes" value={editForm.notes} onChange={v=>setEditForm(f=>({...f,notes:v}))} rows={2} />
                                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                                    <Btn size="sm" variant="primary" onClick={saveEdit}>?? Save</Btn>
                                    <Btn size="sm" variant="secondary" onClick={() => dispatch({ type:"UPDATE_SLOT", payload:{ ...selItem, orientation: selItem.orientation === "vertical" ? "horizontal" : "vertical" } })}>Rotate 90?</Btn>
                                    <Btn size="sm" variant="ghost" onClick={() => openPlantsForSlot(selItem.id)}>?? Plants</Btn>
                                    <Btn size="sm" variant="danger" onClick={() => {
                                        if (window.confirm("Delete this row?")) {
                                            const childMap = new Map();
                                            slots.forEach(s => {
                                                if (!s.parent_id) return;
                                                const list = childMap.get(s.parent_id) || [];
                                                list.push(s);
                                                childMap.set(s.parent_id, list);
                                            });
                                            const descendants = [];
                                            const walk = (id) => {
                                                (childMap.get(id) || []).forEach(child => {
                                                    descendants.push(child);
                                                    walk(child.id);
                                                });
                                            };
                                            walk(selItem.id);
                                            const slotIds = [selItem.id, ...descendants.map(s => s.id)];
                                            const plantsToRemove = plants.filter(p => slotIds.includes(p.slot_id)).map(p => p.id);
                                            plantsToRemove.forEach(id => dispatch({ type:"DELETE_PLANT", payload:id }));
                                            slotIds.slice().reverse().forEach(id => dispatch({ type:"DELETE_SLOT", payload:id }));
                                            setSelId(null);
                                            setSelKind(null);
                                        }
                                    }}>Delete Row</Btn>
                                </div>
                                <div style={{ fontSize:11, color:T.textMuted }}>{Math.max(1, Math.floor(Number(selItem.row_count) || 1))} rows · {selItem.orientation === "vertical" ? "vertical" : "horizontal"}</div>
                                {renderSlotSeedPlan(selItem, { compact: true })}
                            </div>
                        </>
                    ) : (
                        <>
                            <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr", gap:8, alignItems:"end" }}>
                                <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
                                    <label style={{ fontSize:10, fontWeight:700, color:T.textSub, letterSpacing:0.5, textTransform:"uppercase" }}>Name</label>
                                    <input value={editForm.name} onChange={e=>setEditForm(f=>({...f,name:e.target.value}))} style={{ fontFamily:"inherit", fontSize:13, color:T.text, background:T.bg, border:`1.5px solid ${T.border}`, borderRadius:T.rs, padding:"6px 10px", outline:"none", width:"100%" }} />
                                </div>
                                {[["X (m)","x",0,garden.width],["Y (m)","y",0,garden.height],["W (m)","width",0.1,garden.width],["H (m)","height",0.1,garden.height]].map(([lbl,key,mn,mx]) => (
                                    <div key={key} style={{ display:"flex", flexDirection:"column", gap:3 }}>
                                        <label style={{ fontSize:10, fontWeight:700, color:T.textSub, letterSpacing:0.5, textTransform:"uppercase" }}>{lbl}</label>
                                        <input type="number" value={editForm[key]} min={mn} max={mx} step={0.1} onChange={e=>setEditForm(f=>({...f,[key]:e.target.value}))} style={{ fontFamily:"inherit", fontSize:13, color:T.text, background:T.bg, border:`1.5px solid ${T.border}`, borderRadius:T.rs, padding:"6px 8px", outline:"none", width:"100%" }} />
                                    </div>
                                ))}
                            </div>
                            {selKind === "struct" && (
                                <div style={{ marginTop:10 }}>
                                    <Sel
                                        label="Linked field"
                                        value={editForm.linked_field_id || ""}
                                        onChange={v=>setEditForm(f=>({...f, linked_field_id:v}))}
                                        options={[
                                            { value:"", label:"No link" },
                                            ...fields.filter(f=>f.garden_id===selItem.garden_id).map(f=>({ value:f.id, label:f.name })),
                                        ]}
                                    />
                                </div>
                            )}
                            {selKind === "struct" && (
                                <div style={{ display:"grid", gap:10, marginTop:10 }}>
                                    <Textarea label="Info" value={editForm.info || ""} onChange={v=>setEditForm(f=>({...f,info:v}))} rows={2} placeholder="Short description shown in details" />
                                    {MAINTENANCE_STRUCT_TYPES.has(selItem.type) && (
                                        <>
                                            <FormRow cols={2}>
                                                <Input label="Species / type" value={editForm.species || ""} onChange={v=>setEditForm(f=>({...f,species:v}))} placeholder="Beech, yew, privet..." />
                                                <Input label="Prune interval (weeks)" value={editForm.prune_interval_weeks || ""} onChange={v=>setEditForm(f=>({...f,prune_interval_weeks:v}))} type="number" min="0" max="52" />
                                            </FormRow>
                                            <Input label="Next prune date" value={editForm.next_prune_date || ""} onChange={v=>setEditForm(f=>({...f,next_prune_date:v}))} type="date" />
                                            <Textarea label="Maintenance notes" value={editForm.maintenance_notes || ""} onChange={v=>setEditForm(f=>({...f,maintenance_notes:v}))} rows={2} placeholder="Cut in late spring and after summer growth" />
                                        </>
                                    )}
                                </div>
                            )}
                            <div style={{ marginTop:10, display:"flex", gap:8, alignItems:"center" }}>
                                <Btn size="sm" variant="primary" onClick={saveEdit}>?? Save</Btn>
                                <span style={{ fontSize:11, color:T.textMuted }}>· {selItem.width}m × {selItem.height}m = {(selItem.width*selItem.height).toFixed(1)}m²</span>
                                <div style={{ flex:1 }} />
                                {selKind === "field" && <Btn size="sm" variant="danger" onClick={() => { if(window.confirm("Delete this bed?")) { dispatch({type:"DELETE_FIELD",payload:selItem.id}); setSelId(null); } }}>Delete Bed</Btn>}
                                {selKind === "struct" && <Btn size="sm" variant="danger" onClick={() => { if(window.confirm("Delete this structure?")) { dispatch({type:"DELETE_STRUCT",payload:selItem.id}); setSelId(null); } }}>Delete Structure</Btn>}
                            </div>
                        </>
                    )}
                </div>
            )}
            {(fields.length>0 || structures.length>0 || zones.length>0) && (
                <div style={{ display:"flex", gap:10, flexWrap:"wrap", padding:"10px 4px 0" }}>
                    {Object.entries(FIELD_LABEL_K).filter(([k]) => fields.some(f=>f.type===k)).map(([k,lk]) => (
                        <div key={k} style={{ display:"flex", alignItems:"center", gap:5 }}><div style={{ width:10, height:10, borderRadius:2, background:FIELD_COLORS[k], flexShrink:0 }}/><span style={{ fontSize:10, color:T.textSub }}>{LANG.en[lk]}</span></div>
                    ))}
                    {Object.entries(STRUCT_LABEL_K).filter(([k]) => structures.some(s=>s.type===k)).map(([k,lk]) => (
                        <div key={k} style={{ display:"flex", alignItems:"center", gap:5 }}><span style={{ fontSize:11 }}>{STRUCT_ICONS[k]}</span><span style={{ fontSize:10, color:T.textSub }}>{LANG.en[lk]}</span></div>
                    ))}
                    {Object.entries(ZONE_LABEL_K).filter(([k]) => zones.some(z=>z.type===k)).map(([k,lk]) => (
                        <div key={k} style={{ display:"flex", alignItems:"center", gap:5 }}><span style={{ fontSize:11 }}>{ZONE_ICONS[k]}</span><span style={{ fontSize:10, color:T.textSub }}>{LANG[lang]?.[lk] || LANG.en[lk] || k}</span></div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ----

// ----
// APP ROOT
// ----
export default function GardenGridApp() {
    const [state, dispatch] = useReducer(reducer, SEED);
    const [loggedInUid, setLoggedInUid] = useState(null);
    const initialRoute = getRouteFromHash();
    const [screen, setScreen] = useState(initialRoute.screen);
    const [routeParams, setRouteParams] = useState(initialRoute.params);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const harvestSyncRef = useRef("");
    const structureSyncRef = useRef("");
    const [booted, setBooted] = useState(false);
    const readyToSave = useRef(false);

    useEffect(() => {
        let active = true;
        (async () => {
            const [remoteState, sessionUid] = await Promise.all([loadState(), getSession()]);
            if (!active) return;
            if (remoteState) {
                dispatch({ type:"HYDRATE_STATE", payload: remoteState });
            }
            setLoggedInUid(sessionUid);
            setBooted(true);
        })();
        return () => { active = false; };
    }, []);
    useEffect(() => {
        if (!booted) return;
        // First render after boot: mark ready but don't save yet (state may still be pre-hydration SEED)
        if (!readyToSave.current) { readyToSave.current = true; return; }
        saveState(state).catch(() => {});
    }, [state, booted]);
    useEffect(() => {
        if (!booted) return;
        const uid = state.activeUserId;
        if (!uid) return;
        const stamp = `${uid}:${forUser(state.plants, uid).length}:${forUser(state.tasks, uid).filter(t => String(t.id).startsWith("harvest_")).length}`;
        if (harvestSyncRef.current === stamp) return;
        harvestSyncRef.current = stamp;
        dispatch({ type:"SYNC_HARVEST_TASKS" });
    }, [state.activeUserId, state.plants, state.tasks, booted]);
    useEffect(() => {
        if (!booted) return;
        const uid = state.activeUserId;
        if (!uid) return;
        const hedgeStamp = `${uid}:${forUser(state.structures, uid).filter(s => ["hedge","trellis","windbreak","orchard_row"].includes(s.type)).length}:${forUser(state.tasks, uid).filter(t => String(t.id).startsWith("maint_")).length}`;
        if (structureSyncRef.current === hedgeStamp) return;
        structureSyncRef.current = hedgeStamp;
        dispatch({ type:"SYNC_STRUCTURE_TASKS" });
    }, [state.activeUserId, state.structures, state.tasks, booted]);
    useEffect(() => {
        if (!booted || typeof window === "undefined") return;
        const handleHashChange = () => {
            const next = getRouteFromHash();
            setScreen(prev => (prev === next.screen ? prev : next.screen));
            setRouteParams(prev => {
                const same = JSON.stringify(prev) === JSON.stringify(next.params);
                return same ? prev : next.params;
            });
        };
        window.addEventListener("hashchange", handleHashChange);
        handleHashChange();
        return () => window.removeEventListener("hashchange", handleHashChange);
    }, [booted]);
    useEffect(() => {
        if (!booted || typeof window === "undefined") return;
        const target = formatScreenHash(screen, routeParams);
        if (window.location.hash !== target) {
            window.location.hash = target;
        }
    }, [screen, routeParams, booted]);

    // Keep activeUserId in sync with session
    useEffect(() => {
        if (loggedInUid && loggedInUid !== state.activeUserId) {
            dispatch({ type:"SET_ACTIVE_USER", payload: loggedInUid });
        }
    }, [loggedInUid]);

    const handleLogin = async (uid) => {
        setLoggedInUid(uid);
        await setSession(uid);
        setRouteParams({});
        setScreen("dashboard");
    };

    const handleLogout = async () => {
        await setSession(null);
        setLoggedInUid(null);
        dispatch({ type:"SET_ACTIVE_USER", payload: null });
        setRouteParams({});
        setScreen("dashboard");
    };

    const navigate = useCallback((s, params = {}) => {
        const next = SCREEN_NAMES.has(s) ? s : "dashboard";
        setScreen(next);
        setRouteParams(params);
        if (typeof window !== "undefined") {
            const target = formatScreenHash(next, params);
            if (window.location.hash !== target) {
                window.location.hash = target;
            }
        }
    }, []);
    const uid = loggedInUid;
    const activeUser = state.users.find(u => u.id === uid);
    const lang = activeUser?.settings?.lang || "nl";
    const t = useT(lang);
    const pendingTasks = forUser(state.tasks, uid||"").filter(t => t.status==="pending").length;
    const props = { state, dispatch, navigate, lang, routeParams };

    if (!booted) {
        return (
            <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#F5F0E8", color:T.text, fontFamily:"DM Sans, sans-serif" }}>
                        Loading MyGarden...
            </div>
        );
    }

    // Not logged in ? show login screen
    if (!loggedInUid || !activeUser) {
        return <LoginScreen state={state} dispatch={dispatch} onLogin={handleLogin}/>;
    }

    const STYLES = `
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,700;0,9..144,800;0,9..144,900;1,9..144,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
    *, *::before, *::after { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; }
    body { font-family: 'DM Sans', system-ui, sans-serif; background: #F5F0E8; color: #1A1916; }
    input, select, textarea, button { font-family: 'DM Sans', system-ui, sans-serif; }
    * { -webkit-font-smoothing: antialiased; }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: #EDE8DF; }
    ::-webkit-scrollbar-thumb { background: #C8C0B4; border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: #B0A89C; }
  `;

    return (
        <ScreenErrorBoundary key={screen} onGoDashboard={() => navigate("dashboard")} onRetry={() => navigate(screen)}>
            <>
                <style>{STYLES}</style>
                <div style={{ display:"flex", minHeight:"100vh", background:"#F5F0E8" }}>
                    <React.Suspense fallback={<div style={{ width: sidebarCollapsed ? 64 : 220, background:"linear-gradient(175deg,#1E4A08 0%,#2B5C10 60%,#3D7A1A 100%)" }} />}>
                        <Sidebar screen={screen} setScreen={navigate} pendingTasks={pendingTasks} collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} state={state} onLogout={handleLogout} t={t}/>
                    </React.Suspense>
                    <main style={{ flex:1, minHeight:"100vh", overflow:"auto" }}>
                        {screen==="dashboard"   && <DashboardScreen   {...props}/>}
                        {screen==="gardens"     && <GardensScreen     {...props}/>}
                        {screen==="editor"      && <EditorScreen      {...props} GardenEditor={GardenEditor}/>}
                        {screen==="fields"      && <FieldsScreen      {...props}/>}
                        {screen==="plants"      && <PlantsScreen      {...props}/>}
                        {screen==="tasks"       && <TasksScreen       {...props}/>}
                        {screen==="greenhouses" && <GreenhouseScreen  {...props}/>}
                        {screen==="account"     && <AccountScreen     {...props} onLogout={handleLogout}/>}
                        {screen==="settings"    && <SettingsScreen    {...props}/>}
                        {screen==="dev" && activeUser?.is_dev && <DevScreen {...props}/>}
                    </main>
                </div>
            </>
        </ScreenErrorBoundary>
    );
}






