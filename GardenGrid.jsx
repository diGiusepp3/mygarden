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
import GardenEditor from "./src/screens/GardenEditor.jsx";
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






