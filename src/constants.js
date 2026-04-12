import { T } from "./theme.js";

export const FIELD_TYPES   = ["open_field","raised_bed","greenhouse_bed","herb_bed","flower_bed","fruit_area","nursery"];
export const FIELD_LABEL_K = { open_field:"field_open", raised_bed:"field_raised", greenhouse_bed:"field_gh", herb_bed:"field_herb", flower_bed:"field_flower", fruit_area:"field_fruit", nursery:"field_nursery" };
export const FIELD_COLORS  = { open_field:"#7CB342", raised_bed:"#558B2F", greenhouse_bed:"#00838F", herb_bed:"#43A047", flower_bed:"#BA68C8", fruit_area:"#FB8C00", nursery:"#8D6E63" };

export const STRUCT_TYPES  = ["greenhouse","tunnel_greenhouse","compost_zone","water_point","shed","path","fence","animal_enclosure","wall"];
export const STRUCT_LABEL_K= { greenhouse:"struct_greenhouse", tunnel_greenhouse:"struct_tunnel", compost_zone:"struct_compost", water_point:"struct_water", shed:"struct_shed", path:"struct_path", fence:"struct_fence", animal_enclosure:"struct_animal", wall:"struct_wall" };
export const STRUCT_ICONS  = { greenhouse:"🏡", tunnel_greenhouse:"⛺", compost_zone:"♻️", water_point:"💧", shed:"🏚️", path:"🛤️", fence:"🚧", animal_enclosure:"🐓", wall:"🧱" };
export const STRUCT_FILL   = { greenhouse:"rgba(0,131,143,0.18)", tunnel_greenhouse:"rgba(0,150,136,0.18)", compost_zone:"rgba(121,85,72,0.22)", water_point:"rgba(66,165,245,0.55)", shed:"rgba(121,85,72,0.28)", path:"rgba(188,170,164,0.42)", fence:"rgba(78,52,46,0.4)", animal_enclosure:"rgba(255,183,77,0.3)", wall:"rgba(121,85,72,0.35)" };
export const STRUCT_STROKE = { greenhouse:"#00838F", tunnel_greenhouse:"#009688", compost_zone:"#795548", water_point:"#1976D2", shed:"#5D4037", path:"#8D6E63", fence:"#4E342E", animal_enclosure:"#F57C00", wall:"#5D4037" };

// Wall material options
export const WALL_MATERIALS = ["brick","stone","concrete","wood","metal","mixed"];
export const WALL_MATERIAL_LABELS = { brick:"Baksteen", stone:"Steen", concrete:"Beton", wood:"Hout", metal:"Metaal", mixed:"Gemengd" };
export const WALL_COLORS = { brick:"#B5541B", stone:"#78716C", concrete:"#9CA3AF", wood:"#92400E", metal:"#6B7280", mixed:"#78716C" };

export const ZONE_TYPES    = ["grass","path","gravel","border","mulch","shade","pond","animal","herb","flower","tree"];
export const ZONE_LABEL_K  = { grass:"zone_grass", path:"zone_path", gravel:"zone_gravel", border:"zone_border", mulch:"zone_mulch", shade:"zone_shade", pond:"zone_pond", animal:"zone_animal", herb:"zone_herb", flower:"zone_flower", tree:"zone_tree" };
export const ZONE_ICONS    = { grass:"🌿", path:"🪨", gravel:"🪵", border:"🪴", mulch:"🍂", shade:"⛱️", pond:"💧", animal:"🐓", herb:"🌱", flower:"🌸", tree:"🌳" };
export const ZONE_FILL     = { grass:"rgba(76,175,80,0.24)", path:"rgba(188,170,164,0.48)", gravel:"rgba(158,158,158,0.32)", border:"rgba(139,195,74,0.20)", mulch:"rgba(121,85,72,0.22)", shade:"rgba(96,125,139,0.18)", pond:"rgba(33,150,243,0.25)", animal:"rgba(255,183,77,0.22)", herb:"rgba(67,160,71,0.22)", flower:"rgba(186,104,200,0.20)", tree:"rgba(46,125,50,0.24)" };
export const ZONE_STROKE   = { grass:"#4CAF50", path:"#8D6E63", gravel:"#757575", border:"#7CB342", mulch:"#795548", shade:"#607D8B", pond:"#2196F3", animal:"#F57C00", herb:"#43A047", flower:"#BA68C8", tree:"#2E7D32" };

export const PLANT_STATUSES= ["planned","sown","planted","growing","harvestable","harvested","removed"];
export const STATUS_K      = { planned:"status_planned", sown:"status_sown", planted:"status_planted", growing:"status_growing", harvestable:"status_harvestable", harvested:"status_harvested", removed:"status_removed" };
export const STATUS_CFG    = { planned:{color:T.info,bg:T.infoBg}, sown:{color:"#5D4037",bg:"#EFEBE9"}, planted:{color:"#2E7D32",bg:"#E8F5E9"}, growing:{color:"#388E3C",bg:"#F1F8E9"}, harvestable:{color:T.accent,bg:T.accentBg}, harvested:{color:"#1B5E20",bg:"#E8F5E9"}, removed:{color:"#757575",bg:"#F5F5F5"} };

export const TASK_STATUS_K = { pending:"task_pending", in_progress:"task_in_progress", done:"task_done", skipped:"task_skipped" };
export const TASK_STATUS_C = { pending:{color:T.warning,bg:T.warningBg}, in_progress:{color:T.info,bg:T.infoBg}, done:{color:T.success,bg:T.successBg}, skipped:{color:T.textMuted,bg:T.surfaceAlt} };
export const TASK_TYPES    = ["sowing","planting","watering","fertilizing","pruning","harvesting","cleaning","repair","general"];
export const TASK_ICONS    = { sowing:"🌱", planting:"🌿", watering:"💧", fertilizing:"🌾", pruning:"✂️", harvesting:"🧺", cleaning:"🧹", repair:"🔧", general:"📋" };

export const CATEGORIES    = ["Vegetable","Herb","Fruit","Flower","Legume","Root","Leafy Green","Other"];
export const CAT_ICONS     = { Vegetable:"🥦", Herb:"🌿", Fruit:"🍓", Flower:"🌸", Legume:"🫘", Root:"🥕", "Leafy Green":"🥬", Other:"🌻" };
export const GARDEN_TYPES  = ["mixed","vegetable","herb","flower","fruit","greenhouse","allotment"];
export const USER_COLORS   = ["#2B5C10","#1565C0","#C4622D","#7B1FA2","#00695C","#E65100","#37474F","#AD1457"];
export const USER_AVATARS  = ["👩‍🌾","👨‍🌾","🧑‍🌾","👩‍🍳","👨‍🍳","🧑‍🍳","🌱","🍀"];
export const GH_TYPES      = ["greenhouse","tunnel_greenhouse"];

export const SLOT_TYPE_LABELS = {
    bed_row: "Row",
    bed_section: "Section",
    greenhouse_pot: "Pot",
    greenhouse_tray: "Tray",
    greenhouse_table: "Table",
    tray_cell: "Cell",
    tunnel_row: "Tunnel Row",
};
export const SLOT_TYPE_ICONS = {
    bed_row: "🪴",
    bed_section: "▦",
    greenhouse_pot: "🫙",
    greenhouse_tray: "🧺",
    greenhouse_table: "🪵",
    tray_cell: "▫️",
    tunnel_row: "🧵",
};
export const WEATHER_CODE_LABELS = {
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
export const SLOT_SEED_COLORS = ["#7AAE39", "#8BC34A", "#9CCC65", "#AED581", "#66BB6A", "#5FA043"];
