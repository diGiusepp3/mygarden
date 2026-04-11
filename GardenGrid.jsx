import React, { useState, useEffect, useReducer, useCallback, useMemo, useRef, createContext, useContext } from "react";

// ----
// THEME
// ----
import { PageShell, PageHeader, SectionPanel, PanelGroup, QuickAction, MetaBadge } from "./src/layout/PageChrome.jsx";
import { JourneyPanel, buildJourneyTrack, buildProfileJourney, buildUserQuestProgress } from "./src/layout/GardenJourney.jsx";
import { SCREEN_ROUTES, SCREEN_NAMES, getRouteFromHash, formatScreenHash } from "./src/routes.js";

class ScreenErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { error: null };
    }

    static getDerivedStateFromError(error) {
        return { error };
    }

    componentDidCatch(error, info) {
        console.error("GardenGrid screen crashed:", error, info);
    }

    render() {
        if (this.state.error) {
            return (
                <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:24, background:T.bg, color:T.text, fontFamily:"DM Sans, sans-serif" }}>
                    <Card style={{ maxWidth:720, width:"100%", padding:22 }}>
                        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                            <div style={{ fontSize:22, fontWeight:900, fontFamily:"Fraunces, serif" }}>⚠️ Screen crashed</div>
                            <div style={{ fontSize:13, color:T.textSub, lineHeight:1.6 }}>
                                The current screen failed to render. This boundary is here so the app does not disappear into a blank page.
                            </div>
                            <pre style={{ margin:0, padding:14, background:T.surfaceAlt, borderRadius:T.rs, overflow:"auto", fontSize:12, color:T.danger, whiteSpace:"pre-wrap" }}>
                                {String(this.state.error?.message || this.state.error)}
                            </pre>
                            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                                <Btn variant="primary" onClick={this.props.onGoDashboard}>Go to dashboard</Btn>
                                <Btn variant="secondary" onClick={() => { this.setState({ error: null }); this.props.onRetry?.(); }}>Retry screen</Btn>
                            </div>
                        </div>
                    </Card>
                </div>
            );
        }
        return this.props.children;
    }
}
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
// I18N
// ----
const LANG = {
    en: {
        app_subtitle:"Kitchen Garden Planner",
        nav_dashboard:"Dashboard", nav_gardens:"My Gardens", nav_editor:"Garden Editor",
        nav_fields:"Beds & Fields", nav_plants:"Plants & Crops", nav_tasks:"Tasks",
        nav_greenhouses:"Greenhouses", nav_settings:"Settings",
        save:"Save", cancel:"Cancel", delete:"Delete", edit:"Edit", add:"Add",
        back:"← Back", search:"Search…", notes:"Notes", name:"Name", type:"Type",
        width:"Width", height:"Height", position:"Position", area:"Area",
        good_morning:"Good morning!", today:"Today",
        dashboard_missions:"Garden missions",
        dashboard_world_title:"Your garden world keeps growing.",
        dashboard_world_subtitle:"Open the next chapter in your garden, step by step.",
        editor_no_garden_title:"No garden selected",
        editor_no_garden_subtitle:"Pick a garden first to shape the layout.",
        editor_no_garden_action:"Go to gardens",
        editor_summary_title:"Layout summary",
        editor_summary_subtitle:"A quick read on the garden you are shaping now.",
        editor_quick_actions:"Quick actions",
        editor_quick_actions_subtitle:"The most common editor tasks stay one click away.",
        editor_map_title:"Map workspace",
        editor_map_subtitle:"Drag, resize, and review the full layout here.",
        editor_garden_label:"Garden details",
        editor_position_hint:"Position is measured from the top-left corner.",
        editor_stats_beds:"Beds",
        editor_stats_structures:"Structures",
        editor_stats_zones:"Zones",
        editor_stats_plants:"Plants",
        editor_stats_slots:"Slots",
        editor_stats_area:"Area",
        editor_stats_unassigned:"Unassigned",
        editor_open_gardens:"Open gardens",
        editor_open_beds:"Open beds",
        editor_open_plants:"Open plants",
        editor_add_bed_hint:"Place a new bed or field in the selected garden.",
        editor_add_structure_hint:"Add a greenhouse, shed, or other structure.",
        editor_delete_row_confirm:"Delete this row? This also removes nested slots and linked plants.",
        editor_rename_row:"Rename row",
        editor_edit_row:"Edit row",
        editor_add_row:"Add row",
        editor_no_link:"No link",
        editor_short_description:"Short description shown in details",
        editor_prune_interval:"Prune interval (weeks)",
        editor_next_prune_date:"Next prune date",
        editor_maintenance_notes:"Maintenance notes",
        editor_bed_overview:"Bed overview",
        editor_bed_overview_sub:"Compact status per bed, row, and linked plants.",
        editor_clear_filter:"Clear filter",
        editor_clear_filters:"Clear filters",
        editor_no_match:"No plants match filters",
        editor_no_match_sub:"Adjust the status or category filters to see more plants.",
        editor_row_plan:"Save as row plan?",
        editor_keep_as_one:"Keep as one item",
        editor_row_plan_hint:"This can be saved as a row plan.",
        dashboard_open_garden:"Open garden",
        dashboard_next_step:"Next step",
        dashboard_attention_title:"Needs attention",
        dashboard_attention_subtitle:"focus items",
        dashboard_no_tasks_today:"No tasks planned for today. Add a quick task or pick one from your to-do list.",
        dashboard_no_harvest:"No crops are harvestable yet.",
        dashboard_review_harvest:"Review harvest",
        dashboard_no_harvest_soon:"No harvest scheduled soon",
        dashboard_all_beds_planted:"All beds planted",
        dashboard_keep_beds_full:"Great job keeping beds full",
        dashboard_empty_beds:"empty beds",
        dashboard_fill_beds:"Fill them with quick crops",
        dashboard_greenhouse_spots:"greenhouse spots",
        dashboard_add_greenhouse:"Add a greenhouse",
        dashboard_check_ventilation:"Check ventilation logs",
        dashboard_create_protected:"Create a protected structure",
        dashboard_nothing_urgent:"Nothing urgent for now. Keep the steady rhythm.",
        dashboard_my_gardens:"My gardens",
        dashboard_structures:"structures",
        dashboard_create_garden_hint:"Create a garden to unlock these insights.",
        dashboard_seasonal_suggestions:"Seasonal suggestions",
        dashboard_smart_tips:"Smart tips based on your garden",
        dashboard_seo_hub:"SEO hub",
        dashboard_seo_hub_helper:"Crawlable pages for Google and AI search.",
        dashboard_next_prefix:"Next",
        dashboard_last_prefix:"Last",
        dashboard_created_prefix:"Created",
        dashboard_no_upcoming_tasks:"No upcoming tasks",
        gardens:"Gardens", beds_fields:"Beds & Fields", plant_varieties:"Plant Varieties",
        tasks_pending:"Tasks Pending", ready_to_harvest:"Ready to Harvest",
        upcoming_tasks:"📋 Upcoming Tasks", view_all:"View all →",
        maintenance:"Maintenance",
        overdue:"⚠️ Overdue", all_tasks_complete:"All tasks complete! 🎉",
        nothing_ready:"Nothing ready yet", harvest:"Harvest", mark_sown:"Mark Sown",
        variety:"Variety", category:"Category", quantity:"Quantity",
        sow_date:"Sow Date", plant_date:"Plant / Transplant Date", harvest_date:"Expected Harvest",
        add_plant:"Add Plant", add_from_library:"📚 Plant Library",
        new_garden:"New Garden", open_editor:"Open Editor", create_garden:"Create Garden",
        add_bed:"Add Bed", add_structure:"Add Structure", add_task:"Add Task",
        due_date:"Due Date", linked_to:"Linked To",
        language:"Language", data_mgmt:"Data Management",
        export_backup:"Export JSON Backup", reset_all:"Reset All Data",
        reset_confirm:"Reset ALL garden data? This cannot be undone.",
        greenhouses:"Greenhouses & Tunnels", no_greenhouses:"No greenhouses yet",
        no_gh_sub:"Add a greenhouse or tunnel structure in the Garden Editor first.",
        ventilated:"Ventilated 🌬️", closed:"Closed 🔒", ventilate:"Open Vents",
        close_vents:"Close Vents", inside_beds:"Beds inside", inside_plants:"Plants inside",
        temp:"Temperature", humidity:"Humidity %",
        switch_user:"Switch Profile", add_user:"Add Profile", your_profile:"Profile",
        create_profile:"Create Profile", profile_name:"Display Name", colour:"Colour",
        library_title:"🌱 Plant Library", library_sub:"Click a plant to pre-fill the form",
        dev_ai_dashboard:"⚡ AI Dev Dashboard",
        dev_ai_subtitle:"Ollama · gemma4:e2b / mistral",
        dev_tab_plants:"Plant generation",
        dev_tab_codex:"Codex plant types",
        dev_tab_advisor:"Garden advisor",
        dev_tab_companions:"Companions",
        dev_tab_calendar:"Sow plan",
        dev_tab_chat:"Free question",
        dev_intro:"Use Codex to create new plant varieties and save them straight into the plant library.",
        dev_category:"Category",
        dev_count:"Count",
        dev_generate:"⚡ Generate with Codex",
        dev_generate_loading:"⏳ Generating...",
        dev_varieties:"Varieties to carry over",
        dev_varieties_hint:"This list is sent along so existing varieties can be recognised and extended.",
        dev_varieties_placeholder:"Tomato, Cherry Tomato, Cluster Tomato",
        dev_presets_easy:"Easy crops",
        dev_presets_easy_text:"Focus on beginner-friendly crops with short maturity times.",
        dev_presets_pollinators:"Pollinators",
        dev_presets_pollinators_text:"Add more flower species that help pollinators and companion planting.",
        dev_presets_greenhouse:"Greenhouse",
        dev_presets_greenhouse_text:"Create greenhouse-friendly vegetables and herbs.",
        dev_presets_autumn:"Autumn",
        dev_presets_autumn_text:"Generate hardy late-season crops for a Belgian garden.",
        dev_prompt:"Codex prompt",
        dev_prompt_placeholder:"Describe which new plant varieties you want to create.",
        dev_prompt_hint:"The clearer the prompt, the better the plant types become.",
        dev_library_title:"Existing library",
        dev_library_loading:"Library loading...",
        dev_library_found:"plants found",
        dev_library_search:"Search",
        dev_library_search_placeholder:"Search plant or variety...",
        dev_library_none:"No description.",
        dev_library_saved:"new",
        dev_library_updated:"updated",
        dev_category_vegetable:"Vegetable",
        dev_category_leafy_green:"Leafy Green",
        dev_category_herb:"Herb",
        dev_category_fruit:"Fruit",
        dev_category_legume:"Legume",
        dev_category_root:"Root",
        dev_category_flower:"Flower",
        dev_category_ornamental:"Ornamental",
        dev_category_balcony:"Balcony",
        dev_category_container:"Container",
        dev_category_perennial:"Perennial",
        dev_category_shrub:"Shrub",
        dev_category_tree:"Tree",
        dev_category_climber:"Climber",
        dev_category_other:"Other",
        garden_type_mixed:"Mixed garden",
        garden_type_vegetable:"Vegetable garden",
        garden_type_ornamental:"Ornamental garden",
        garden_type_balcony:"Balcony garden",
        garden_type_container:"Container garden",
        garden_type_herb:"Herb garden",
        garden_type_flower:"Flower garden",
        garden_type_fruit:"Fruit garden",
        garden_type_greenhouse:"Greenhouse",
        garden_type_allotment:"Allotment",
        garden_type_patio:"Patio garden",
        garden_type_roof_terrace:"Roof terrace",
        garden_type_wildlife:"Wildlife garden",
        all:"All", all_categories:"All Categories", all_statuses:"All Statuses",
        beds_total:"beds total", no_beds:"No beds yet", no_plants:"No plants yet",
        no_tasks:"No tasks yet", no_gardens:"No gardens yet",
        status_planned:"Planned", status_sown:"Sown", status_planted:"Planted",
        status_growing:"Growing", status_harvestable:"Harvestable!", status_harvested:"Harvested", status_removed:"Removed",
        task_pending:"Pending", task_in_progress:"In Progress", task_done:"Done", task_reopen:"Reopen", task_skipped:"Skipped",
        field_open:"Open Field", field_raised:"Raised Bed", field_gh:"Greenhouse Bed",
        field_herb:"Herb Bed", field_flower:"Flower Bed", field_fruit:"Fruit Area", field_nursery:"Nursery",
        struct_greenhouse:"Greenhouse", struct_tunnel:"Tunnel Greenhouse", struct_compost:"Compost Zone",
        struct_water:"Water Point", struct_shed:"Shed / Storage", struct_path:"Path / Walkway",
        struct_fence:"Fence", struct_animal:"Animal Enclosure", struct_chicken_coop:"Chicken Coop", struct_chicken_run:"Chicken Run",
        struct_cold_frame:"Cold Frame", struct_raised_tunnel:"Raised Tunnel", struct_rain_barrel:"Rain Barrel",
        struct_potting_bench:"Potting Bench", struct_tool_rack:"Tool Rack", struct_insect_hotel:"Insect Hotel", struct_hedge:"Hedge",
        struct_trellis:"Trellis", struct_windbreak:"Windbreak", struct_orchard_row:"Orchard Row",
        delete_garden:"Delete garden?", delete_bed:"Delete this bed?",
        delete_plant:"Delete plant?", delete_struct:"Delete this structure?",
        select_garden:"— Select garden —", unassigned:"— Unassigned —",
        total_area:"total area", harvestable_badge:"Harvestable!", overdue_badge:"overdue!",
        all_on_track:"All on track",
        login:"Log in", logout:"Log out", register:"Create account",
        email:"Email address", password:"Password", confirm_password:"Confirm password",
        login_title:"Welcome back", login_sub:"Sign in to your MyGarden account",
        register_title:"Create account", register_sub:"Start planning your kitchen garden",
        no_account:"Don't have an account?", have_account:"Already have an account?",
        wrong_password:"Incorrect email or password.", passwords_no_match:"Passwords do not match.",
        email_taken:"That email address is already registered.",
        account:"My Account", account_sub:"Manage your profile and preferences",
        edit_profile:"Edit Profile", change_password:"Change Password",
        current_password:"Current password", new_password:"New password",
        confirm_new:"Confirm new password",
        wrong_current:"Current password is incorrect.",
        account_saved:"Changes saved!", display_name:"Display name",
        danger_zone:"Danger Zone", delete_account:"Delete account",
        delete_account_confirm:"Delete your account and ALL your garden data? This cannot be undone.",
        joined:"Member since", your_stats:"Your Stats",
        switch_account:"Switch account",
        zone_grass:"Grass", zone_path:"Path", zone_gravel:"Gravel", zone_border:"Border", zone_mulch:"Mulch", zone_shade:"Shade", zone_pond:"Pond", zone_animal:"Animal area", zone_herb:"Herb zone", zone_flower:"Flower zone", zone_tree:"Tree area",
    },
    nl: {
        app_subtitle:"Moestuinplanner",
        nav_dashboard:"Dashboard", nav_gardens:"Mijn Tuinen", nav_editor:"Tuineditor",
        nav_fields:"Bedden & Velden", nav_plants:"Planten & Gewassen", nav_tasks:"Taken",
        nav_greenhouses:"Kassen", nav_settings:"Instellingen",
        save:"Opslaan", cancel:"Annuleren", delete:"Verwijderen", edit:"Bewerken", add:"Toevoegen",
        back:"← Terug", search:"Zoeken…", notes:"Notities", name:"Naam", type:"Type",
        width:"Breedte", height:"Hoogte", position:"Positie", area:"Oppervlak",
        good_morning:"Goedemorgen!", today:"Vandaag",
        dashboard_missions:"Tuinmissies",
        dashboard_world_title:"Je tuinwereld groeit verder.",
        dashboard_world_subtitle:"Open de volgende laag van je tuin, stap voor stap.",
        editor_no_garden_title:"Geen tuin geselecteerd",
        editor_no_garden_subtitle:"Kies eerst een tuin om de indeling te maken.",
        editor_no_garden_action:"Naar tuinen",
        editor_summary_title:"Indelingsoverzicht",
        editor_summary_subtitle:"Een snelle blik op de tuin die je nu vormgeeft.",
        editor_quick_actions:"Snelle acties",
        editor_quick_actions_subtitle:"De meeste editor-taken blijven één klik verwijderd.",
        editor_map_title:"Werkruimte op de kaart",
        editor_map_subtitle:"Sleep, pas aan en bekijk hier de volledige indeling.",
        editor_garden_label:"Tuininfo",
        editor_position_hint:"Positie wordt gemeten vanaf de linkerbovenhoek.",
        editor_stats_beds:"Bedden",
        editor_stats_structures:"Structuren",
        editor_stats_zones:"Zones",
        editor_stats_plants:"Planten",
        editor_stats_slots:"Vakjes",
        editor_stats_area:"Oppervlak",
        editor_stats_unassigned:"Niet toegewezen",
        editor_open_gardens:"Tuinen openen",
        editor_open_beds:"Bedden openen",
        editor_open_plants:"Planten openen",
        editor_add_bed_hint:"Plaats een nieuw bed of veld in de gekozen tuin.",
        editor_add_structure_hint:"Voeg een serre, schuurtje of andere structuur toe.",
        editor_delete_row_confirm:"Deze rij verwijderen? Dit haalt ook geneste vakjes en gekoppelde planten weg.",
        editor_rename_row:"Rij hernoemen",
        editor_edit_row:"Rij bewerken",
        editor_add_row:"Rij toevoegen",
        editor_no_link:"Geen koppeling",
        editor_short_description:"Korte beschrijving die in details verschijnt",
        editor_prune_interval:"Snoei-interval (weken)",
        editor_next_prune_date:"Volgende snoeidatum",
        editor_maintenance_notes:"Onderhoudsnotities",
        editor_bed_overview:"Bedoverzicht",
        editor_bed_overview_sub:"Compacte status per bed, rij en gekoppelde planten.",
        editor_clear_filter:"Filter wissen",
        editor_clear_filters:"Filters wissen",
        editor_no_match:"Geen planten passen bij de filters",
        editor_no_match_sub:"Pas status of categorie aan om meer planten te zien.",
        editor_row_plan:"Opslaan als rijplan?",
        editor_keep_as_one:"Als één item bewaren",
        editor_row_plan_hint:"Dit kan als rijplan worden opgeslagen.",
        dashboard_open_garden:"Open tuin",
        dashboard_next_step:"Volgende stap",
        dashboard_attention_title:"Aandacht nodig",
        dashboard_attention_subtitle:"aandachtspunten",
        dashboard_no_tasks_today:"Geen taken gepland voor vandaag. Voeg een snelle taak toe of kies iets uit je to-do lijst.",
        dashboard_no_harvest:"Nog geen oogstbare crops.",
        dashboard_review_harvest:"Oogst bekijken",
        dashboard_no_harvest_soon:"Geen oogst gepland op korte termijn",
        dashboard_all_beds_planted:"Alle bedden beplant",
        dashboard_keep_beds_full:"Goed bezig, je bedden blijven mooi gevuld",
        dashboard_empty_beds:"lege bedden",
        dashboard_fill_beds:"Vul ze met snelle gewassen",
        dashboard_greenhouse_spots:"serreplekken",
        dashboard_add_greenhouse:"Serre toevoegen",
        dashboard_check_ventilation:"Ventilatielogs nakijken",
        dashboard_create_protected:"Maak een beschermde structuur",
        dashboard_nothing_urgent:"Voor nu niets dringend. Hou het rustige ritme aan.",
        dashboard_my_gardens:"Mijn tuinen",
        dashboard_structures:"structuren",
        dashboard_create_garden_hint:"Maak een tuin aan om deze inzichten vrij te spelen.",
        dashboard_seasonal_suggestions:"Seizoenssuggesties",
        dashboard_smart_tips:"Slimme tips op basis van jouw tuin",
        dashboard_seo_hub:"SEO-hub",
        dashboard_seo_hub_helper:"Crawlbare pagina's voor Google en AI.",
        dashboard_next_prefix:"Volgende",
        dashboard_last_prefix:"Laatste",
        dashboard_created_prefix:"Aangemaakt",
        dashboard_no_upcoming_tasks:"Geen aankomende taken",
        gardens:"Tuinen", beds_fields:"Bedden & Velden", plant_varieties:"Plantensoorten",
        tasks_pending:"Openstaande Taken", ready_to_harvest:"Oogstklaar",
        upcoming_tasks:"📋 Aankomende Taken", view_all:"Alles bekijken →",
        maintenance:"Onderhoud",
        overdue:"⚠️ Te laat", all_tasks_complete:"Alle taken klaar! 🎉",
        nothing_ready:"Nog niets klaar", harvest:"Oogsten", mark_sown:"Als gezaaid",
        variety:"Variëteit", category:"Categorie", quantity:"Aantal",
        sow_date:"Zaaidatum", plant_date:"Plant- / Verplaatsingsdatum", harvest_date:"Verwachte Oogst",
        add_plant:"Plant Toevoegen", add_from_library:"📚 Plantenbibliotheek",
        new_garden:"Nieuwe Tuin", open_editor:"Editor Openen", create_garden:"Tuin Aanmaken",
        add_bed:"Bed Toevoegen", add_structure:"Structuur Toevoegen", add_task:"Taak Toevoegen",
        due_date:"Vervaldatum", linked_to:"Gekoppeld aan",
        language:"Taal", data_mgmt:"Gegevensbeheer",
        export_backup:"JSON Back-up Exporteren", reset_all:"Alle Gegevens Wissen",
        reset_confirm:"Alle tuingegevens wissen? Dit kan niet ongedaan worden.",
        greenhouses:"Kassen & Tunnels", no_greenhouses:"Nog geen kassen",
        no_gh_sub:"Voeg eerst een kas of tunnel toe in de tuineditor.",
        ventilated:"Geventileerd 🌬️", closed:"Gesloten 🔒", ventilate:"Ventielen Openen",
        close_vents:"Ventielen Sluiten", inside_beds:"Bedden binnen", inside_plants:"Planten binnen",
        temp:"Temperatuur", humidity:"Luchtvochtigheid %",
        switch_user:"Profiel Wisselen", add_user:"Profiel Toevoegen", your_profile:"Profiel",
        create_profile:"Profiel Aanmaken", profile_name:"Weergavenaam", colour:"Kleur",
        library_title:"🌱 Plantenbibliotheek", library_sub:"Klik op een plant om het formulier in te vullen",
        dev_ai_dashboard:"⚡ AI Dev Dashboard",
        dev_ai_subtitle:"Ollama · gemma4:e2b / mistral",
        dev_tab_plants:"Planten genereren",
        dev_tab_codex:"Codex plantsoorten",
        dev_tab_advisor:"Tuinadviseur",
        dev_tab_companions:"Compagnons",
        dev_tab_calendar:"Zaaiplan",
        dev_tab_chat:"Vrije vraag",
        dev_intro:"Gebruik Codex om nieuwe plantsoorten te maken en direct in de plantenbibliotheek op te slaan.",
        dev_category:"Categorie",
        dev_count:"Aantal",
        dev_generate:"⚡ Codex genereer",
        dev_generate_loading:"⏳ Genereren...",
        dev_varieties:"Variëteiten om mee te nemen",
        dev_varieties_hint:"Deze lijst wordt meegestuurd zodat bestaande variëteiten herkend en aangevuld kunnen worden.",
        dev_varieties_placeholder:"Tomaat, kerstomaat, trostomaat",
        dev_presets_easy:"Makkelijke gewassen",
        dev_presets_easy_text:"Focus op beginner-vriendelijke gewassen met korte groeiduur.",
        dev_presets_pollinators:"Bestuivers",
        dev_presets_pollinators_text:"Voeg meer bloeiende soorten toe die bestuivers en combinatieteelt helpen.",
        dev_presets_greenhouse:"Serre",
        dev_presets_greenhouse_text:"Maak groenten en kruiden die goed zijn voor in de serre.",
        dev_presets_autumn:"Najaar",
        dev_presets_autumn_text:"Genereer sterke late gewassen voor een Belgische tuin.",
        dev_prompt:"Codex prompt",
        dev_prompt_placeholder:"Beschrijf welke nieuwe plantsoorten je wil laten maken.",
        dev_prompt_hint:"Hoe duidelijker de prompt, hoe beter de plantsoorten worden.",
        dev_library_title:"Bestaande bibliotheek",
        dev_library_loading:"Bibliotheek laden...",
        dev_library_found:"planten gevonden",
        dev_library_search:"Zoeken",
        dev_library_search_placeholder:"Zoek plant of variëteit...",
        dev_library_none:"Geen beschrijving.",
        dev_library_saved:"nieuw",
        dev_library_updated:"bijgewerkt",
        dev_category_vegetable:"Groenten",
        dev_category_leafy_green:"Bladgroen",
        dev_category_herb:"Kruiden",
        dev_category_fruit:"Fruit",
        dev_category_legume:"Peulgewassen",
        dev_category_root:"Wortelgewassen",
        dev_category_flower:"Bloemen",
        dev_category_ornamental:"Siertuin",
        dev_category_balcony:"Balkon",
        dev_category_container:"Potten",
        dev_category_perennial:"Vaste planten",
        dev_category_shrub:"Struiken",
        dev_category_tree:"Bomen",
        dev_category_climber:"Klimplanten",
        dev_category_other:"Overig",
        garden_type_mixed:"Gemengde tuin",
        garden_type_vegetable:"Moestuin",
        garden_type_ornamental:"Siertuin",
        garden_type_balcony:"Balkontuin",
        garden_type_container:"Potten en bakken",
        garden_type_herb:"Kruidentuin",
        garden_type_flower:"Bloementuin",
        garden_type_fruit:"Fruittuin",
        garden_type_greenhouse:"Serre",
        garden_type_allotment:"Volkstuin",
        garden_type_patio:"Patiotuin",
        garden_type_roof_terrace:"Daktuin",
        garden_type_wildlife:"Natuurvriendelijke tuin",
        all:"Alle", all_categories:"Alle Categorieën", all_statuses:"Alle Statussen",
        beds_total:"bedden totaal", no_beds:"Nog geen bedden", no_plants:"Nog geen planten",
        no_tasks:"Nog geen taken", no_gardens:"Nog geen tuinen",
        status_planned:"Gepland", status_sown:"Gezaaid", status_planted:"Geplant",
        status_growing:"Groeiend", status_harvestable:"Oogstbaar!", status_harvested:"Geoogst", status_removed:"Verwijderd",
        task_pending:"Openstaand", task_in_progress:"Bezig", task_done:"Klaar", task_reopen:"Opnieuw openen", task_skipped:"Overgeslagen",
        field_open:"Open Veld", field_raised:"Verhoogd Bed", field_gh:"Kasbed",
        field_herb:"Kruidenbed", field_flower:"Bloemenbed", field_fruit:"Fruitzone", field_nursery:"Kwekerij",
        struct_greenhouse:"Kas", struct_tunnel:"Tunnelkas", struct_compost:"Composthoop",
        struct_water:"Wateraansluiting", struct_shed:"Schuur", struct_path:"Pad",
        struct_fence:"Hek", struct_animal:"Dierenweide", struct_chicken_coop:"Kippenhok", struct_chicken_run:"Kippenren",
        struct_cold_frame:"Koude bak", struct_raised_tunnel:"Verhoogde tunnel", struct_rain_barrel:"Regenton",
        struct_potting_bench:"Pottafel", struct_tool_rack:"Gereedschapsrek", struct_insect_hotel:"Insectenhotel", struct_hedge:"Haag",
        struct_trellis:"Trellis", struct_windbreak:"Windscherm", struct_orchard_row:"Fruitrij",
        delete_garden:"Tuin verwijderen?", delete_bed:"Dit bed verwijderen?",
        delete_plant:"Plant verwijderen?", delete_struct:"Deze structuur verwijderen?",
        select_garden:"— Selecteer tuin —", unassigned:"— Niet toegewezen —",
        total_area:"totale oppervlakte", harvestable_badge:"Oogstbaar!", overdue_badge:"te laat!",
        all_on_track:"Alles op schema",
        login:"Inloggen", logout:"Uitloggen", register:"Account aanmaken",
        email:"E-mailadres", password:"Wachtwoord", confirm_password:"Wachtwoord bevestigen",
        login_title:"Welkom terug", login_sub:"Meld je aan bij jouw MyGarden-account",
        register_title:"Account aanmaken", register_sub:"Begin met het plannen van jouw moestuin",
        no_account:"Nog geen account?", have_account:"Al een account?",
        wrong_password:"Onjuist e-mailadres of wachtwoord.", passwords_no_match:"Wachtwoorden komen niet overeen.",
        email_taken:"Dit e-mailadres is al geregistreerd.",
        account:"Mijn Account", account_sub:"Beheer je profiel en voorkeuren",
        edit_profile:"Profiel bewerken", change_password:"Wachtwoord wijzigen",
        current_password:"Huidig wachtwoord", new_password:"Nieuw wachtwoord",
        confirm_new:"Nieuw wachtwoord bevestigen",
        wrong_current:"Huidig wachtwoord is onjuist.",
        account_saved:"Wijzigingen opgeslagen!", display_name:"Weergavenaam",
        danger_zone:"Gevarenzone", delete_account:"Account verwijderen",
        delete_account_confirm:"Je account en AL jouw tuingegevens verwijderen? Dit kan niet ongedaan worden.",
        joined:"Lid sinds", your_stats:"Jouw Statistieken",
        switch_account:"Van account wisselen",
        zone_grass:"Gras", zone_path:"Pad", zone_gravel:"Grind", zone_border:"Rand", zone_mulch:"Mulch", zone_shade:"Schaduw", zone_pond:"Vijver", zone_animal:"Dierenzone", zone_herb:"Kruidenzone", zone_flower:"Bloemenzone", zone_tree:"Bomenzone",
    },
    fr: {
        app_subtitle:"Planificateur de jardin",
        nav_dashboard:"Tableau de bord", nav_gardens:"Mes Jardins", nav_editor:"Éditeur",
        nav_fields:"Parterres & Champs", nav_plants:"Plantes & Cultures", nav_tasks:"Tâches",
        nav_greenhouses:"Serres", nav_settings:"Paramètres",
        save:"Enregistrer", cancel:"Annuler", delete:"Supprimer", edit:"Modifier", add:"Ajouter",
        back:"← Retour", search:"Rechercher…", notes:"Notes", name:"Nom", type:"Type",
        width:"Largeur", height:"Hauteur", position:"Position", area:"Surface",
        good_morning:"Bonjour !", today:"Aujourd'hui",
        dashboard_missions:"Missions du jardin",
        dashboard_world_title:"Votre univers de jardin grandit.",
        dashboard_world_subtitle:"Débloquez la suite du jardin, étape par étape.",
        editor_no_garden_title:"Aucun jardin sélectionné",
        editor_no_garden_subtitle:"Choisissez d'abord un jardin pour créer le plan.",
        editor_no_garden_action:"Aller aux jardins",
        editor_summary_title:"Aperçu du plan",
        editor_summary_subtitle:"Un regard rapide sur le jardin que vous dessinez.",
        editor_quick_actions:"Actions rapides",
        editor_quick_actions_subtitle:"Les tâches les plus courantes restent à un clic.",
        editor_map_title:"Espace carte",
        editor_map_subtitle:"Déplacez, redimensionnez et vérifiez le plan complet ici.",
        editor_garden_label:"Détails du jardin",
        editor_position_hint:"La position se mesure depuis le coin supérieur gauche.",
        editor_stats_beds:"Parterres",
        editor_stats_structures:"Structures",
        editor_stats_zones:"Zones",
        editor_stats_plants:"Plantes",
        editor_stats_slots:"Emplacements",
        editor_stats_area:"Surface",
        editor_stats_unassigned:"Non attribuées",
        editor_open_gardens:"Ouvrir les jardins",
        editor_open_beds:"Ouvrir les parterres",
        editor_open_plants:"Ouvrir les plantes",
        editor_add_bed_hint:"Ajouter un nouveau parterre ou champ dans le jardin choisi.",
        editor_add_structure_hint:"Ajouter une serre, un abri ou une autre structure.",
        editor_delete_row_confirm:"Supprimer cette rangée ? Cela supprimera aussi les emplacements imbriqués et les plantes liées.",
        editor_rename_row:"Renommer la rangée",
        editor_edit_row:"Modifier la rangée",
        editor_add_row:"Ajouter une rangée",
        editor_no_link:"Aucun lien",
        editor_short_description:"Courte description affichée dans les détails",
        editor_prune_interval:"Intervalle de taille (semaines)",
        editor_next_prune_date:"Prochaine taille",
        editor_maintenance_notes:"Notes d'entretien",
        editor_bed_overview:"Vue des parterres",
        editor_bed_overview_sub:"Statut compact par parterre, rangée et plantes liées.",
        editor_clear_filter:"Effacer le filtre",
        editor_clear_filters:"Effacer les filtres",
        editor_no_match:"Aucune plante ne correspond aux filtres",
        editor_no_match_sub:"Ajustez le statut ou la catégorie pour voir plus de plantes.",
        editor_row_plan:"Enregistrer comme plan de rangée ?",
        editor_keep_as_one:"Garder comme un seul élément",
        editor_row_plan_hint:"Cela peut être enregistré comme plan de rangée.",
        dashboard_open_garden:"Ouvrir le jardin",
        dashboard_next_step:"Étape suivante",
        dashboard_attention_title:"À surveiller",
        dashboard_attention_subtitle:"points de focus",
        dashboard_no_tasks_today:"Aucune tâche prévue pour aujourd'hui. Ajoutez une tâche rapide ou choisissez dans votre liste.",
        dashboard_no_harvest:"Aucune culture n'est encore récoltable.",
        dashboard_review_harvest:"Voir la récolte",
        dashboard_no_harvest_soon:"Aucune récolte prévue bientôt",
        dashboard_all_beds_planted:"Tous les parterres sont plantés",
        dashboard_keep_beds_full:"Bravo, vos parterres restent bien remplis",
        dashboard_empty_beds:"parterres vides",
        dashboard_fill_beds:"Remplissez-les avec des cultures rapides",
        dashboard_greenhouse_spots:"emplacements de serre",
        dashboard_add_greenhouse:"Ajouter une serre",
        dashboard_check_ventilation:"Vérifier les journaux de ventilation",
        dashboard_create_protected:"Créer une structure protégée",
        dashboard_nothing_urgent:"Rien d'urgent pour le moment. Gardez un rythme régulier.",
        dashboard_my_gardens:"Mes jardins",
        dashboard_structures:"structures",
        dashboard_create_garden_hint:"Créez un jardin pour débloquer ces informations.",
        dashboard_seasonal_suggestions:"Suggestions saisonnières",
        dashboard_smart_tips:"Conseils intelligents basés sur votre jardin",
        dashboard_seo_hub:"Centre SEO",
        dashboard_seo_hub_helper:"Pages crawlables pour Google et la recherche IA.",
        dashboard_next_prefix:"Suivant",
        dashboard_last_prefix:"Dernier",
        dashboard_created_prefix:"Créé",
        dashboard_no_upcoming_tasks:"Aucune tâche à venir",
        gardens:"Jardins", beds_fields:"Parterres & Champs", plant_varieties:"Variétés",
        tasks_pending:"Tâches en attente", ready_to_harvest:"Prêt à récolter",
        upcoming_tasks:"📋 Tâches à venir", view_all:"Voir tout →",
        maintenance:"Entretien",
        overdue:"⚠️ En retard", all_tasks_complete:"Toutes les tâches sont faites ! 🎉",
        nothing_ready:"Rien de prêt", harvest:"Récolter", mark_sown:"Marquer semé",
        variety:"Variété", category:"Catégorie", quantity:"Quantité",
        sow_date:"Date de semis", plant_date:"Date de plantation", harvest_date:"Récolte prévue",
        add_plant:"Ajouter une plante", add_from_library:"📚 Bibliothèque",
        new_garden:"Nouveau jardin", open_editor:"Ouvrir l'éditeur", create_garden:"Créer un jardin",
        add_bed:"Ajouter un parterre", add_structure:"Ajouter une structure", add_task:"Ajouter une tâche",
        due_date:"Date d'échéance", linked_to:"Lié à",
        language:"Langue", data_mgmt:"Gestion des données",
        export_backup:"Exporter en JSON", reset_all:"Réinitialiser tout",
        reset_confirm:"Réinitialiser TOUTES les données ? Cette action est irréversible.",
        greenhouses:"Serres & Tunnels", no_greenhouses:"Aucune serre",
        no_gh_sub:"Ajoutez d'abord une serre ou un tunnel dans l'éditeur de jardin.",
        ventilated:"Ventilé 🌬️", closed:"Fermé 🔒", ventilate:"Ouvrir les aérations",
        close_vents:"Fermer les aérations", inside_beds:"Parterres à l'intérieur", inside_plants:"Plantes à l'intérieur",
        temp:"Température", humidity:"Humidité %",
        switch_user:"Changer de profil", add_user:"Ajouter un profil", your_profile:"Profil",
        create_profile:"Créer un profil", profile_name:"Nom affiché", colour:"Couleur",
        library_title:"🌱 Bibliothèque de plantes", library_sub:"Cliquez sur une plante pour pré-remplir le formulaire",
        dev_ai_dashboard:"⚡ Tableau IA de dev",
        dev_ai_subtitle:"Ollama · gemma4:e2b / mistral",
        dev_tab_plants:"Générer des plantes",
        dev_tab_codex:"Types de plantes Codex",
        dev_tab_advisor:"Conseiller jardin",
        dev_tab_companions:"Compagnonnage",
        dev_tab_calendar:"Plan de semis",
        dev_tab_chat:"Question libre",
        dev_intro:"Utilisez Codex pour créer de nouvelles variétés et les enregistrer directement dans la bibliothèque de plantes.",
        dev_category:"Catégorie",
        dev_count:"Quantité",
        dev_generate:"⚡ Générer avec Codex",
        dev_generate_loading:"⏳ Génération...",
        dev_varieties:"Variétés à reprendre",
        dev_varieties_hint:"Cette liste est envoyée pour reconnaître et compléter les variétés existantes.",
        dev_varieties_placeholder:"Tomate, tomate cerise, tomate grappe",
        dev_presets_easy:"Cultures faciles",
        dev_presets_easy_text:"Concentrez-vous sur des cultures faciles pour débutants avec une maturité rapide.",
        dev_presets_pollinators:"Pollinisateurs",
        dev_presets_pollinators_text:"Ajoutez plus d'espèces florales utiles aux pollinisateurs et aux associations.",
        dev_presets_greenhouse:"Serre",
        dev_presets_greenhouse_text:"Créez des légumes et herbes adaptés à la serre.",
        dev_presets_autumn:"Automne",
        dev_presets_autumn_text:"Générez des cultures robustes de fin de saison pour un jardin belge.",
        dev_prompt:"Prompt Codex",
        dev_prompt_placeholder:"Décrivez quelles nouvelles variétés de plantes vous voulez créer.",
        dev_prompt_hint:"Plus le prompt est clair, meilleures seront les variétés générées.",
        dev_library_title:"Bibliothèque existante",
        dev_library_loading:"Chargement de la bibliothèque...",
        dev_library_found:"plantes trouvées",
        dev_library_search:"Rechercher",
        dev_library_search_placeholder:"Rechercher une plante ou une variété...",
        dev_library_none:"Aucune description.",
        dev_library_saved:"nouveau",
        dev_library_updated:"mis à jour",
        dev_category_vegetable:"Légume",
        dev_category_leafy_green:"Feuille",
        dev_category_herb:"Herbe",
        dev_category_fruit:"Fruit",
        dev_category_legume:"Légumineuse",
        dev_category_root:"Racine",
        dev_category_flower:"Fleur",
        dev_category_ornamental:"Ornementale",
        dev_category_balcony:"Balcon",
        dev_category_container:"Pot",
        dev_category_perennial:"Vivace",
        dev_category_shrub:"Arbuste",
        dev_category_tree:"Arbre",
        dev_category_climber:"Grimpante",
        dev_category_other:"Autre",
        garden_type_mixed:"Jardin mixte",
        garden_type_vegetable:"Potager",
        garden_type_ornamental:"Jardin ornemental",
        garden_type_balcony:"Jardin de balcon",
        garden_type_container:"Jardin en pot",
        garden_type_herb:"Jardin d'herbes",
        garden_type_flower:"Jardin fleuri",
        garden_type_fruit:"Verger",
        garden_type_greenhouse:"Serre",
        garden_type_allotment:"Potager collectif",
        garden_type_patio:"Jardin de patio",
        garden_type_roof_terrace:"Toit-terrasse",
        garden_type_wildlife:"Jardin nature",
        all:"Tout", all_categories:"Toutes les catégories", all_statuses:"Tous les statuts",
        beds_total:"parterres au total", no_beds:"Aucun parterre", no_plants:"Aucune plante",
        no_tasks:"Aucune tâche", no_gardens:"Aucun jardin",
        status_planned:"Planifié", status_sown:"Semé", status_planted:"Planté",
        status_growing:"En croissance", status_harvestable:"À récolter !", status_harvested:"Récolté", status_removed:"Retiré",
        task_pending:"En attente", task_in_progress:"En cours", task_done:"Terminé", task_reopen:"Rouvrir", task_skipped:"Ignoré",
        field_open:"Pleine terre", field_raised:"Carré surélevé", field_gh:"Parterre de serre",
        field_herb:"Jardin d'herbes", field_flower:"Parterre fleuri", field_fruit:"Zone fruitière", field_nursery:"Pépinière",
        struct_greenhouse:"Serre", struct_tunnel:"Tunnel serre", struct_compost:"Zone de compost",
        struct_water:"Point d'eau", struct_shed:"Abri", struct_path:"Allée",
        struct_fence:"Clôture", struct_animal:"Enclos animal", struct_chicken_coop:"Poulailler", struct_chicken_run:"Parc à poules",
        struct_cold_frame:"Châssis froid", struct_raised_tunnel:"Tunnel surélevé", struct_rain_barrel:"Tonneau de pluie",
        struct_potting_bench:"Table de rempotage", struct_tool_rack:"Râtelier à outils", struct_insect_hotel:"Hôtel à insectes", struct_hedge:"Haie",
        struct_trellis:"Trellis", struct_windbreak:"Brise-vent", struct_orchard_row:"Rangée fruitière",
        delete_garden:"Supprimer ce jardin ?", delete_bed:"Supprimer ce parterre ?",
        delete_plant:"Supprimer cette plante ?", delete_struct:"Supprimer cette structure ?",
        select_garden:"— Sélectionner un jardin —", unassigned:"— Non assigné —",
        total_area:"surface totale", harvestable_badge:"À récolter !", overdue_badge:"en retard !",
        all_on_track:"Tout est dans les temps",
        login:"Se connecter", logout:"Se déconnecter", register:"Créer un compte",
        email:"Adresse e-mail", password:"Mot de passe", confirm_password:"Confirmer le mot de passe",
        login_title:"Bon retour !", login_sub:"Connectez-vous à votre compte MyGarden",
        register_title:"Créer un compte", register_sub:"Commencez à planifier votre jardin",
        no_account:"Pas encore de compte ?", have_account:"Déjà un compte ?",
        wrong_password:"E-mail ou mot de passe incorrect.", passwords_no_match:"Les mots de passe ne correspondent pas.",
        email_taken:"Cette adresse e-mail est déjà utilisée.",
        account:"Mon Compte", account_sub:"Gérer votre profil et vos préférences",
        edit_profile:"Modifier le profil", change_password:"Changer le mot de passe",
        current_password:"Mot de passe actuel", new_password:"Nouveau mot de passe",
        confirm_new:"Confirmer le nouveau mot de passe",
        wrong_current:"Mot de passe actuel incorrect.",
        account_saved:"Modifications enregistrées !", display_name:"Nom affiché",
        danger_zone:"Zone de danger", delete_account:"Supprimer le compte",
        delete_account_confirm:"Supprimer votre compte et TOUTES vos données ? Cette action est irréversible.",
        joined:"Membre depuis", your_stats:"Vos Statistiques",
        switch_account:"Changer de compte",
        zone_grass:"Gazon", zone_path:"Chemin", zone_gravel:"Gravier", zone_border:"Bordure", zone_mulch:"Paillis", zone_shade:"Ombre", zone_pond:"Bassin", zone_animal:"Zone animale", zone_herb:"Zone d'herbes", zone_flower:"Zone de fleurs", zone_tree:"Zone d'arbres",
    },
    de: {
        app_subtitle:"Küchengarten-Planer",
        nav_dashboard:"Dashboard", nav_gardens:"Meine Gärten", nav_editor:"Garteneditor",
        nav_fields:"Beete & Felder", nav_plants:"Pflanzen & Ernte", nav_tasks:"Aufgaben",
        nav_greenhouses:"Gewächshäuser", nav_settings:"Einstellungen",
        save:"Speichern", cancel:"Abbrechen", delete:"Löschen", edit:"Bearbeiten", add:"Hinzufügen",
        back:"← Zurück", search:"Suchen…", notes:"Notizen", name:"Name", type:"Typ",
        width:"Breite", height:"Höhe", position:"Position", area:"Fläche",
        good_morning:"Guten Morgen!", today:"Heute",
        dashboard_missions:"Gartenmissionen",
        dashboard_world_title:"Deine Gartenwelt wächst weiter.",
        dashboard_world_subtitle:"Schalte Schritt für Schritt die nächste Ebene frei.",
        editor_no_garden_title:"Kein Garten ausgewählt",
        editor_no_garden_subtitle:"Wähle zuerst einen Garten, um den Plan zu gestalten.",
        editor_no_garden_action:"Zu den Gärten",
        editor_summary_title:"Planübersicht",
        editor_summary_subtitle:"Ein schneller Blick auf den Garten, den du gerade formst.",
        editor_quick_actions:"Schnellaktionen",
        editor_quick_actions_subtitle:"Die häufigsten Editor-Aufgaben bleiben einen Klick entfernt.",
        editor_map_title:"Kartenarbeitsbereich",
        editor_map_subtitle:"Verschieben, anpassen und den gesamten Plan hier prüfen.",
        editor_garden_label:"Gartendetails",
        editor_position_hint:"Die Position wird von der oberen linken Ecke gemessen.",
        editor_stats_beds:"Beete",
        editor_stats_structures:"Strukturen",
        editor_stats_zones:"Zonen",
        editor_stats_plants:"Pflanzen",
        editor_stats_slots:"Abschnitte",
        editor_stats_area:"Fläche",
        editor_stats_unassigned:"Nicht zugewiesen",
        editor_open_gardens:"Gärten öffnen",
        editor_open_beds:"Beete öffnen",
        editor_open_plants:"Pflanzen öffnen",
        editor_add_bed_hint:"Ein neues Beet oder Feld im ausgewählten Garten anlegen.",
        editor_add_structure_hint:"Ein Gewächshaus, Schuppen oder eine andere Struktur hinzufügen.",
        editor_delete_row_confirm:"Diese Reihe löschen? Dabei werden auch verschachtelte Bereiche und verknüpfte Pflanzen entfernt.",
        editor_rename_row:"Reihe umbenennen",
        editor_edit_row:"Reihe bearbeiten",
        editor_add_row:"Reihe hinzufügen",
        editor_no_link:"Kein Link",
        editor_short_description:"Kurze Beschreibung, die in den Details angezeigt wird",
        editor_prune_interval:"Schnittintervall (Wochen)",
        editor_next_prune_date:"Nächster Schnitttermin",
        editor_maintenance_notes:"Pflegenotizen",
        editor_bed_overview:"Beetübersicht",
        editor_bed_overview_sub:"Kompakter Status pro Beet, Reihe und verknüpften Pflanzen.",
        editor_clear_filter:"Filter löschen",
        editor_clear_filters:"Filter löschen",
        editor_no_match:"Keine Pflanzen passen zu den Filtern",
        editor_no_match_sub:"Passe Status oder Kategorie an, um mehr Pflanzen zu sehen.",
        editor_row_plan:"Als Reihenplan speichern?",
        editor_keep_as_one:"Als einzelnes Element behalten",
        editor_row_plan_hint:"Das kann als Reihenplan gespeichert werden.",
        dashboard_open_garden:"Garten öffnen",
        dashboard_next_step:"Nächster Schritt",
        dashboard_attention_title:"Braucht Aufmerksamkeit",
        dashboard_attention_subtitle:"Fokuspunkte",
        dashboard_no_tasks_today:"Für heute sind keine Aufgaben geplant. Füge eine schnelle Aufgabe hinzu oder nimm etwas aus deiner Liste.",
        dashboard_no_harvest:"Noch keine Ernte bereit.",
        dashboard_review_harvest:"Ernte prüfen",
        dashboard_no_harvest_soon:"Keine Ernte in Sicht",
        dashboard_all_beds_planted:"Alle Beete bepflanzt",
        dashboard_keep_beds_full:"Gut gemacht, deine Beete bleiben schön gefüllt",
        dashboard_empty_beds:"leere Beete",
        dashboard_fill_beds:"Fülle sie mit schnellen Kulturen",
        dashboard_greenhouse_spots:"Gewächshausplätze",
        dashboard_add_greenhouse:"Gewächshaus hinzufügen",
        dashboard_check_ventilation:"Belüftungsprotokolle prüfen",
        dashboard_create_protected:"Eine geschützte Struktur erstellen",
        dashboard_nothing_urgent:"Im Moment nichts Dringendes. Bleib im ruhigen Rhythmus.",
        dashboard_my_gardens:"Meine Gärten",
        dashboard_structures:"Strukturen",
        dashboard_create_garden_hint:"Erstelle einen Garten, um diese Einblicke freizuschalten.",
        dashboard_seasonal_suggestions:"Saisonale Vorschläge",
        dashboard_smart_tips:"Cleverer Rat basierend auf deinem Garten",
        dashboard_seo_hub:"SEO-Hub",
        dashboard_seo_hub_helper:"Crawlbare Seiten für Google und KI-Suche.",
        dashboard_next_prefix:"Nächste",
        dashboard_last_prefix:"Letzte",
        dashboard_created_prefix:"Erstellt",
        dashboard_no_upcoming_tasks:"Keine anstehenden Aufgaben",
        gardens:"Gärten", beds_fields:"Beete & Felder", plant_varieties:"Pflanzensorten",
        tasks_pending:"Offene Aufgaben", ready_to_harvest:"Erntebereit",
        upcoming_tasks:"📋 Anstehende Aufgaben", view_all:"Alle anzeigen →",
        maintenance:"Wartung",
        overdue:"⚠️ Überfällig", all_tasks_complete:"Alle Aufgaben erledigt! 🎉",
        nothing_ready:"Noch nichts bereit", harvest:"Ernten", mark_sown:"Als gesät markieren",
        variety:"Sorte", category:"Kategorie", quantity:"Menge",
        sow_date:"Aussaatdatum", plant_date:"Pflanzdatum", harvest_date:"Erntedatum (geplant)",
        add_plant:"Pflanze hinzufügen", add_from_library:"📚 Pflanzenbibliothek",
        new_garden:"Neuer Garten", open_editor:"Editor öffnen", create_garden:"Garten erstellen",
        add_bed:"Beet hinzufügen", add_structure:"Struktur hinzufügen", add_task:"Aufgabe hinzufügen",
        due_date:"Fälligkeitsdatum", linked_to:"Verknüpft mit",
        language:"Sprache", data_mgmt:"Datenverwaltung",
        export_backup:"JSON-Backup exportieren", reset_all:"Alle Daten zurücksetzen",
        reset_confirm:"ALLE Gartendaten zurücksetzen? Dieser Vorgang kann nicht rückgängig gemacht werden.",
        greenhouses:"Gewächshäuser & Tunnel", no_greenhouses:"Noch keine Gewächshäuser",
        no_gh_sub:"Füge zuerst ein Gewächshaus oder einen Tunnel im Garteneditor hinzu.",
        ventilated:"Belüftet 🌬️", closed:"Geschlossen 🔒", ventilate:"Lüftung öffnen",
        close_vents:"Lüftung schließen", inside_beds:"Beete drinnen", inside_plants:"Pflanzen drinnen",
        temp:"Temperatur", humidity:"Luftfeuchtigkeit %",
        switch_user:"Profil wechseln", add_user:"Profil hinzufügen", your_profile:"Profil",
        create_profile:"Profil erstellen", profile_name:"Anzeigename", colour:"Farbe",
        library_title:"🌱 Pflanzenbibliothek", library_sub:"Klicke auf eine Pflanze, um das Formular auszufüllen",
        dev_ai_dashboard:"⚡ AI-Entwicklungs-Dashboard",
        dev_ai_subtitle:"Ollama · gemma4:e2b / mistral",
        dev_tab_plants:"Pflanzen generieren",
        dev_tab_codex:"Codex-Pflanzenarten",
        dev_tab_advisor:"Gartenberater",
        dev_tab_companions:"Begleitpflanzen",
        dev_tab_calendar:"Aussaatplan",
        dev_tab_chat:"Freie Frage",
        dev_intro:"Nutze Codex, um neue Pflanzensorten zu erstellen und direkt in der Pflanzenbibliothek zu speichern.",
        dev_category:"Kategorie",
        dev_count:"Anzahl",
        dev_generate:"⚡ Mit Codex generieren",
        dev_generate_loading:"⏳ Wird generiert...",
        dev_varieties:"Mitzugebende Sorten",
        dev_varieties_hint:"Diese Liste wird mitgeschickt, damit vorhandene Sorten erkannt und ergänzt werden können.",
        dev_varieties_placeholder:"Tomate, Kirschtomate, Rispentomate",
        dev_presets_easy:"Einfache Kulturen",
        dev_presets_easy_text:"Fokussiere auf anfängerfreundliche Kulturen mit kurzer Reifezeit.",
        dev_presets_pollinators:"Bestäuber",
        dev_presets_pollinators_text:"Füge mehr Blütenarten hinzu, die Bestäuber und Mischkultur unterstützen.",
        dev_presets_greenhouse:"Gewächshaus",
        dev_presets_greenhouse_text:"Erzeuge gewächshaustaugliches Gemüse und Kräuter.",
        dev_presets_autumn:"Herbst",
        dev_presets_autumn_text:"Erzeuge robuste Spätkulturen für einen belgischen Garten.",
        dev_prompt:"Codex-Prompt",
        dev_prompt_placeholder:"Beschreibe, welche neuen Pflanzensorten du erstellen willst.",
        dev_prompt_hint:"Je klarer der Prompt, desto besser werden die Pflanzentypen.",
        dev_library_title:"Bestehende Bibliothek",
        dev_library_loading:"Bibliothek wird geladen...",
        dev_library_found:"Pflanzen gefunden",
        dev_library_search:"Suchen",
        dev_library_search_placeholder:"Pflanze oder Sorte suchen...",
        dev_library_none:"Keine Beschreibung.",
        dev_library_saved:"neu",
        dev_library_updated:"aktualisiert",
        dev_category_vegetable:"Gemüse",
        dev_category_leafy_green:"Blattgemüse",
        dev_category_herb:"Kräuter",
        dev_category_fruit:"Frucht",
        dev_category_legume:"Leguminose",
        dev_category_root:"Wurzel",
        dev_category_flower:"Blume",
        dev_category_ornamental:"Zierpflanze",
        dev_category_balcony:"Balkon",
        dev_category_container:"Topf",
        dev_category_perennial:"Staude",
        dev_category_shrub:"Strauch",
        dev_category_tree:"Baum",
        dev_category_climber:"Kletterpflanze",
        dev_category_other:"Sonstiges",
        garden_type_mixed:"Mischgarten",
        garden_type_vegetable:"Gemüsegarten",
        garden_type_ornamental:"Ziergarten",
        garden_type_balcony:"Balkongarten",
        garden_type_container:"Topfgarten",
        garden_type_herb:"Kräutergarten",
        garden_type_flower:"Blumengarten",
        garden_type_fruit:"Obstgarten",
        garden_type_greenhouse:"Gewächshaus",
        garden_type_allotment:"Schrebergarten",
        garden_type_patio:"Patio-Garten",
        garden_type_roof_terrace:"Dachterrasse",
        garden_type_wildlife:"Naturgarten",
        all:"Alle", all_categories:"Alle Kategorien", all_statuses:"Alle Status",
        beds_total:"Beete gesamt", no_beds:"Noch keine Beete", no_plants:"Noch keine Pflanzen",
        no_tasks:"Noch keine Aufgaben", no_gardens:"Noch keine Gärten",
        status_planned:"Geplant", status_sown:"Gesät", status_planted:"Gepflanzt",
        status_growing:"Wächst", status_harvestable:"Erntebereit!", status_harvested:"Geerntet", status_removed:"Entfernt",
        task_pending:"Ausstehend", task_in_progress:"In Bearbeitung", task_done:"Fertig", task_reopen:"Wieder öffnen", task_skipped:"Übersprungen",
        field_open:"Offenes Feld", field_raised:"Hochbeet", field_gh:"Gewächshausbeet",
        field_herb:"Kräuterbeet", field_flower:"Blumenbeet", field_fruit:"Obstbereich", field_nursery:"Anzucht",
        struct_greenhouse:"Gewächshaus", struct_tunnel:"Folientunnel", struct_compost:"Kompostplatz",
        struct_water:"Wasserstelle", struct_shed:"Schuppen", struct_path:"Weg",
        struct_fence:"Zaun", struct_animal:"Tiergehege", struct_chicken_coop:"Hühnerstall", struct_chicken_run:"Hühnerauslauf",
        struct_cold_frame:"Frühbeet", struct_raised_tunnel:"Hochtunnel", struct_rain_barrel:"Regentonne",
        struct_potting_bench:"Topftisch", struct_tool_rack:"Werkzeughalter", struct_insect_hotel:"Insektenhotel", struct_hedge:"Hecke",
        struct_trellis:"Rankhilfe", struct_windbreak:"Windschutz", struct_orchard_row:"Obstreihe",
        delete_garden:"Garten löschen?", delete_bed:"Dieses Beet löschen?",
        delete_plant:"Pflanze löschen?", delete_struct:"Diese Struktur löschen?",
        select_garden:"— Garten auswählen —", unassigned:"— Nicht zugewiesen —",
        total_area:"Gesamtfläche", harvestable_badge:"Erntebereit!", overdue_badge:"überfällig!",
        all_on_track:"Alles im Plan",
        login:"Anmelden", logout:"Abmelden", register:"Konto erstellen",
        email:"E-Mail-Adresse", password:"Passwort", confirm_password:"Passwort bestätigen",
        login_title:"Willkommen zurück", login_sub:"Melde dich bei deinem MyGarden-Konto an",
        register_title:"Konto erstellen", register_sub:"Fang an, deinen Garten zu planen",
        no_account:"Noch kein Konto?", have_account:"Bereits ein Konto?",
        wrong_password:"Falsche E-Mail oder falsches Passwort.", passwords_no_match:"Passwörter stimmen nicht überein.",
        email_taken:"Diese E-Mail-Adresse ist bereits registriert.",
        account:"Mein Konto", account_sub:"Profil und Einstellungen verwalten",
        edit_profile:"Profil bearbeiten", change_password:"Passwort ändern",
        current_password:"Aktuelles Passwort", new_password:"Neues Passwort",
        confirm_new:"Neues Passwort bestätigen",
        wrong_current:"Aktuelles Passwort ist falsch.",
        account_saved:"Änderungen gespeichert!", display_name:"Anzeigename",
        danger_zone:"Gefahrenzone", delete_account:"Konto löschen",
        delete_account_confirm:"Dein Konto und ALLE Gartendaten löschen? Dieser Vorgang kann nicht rückgängig gemacht werden.",
        joined:"Mitglied seit", your_stats:"Deine Statistiken",
        switch_account:"Konto wechseln",
        zone_grass:"Rasen", zone_path:"Weg", zone_gravel:"Kies", zone_border:"Rand", zone_mulch:"Mulch", zone_shade:"Schatten", zone_pond:"Teich", zone_animal:"Tierbereich", zone_herb:"Kräuterbereich", zone_flower:"Blumenbereich", zone_tree:"Baumbereich",
    },
};
const useT = (lang) => useCallback((k) => LANG[lang]?.[k] ?? LANG.en[k] ?? k, [lang]);
const LOCALE_MAP = { en:"en-GB", nl:"nl-BE", fr:"fr-BE", de:"de-DE" };

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
    greenhouse:"🏡",
    tunnel_greenhouse:"⛺",
    compost_zone:"♻️",
    water_point:"💧",
    shed:"🏚️",
    path:"🛤️",
    fence:"🚧",
    animal_enclosure:"🐓",
    chicken_coop:"🐔",
    chicken_run:"🪵",
    cold_frame:"🧊",
    raised_tunnel:"🌿",
    rain_barrel:"🛢️",
    potting_bench:"🪴",
    tool_rack:"🧰",
    insect_hotel:"🐞",
    hedge:"🌳",
    trellis:"🪜",
    windbreak:"🛡️",
    orchard_row:"🍎",
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
const ZONE_ICONS    = { grass:"🌿", path:"🪨", gravel:"🪵", border:"🪴", mulch:"🍂", shade:"⛱️", pond:"💧", animal:"🐓", herb:"🌱", flower:"🌸", tree:"🌳" };
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
const TASK_ICONS    = { sowing:"🌱", planting:"🌿", watering:"💧", fertilizing:"🌾", pruning:"✂️", harvesting:"🧺", cleaning:"🧹", repair:"🔧", general:"📋" };
// Category and garden-type buckets for the plant library and setup flows.
const CATEGORIES    = ["Vegetable","Herb","Fruit","Flower","Legume","Root","Leafy Green","Ornamental","Balcony","Container","Perennial","Shrub","Tree","Climber","Other"];
const CAT_ICONS     = { Vegetable:"🥦", Herb:"🌿", Fruit:"🍓", Flower:"🌸", Legume:"🫘", Root:"🥕", "Leafy Green":"🥬", Ornamental:"🌺", Balcony:"🪴", Container:"🪣", Perennial:"🌼", Shrub:"🌳", Tree:"🌲", Climber:"🪜", Other:"🌻" };
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
const USER_AVATARS  = ["👩‍🌾","👨‍🌾","🧑‍🌾","👩‍🍳","👨‍🍳","🧑‍🍳","🌱","🍀"];
const GH_TYPES      = ["greenhouse","tunnel_greenhouse"];
const MAINTENANCE_STRUCT_TYPES = new Set(["hedge","trellis","windbreak","orchard_row"]);

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
    { name:"Radish",       category:"Root",        varieties:["French Breakfast","Cherry Belle","Watermelon","Daikon","Black Spanish"] },
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
        { id:"u1", name:"Alex", email:"alex@gardengrid.app", password:"garden123", avatar:"👩‍🌾", color:"#2B5C10", settings:{ lang:"en" }, created_at:"2026-01-15T10:00:00.000Z" },
        { id:"u2", name:"Sam",  email:"sam@gardengrid.app",  password:"moestuin1", avatar:"👨‍🌾", color:"#1565C0", settings:{ lang:"nl" }, created_at:"2026-02-01T09:00:00.000Z" },
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
    bed_section: "▦",
    greenhouse_pot: "Pot",
    greenhouse_tray: "Tray",
    greenhouse_table: "Table",
    tray_cell: "▫️",
    tunnel_row: "🧵",
};
const SLOT_TYPE_ICONS = {
    bed_row: "🪴",
    bed_section: "▦",
    greenhouse_pot: "🫙",
    greenhouse_tray: "🧺",
    greenhouse_table: "🪵",
    tray_cell: "▫️",
    tunnel_row: "🧵",
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
    const base = `${SLOT_TYPE_ICONS[slot.type] || "▦"} ${slotBaseLabel(slot)}`;
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

// ----
// UI PRIMITIVES
// ----
function Btn({ children, variant="primary", size="md", onClick, disabled, style, icon, title }) {
    const [hov, setHov] = useState(false);
    const padding = size==="xs" ? "4px 11px" : size==="sm" ? "6px 14px" : size==="lg" ? "12px 26px" : "9px 18px";
    const base = {
        display:"inline-flex",
        alignItems:"center",
        justifyContent:"center",
        gap:icon?6:4,
        fontFamily:"inherit",
        cursor:disabled?"not-allowed":"pointer",
        border:"1px solid transparent",
        borderRadius:T.radiusLg,
        transition:"all 0.2s ease",
        outline:"none",
        opacity:disabled?0.55:1,
        fontWeight:600,
        whiteSpace:"nowrap",
        fontSize:size==="xs"?11:size==="sm"?12:size==="lg"?15:13,
        padding,
        boxShadow:disabled?"none":"0 2px 6px rgba(0,0,0,0.08)"
    };
    const variants = {
        primary:{ background:T.primary, color:"#fff", border:`1px solid ${T.primary}`, hoverBg:T.primaryHov, hoverBorder:`1px solid ${T.primary}` },
        secondary:{ background:T.surface, color:T.text, border:`1px solid ${T.borderSoft}`, hoverBg:T.surfaceAlt, hoverBorder:`1px solid ${T.borderSoft}` },
        accent:{ background:T.accent, color:"#fff", border:`1px solid ${T.accent}`, hoverBg:T.accentHov, hoverBorder:`1px solid ${T.accent}` },
        ghost:{ background:"transparent", color:T.textSub, border:`1px solid transparent`, hoverBg:"rgba(0,0,0,0.04)", hoverBorder:`1px solid transparent` },
        danger:{ background:T.danger, color:"#fff", border:`1px solid ${T.danger}`, hoverBg:"#A32020", hoverBorder:`1px solid ${T.danger}` },
        success:{ background:T.success, color:"#fff", border:`1px solid ${T.success}`, hoverBg:"#1B5E20", hoverBorder:`1px solid ${T.success}` },
        outline:{ background:"transparent", color:T.primary, border:`1px solid ${T.primary}`, hoverBg:T.primaryBg, hoverBorder:`1px solid ${T.primary}` }
    };
    const config = variants[variant] || variants.primary;
    const currentBg = hov && !disabled ? (config.hoverBg || config.background) : config.background;
    const currentBorder = hov && !disabled ? (config.hoverBorder || config.border) : config.border;
    const currentColor = config.color;
    return (
        <button
            style={{ ...base, background:currentBg, color:currentColor, border:currentBorder, ...style }}
            onClick={onClick}
            disabled={disabled}
            title={title}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
        >
            {icon && <span>{icon}</span>}
            {children}
        </button>
    );
}
function Badge({ children, color, bg, style }) {
    return (
        <span style={{
            display:"inline-flex",
            alignItems:"center",
            justifyContent:"center",
            padding:"4px 10px",
            borderRadius:999,
            fontSize:11,
            fontWeight:700,
            letterSpacing:0.3,
            color:color||T.textSub,
            background:bg||T.surfaceAlt,
            border:`1px solid ${T.borderSoft}`,
            boxShadow:"inset 0 1px 0 rgba(255,255,255,0.4)",
            whiteSpace:"nowrap",
            ...style
        }}>{children}</span>
    );
}
function ListRow({ icon, title, meta, status, actions, hint, accent, actionSlot }) {
    return (
        <div style={{
            display:"flex",
            padding:"14px 16px",
            background:T.surfaceSoft,
            border:`1px solid ${T.borderSoft}`,
            borderRadius:T.radiusLg,
            boxShadow:T.sh,
            alignItems:"center",
            gap:14,
            ...accent
        }}>
            {icon && <div style={{
                width:42,
                height:42,
                borderRadius:T.radiusLg,
                background:T.surfaceAlt,
                display:"flex",
                alignItems:"center",
                justifyContent:"center",
                fontSize:20
            }}>{icon}</div>}
            <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", alignItems:"baseline", gap:8, flexWrap:"wrap" }}>
                    <div style={{ fontSize:15, fontWeight:800, color:T.text, fontFamily:"Fraunces, serif" }}>{title}</div>
                    {meta && <div style={{ fontSize:11, color:T.textMuted }}>{meta}</div>}
                    {status && <Badge color={status.color} bg={status.bg}>{status.label}</Badge>}
                </div>
                {hint && <div style={{ fontSize:12, color:T.textSub, marginTop:4 }}>{hint}</div>}
            </div>
            {(actions || actionSlot) && (
                <div style={{ display:"flex", gap:6, flexWrap:"wrap", justifyContent:"flex-end" }}>
                    {actions && actions.map((act, idx) => <span key={idx}>{act}</span>)}
                    {actionSlot}
                </div>
            )}
        </div>
    );
}
function Input({ label, value, onChange, type="text", placeholder, required, style, min, max, step, hint, disabled=false }) {
    const [foc, setFoc] = useState(false);
    return (
        <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
            {label && <label style={{ fontSize:11, fontWeight:700, color:T.textSub, letterSpacing:0.5, textTransform:"uppercase" }}>{label}{required&&<span style={{color:T.danger}}> *</span>}</label>}
            <input type={type} value={value ?? ""} onChange={e=>onChange(e.target.value)} placeholder={placeholder} required={required} min={min} max={max} step={step} disabled={disabled}
                   style={{ fontFamily:"inherit", fontSize:13, color:T.text, background:disabled?T.surfaceAlt:T.surface, border:`1.5px solid ${foc?T.primary:T.border}`, borderRadius:T.rs, padding:"8px 11px", outline:"none", transition:"border 0.15s", cursor:disabled?"not-allowed":"auto", ...style }}
                   onFocus={() => setFoc(true)} onBlur={() => setFoc(false)} />
            {hint && <span style={{ fontSize:11, color:T.textMuted }}>{hint}</span>}
        </div>
    );
}
function Sel({ label, value, onChange, options, required, style }) {
    const [foc, setFoc] = useState(false);
    return (
        <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
            {label && <label style={{ fontSize:11, fontWeight:700, color:T.textSub, letterSpacing:0.5, textTransform:"uppercase" }}>{label}{required&&<span style={{color:T.danger}}> *</span>}</label>}
            <select value={value ?? ""} onChange={e=>onChange(e.target.value)} required={required}
                    style={{ fontFamily:"inherit", fontSize:13, color:T.text, background:T.surface, border:`1.5px solid ${foc?T.primary:T.border}`, borderRadius:T.rs, padding:"8px 30px 8px 11px", outline:"none", appearance:"none", backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%235E5955'/%3E%3C/svg%3E")`, backgroundRepeat:"no-repeat", backgroundPosition:"right 10px center", transition:"border 0.15s", ...style }}
                    onFocus={() => setFoc(true)} onBlur={() => setFoc(false)}>
                {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
            </select>
        </div>
    );
}
function Textarea({ label, value, onChange, placeholder, rows=3, hint }) {
    const [foc, setFoc] = useState(false);
    return (
        <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
            {label && <label style={{ fontSize:11, fontWeight:700, color:T.textSub, letterSpacing:0.5, textTransform:"uppercase" }}>{label}</label>}
            <textarea value={value ?? ""} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows}
                      style={{ fontFamily:"inherit", fontSize:13, color:T.text, background:T.surface, border:`1.5px solid ${foc?T.primary:T.border}`, borderRadius:T.rs, padding:"8px 11px", outline:"none", resize:"vertical", transition:"border 0.15s" }}
                      onFocus={() => setFoc(true)} onBlur={() => setFoc(false)} />
            {hint && <span style={{ fontSize:11, color:T.textMuted }}>{hint}</span>}
        </div>
    );
}
function Modal({ title, onClose, children, width=540 }) {
    return (
        <div style={{ position:"fixed", inset:0, background:"rgba(10,8,6,0.45)", backdropFilter:"blur(3px)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }} onClick={onClose}>
            <div style={{ background:T.surface, borderRadius:T.rl, width:"100%", maxWidth:width, maxHeight:"92vh", overflow:"auto", boxShadow:T.shLg }} onClick={e=>e.stopPropagation()}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 22px 16px", borderBottom:`1px solid ${T.border}`, position:"sticky", top:0, background:T.surface, zIndex:1 }}>
                    <h2 style={{ margin:0, fontSize:16, fontWeight:800, color:T.text, fontFamily:"Fraunces, serif" }}>{title}</h2>
                    <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", fontSize:18, color:T.textMuted, padding:"2px 6px", lineHeight:1, borderRadius:T.rs }}>✕</button>
                </div>
                <div style={{ padding:22 }}>{children}</div>
            </div>
        </div>
    );
}
function EmptyState({ icon="🌱", title, subtitle, action }) {
    return (
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12, padding:"60px 24px", textAlign:"center" }}>
            <div style={{ fontSize:52, filter:"saturate(0.8)" }}>{icon}</div>
            <h3 style={{ margin:0, fontSize:18, fontWeight:800, color:T.text, fontFamily:"Fraunces, serif" }}>{title}</h3>
            {subtitle && <p style={{ margin:0, fontSize:13, color:T.textMuted, maxWidth:300, lineHeight:1.6 }}>{subtitle}</p>}
            {action && <div style={{ marginTop:4 }}>{action}</div>}
        </div>
    );
}
function Card({ children, style, onClick, variant="surface" }) {
    const [hov, setHov] = useState(false);
    const backgroundMap = {
        surface: T.surface,
        soft: T.surfaceSoft,
        muted: T.surfaceMuted,
    };
    const bg = backgroundMap[variant] || T.surface;
    const borderColor = variant==="soft" || variant==="muted" ? T.borderSoft : T.border;
    return (
        <div
            onClick={onClick}
            style={{
                background:bg,
                border:`1px solid ${borderColor}`,
                borderRadius:T.radiusLg,
                boxShadow:(hov && onClick) ? T.shMd : T.sh,
                transition:"all 0.2s ease, transform 0.2s ease",
                cursor:onClick?"pointer":"default",
                transform:(hov && onClick) ? "translateY(-3px)" : "none",
                ...style
            }}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
        >
            {children}
        </div>
    );
}
function StatCard({ icon, label, value, color, sub, onClick }) {
    const [hov, setHov] = useState(false);
    return (
        <div onClick={onClick} style={{ background:T.surface, border:`1px solid ${T.border}`, borderTop:`3px solid ${color}`, borderRadius:T.r, padding:"16px 18px", cursor:onClick?"pointer":"default", boxShadow:hov&&onClick?T.shMd:T.sh, transform:hov&&onClick?"translateY(-2px)":"none", transition:"all 0.15s" }}
             onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                <span style={{ fontSize:22 }}>{icon}</span>
                <span style={{ fontSize:11, fontWeight:700, color:T.textMuted, textTransform:"uppercase", letterSpacing:0.5 }}>{label}</span>
            </div>
            <div style={{ fontSize:28, fontWeight:900, color, fontFamily:"Fraunces, serif", lineHeight:1 }}>{value}</div>
            {sub && <div style={{ fontSize:11, color:T.textMuted, marginTop:4 }}>{sub}</div>}
        </div>
    );
}
const SectionHeader = ({ title, sub }) => (
    <div style={{ display:"flex", alignItems:"baseline", gap:10, marginBottom:12 }}>
        <h2 style={{ margin:0, fontSize:16, fontWeight:800, color:T.text, fontFamily:"Fraunces, serif" }}>{title}</h2>
        {sub && <span style={{ fontSize:12, color:T.textMuted }}>{sub}</span>}
    </div>
);
const FormRow = ({ children, cols }) => <div style={{ display:"grid", gridTemplateColumns:`repeat(${cols||children?.length||2},1fr)`, gap:12 }}>{children}</div>;
const FormActions = ({ onCancel, onSave, saveLabel="Save", t }) => (
    <div style={{ display:"flex", justifyContent:"flex-end", gap:8, paddingTop:8, borderTop:`1px solid ${T.border}`, marginTop:4 }}>
        <Btn variant="secondary" onClick={onCancel}>{t?.("cancel")||"Cancel"}</Btn>
        <Btn variant="primary" onClick={onSave}>{saveLabel}</Btn>
    </div>
);
const InfoBanner = ({ children, icon="ℹ️" }) => (
    <div style={{ display:"flex", gap:8, background:T.infoBg, border:`1px solid ${T.info}22`, borderRadius:T.rs, padding:"9px 12px", fontSize:12, color:T.info, lineHeight:1.5 }}>
        <span style={{ flexShrink:0 }}>{icon}</span><span>{children}</span>
    </div>
);
const PillFilter = ({ value, active, onClick, color, bg }) => {
    const [foc, setFoc] = useState(false);
    return (
        <button onClick={onClick} style={{
            padding:"7px 15px",
            borderRadius:999,
            border:`1.5px solid ${foc?(color||T.primary):active?(color||T.primary):T.borderSoft}`,
            background:active?(bg||T.primaryBg):T.surface,
            color:active?(color||T.primary):T.textSub,
            cursor:"pointer",
            fontSize:12,
            fontWeight:700,
            fontFamily:"inherit",
            transition:`all ${T.transitionFast}`,
            whiteSpace:"nowrap",
            outline:"none",
            boxShadow:foc?`0 0 0 2px ${(color||T.primary)}33`:active?"0 2px 4px rgba(0,0,0,0.08)":"none"
        }} onFocus={() => setFoc(true)} onBlur={() => setFoc(false)}>{value}</button>
    );
};

const BED_SHAPES = [
    { v:"rect",   label:"Rechthoek", d:<rect x="2" y="4" width="20" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="2"/> },
    { v:"circle", label:"Cirkel",    d:<ellipse cx="12" cy="12" rx="10" ry="8" fill="none" stroke="currentColor" strokeWidth="2"/> },
    { v:"semi_n", label:"Halve ↑",   d:<path d="M 2 20 A 10 16 0 0 0 22 20 Z" fill="none" stroke="currentColor" strokeWidth="2"/> },
    { v:"semi_s", label:"Halve ↓",   d:<path d="M 2 4 A 10 16 0 0 1 22 4 Z" fill="none" stroke="currentColor" strokeWidth="2"/> },
    { v:"semi_e", label:"Halve →",   d:<path d="M 2 4 A 20 8 0 0 1 2 20 Z" fill="none" stroke="currentColor" strokeWidth="2"/> },
    { v:"semi_w", label:"Halve ←",   d:<path d="M 22 4 A 20 8 0 0 0 22 20 Z" fill="none" stroke="currentColor" strokeWidth="2"/> },
];
function BedShapePicker({ value, onChange }) {
    return (
        <div>
            <div style={{ fontSize:11, fontWeight:700, color:T.textSub, letterSpacing:0.5, textTransform:"uppercase", marginBottom:7 }}>Vorm</div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                {BED_SHAPES.map(opt => {
                    const active = (value||"rect") === opt.v;
                    return (
                        <button key={opt.v} title={opt.label} onClick={()=>onChange(opt.v)}
                            style={{ width:42, height:36, border:`2px solid ${active?T.primary:T.border}`, borderRadius:T.radiusSm, background:active?T.primaryBg:T.surface, cursor:"pointer", color:active?T.primary:T.textMuted, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:2, padding:2 }}>
                            <svg width="22" height="22" viewBox="0 0 24 24">{opt.d}</svg>
                            <span style={{ fontSize:8, fontFamily:"inherit", lineHeight:1 }}>{opt.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

const Sidebar = React.lazy(() => import("./src/layout/Sidebar.jsx"));
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
            if (pointInPolygon(wx, wy, z.points || [])) hits.push({ kind:"zone", item:z, label:`${ZONE_ICONS[z.type] || "🗺️"} ${z.name}` });
        });
        fields.forEach(f => {
            const ef_ = eff(f);
            if (wx >= ef_.x && wx <= ef_.x + ef_.width && wy >= ef_.y && wy <= ef_.y + ef_.height) {
                hits.push({ kind:"field", item:f, label:`🛏️ ${f.name}` });
            }
        });
        structures.forEach(s => {
            const es_ = eff(s);
            if (wx >= es_.x && wx <= es_.x + es_.width && wy >= es_.y && wy <= es_.y + es_.height) {
                hits.push({ kind:"struct", item:s, label:`${STRUCT_ICONS[s.type] || "🏗️"} ${s.name}` });
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
                        {ZONE_ICONS[zone.type] || "🗺️"} {zone.name}
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
                    📐 {garden.width}m × {garden.height}m · <span style={{ color:T.primary }}>Drag</span> to move · <span style={{ color:T.accent }}>Handles</span> to resize · Click to edit
                </span>
                <Btn size="sm" variant={zoneDraft ? "danger" : "accent"} onClick={zoneDraft ? cancelZoneDraft : beginZoneDraft}>
                    {zoneDraft ? "Cancel Zone" : "Add Zone"}
                </Btn>
                {zoneDraft && <Btn size="sm" variant="primary" onClick={finishZoneDraft} disabled={zoneDraft.points.length < 3}>Finish Zone</Btn>}
                <Btn size="sm" variant={viewMode === "3d" ? "primary" : "secondary"} onClick={() => setViewMode(v => v === "3d" ? "2d" : "3d")}>
                    {viewMode === "3d" ? "2D" : "3D"}
                </Btn>
                <Btn size="sm" variant="secondary" onClick={() => setZoom(z => Math.max(0.35, +(z-0.15).toFixed(2)))}>−</Btn>
                <span style={{ fontSize:12, color:T.textSub, minWidth:38, textAlign:"center", fontWeight:700 }}>{Math.round(zoom * fitZoom * 100)}%</span>
                <Btn size="sm" variant="secondary" onClick={() => setZoom(z => Math.min(2.5, +(z+0.15).toFixed(2)))}>+</Btn>
                <Btn size="sm" variant="ghost" onClick={() => setZoom(1)}>Reset</Btn>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"minmax(0,1fr) 280px", gap:12, alignItems:"start" }}>
                <div ref={canvasWrapRef} style={{ overflow:"auto", background:"#F2EDE4", minHeight:320, border:`1px solid ${T.border}`, borderTop:"none" }}>
                    <div style={viewMode === "3d" ? { padding:32, perspective:"1600px" } : undefined}>
                        <div style={viewMode === "3d" ? { transform:"rotateX(62deg) rotateZ(-18deg) scale(0.92)", transformOrigin:"top left", filter:"drop-shadow(0 28px 34px rgba(0,0,0,0.18))" } : undefined}>
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
                    <text x={pad+gW-6} y={pad+16} textAnchor="end" fontSize={14} fill={T.primary} fontFamily="Fraunces,serif" fontWeight={800}>N↑</text>
                    <g transform={`translate(${pad},${pad+gH+16})`}>
                        <rect x={0} y={0} width={sc} height={5} fill={T.primary} opacity={0.4} rx={2} />
                        <text x={sc/2} y={17} textAnchor="middle" fontSize={9} fill={T.textSub} fontFamily="DM Sans,sans-serif">1 metre</text>
                    </g>
                    </svg>
                        </div>
                    </div>
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
                                <Btn size="sm" variant="ghost" onClick={() => { setSelId(null); setSelKind(null); }}>✕</Btn>
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
                                                            <div style={{ fontSize:12, fontWeight:800, color:T.text }}>{STRUCT_ICONS[st.type] || "🏗️"} {st.name}</div>
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
                                                    <div style={{ fontSize:12, fontWeight:800, color:T.text }}>{ZONE_ICONS[z.type] || "🗺️"} {z.name}</div>
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
                        <span style={{ fontSize:20 }}>{selKind==="struct" ? (STRUCT_ICONS[selItem.type]||"🏗️") : selKind==="zone" ? (ZONE_ICONS[selItem.type]||"🗺️") : selKind==="slot" ? "🪴" : "🛏️"}</span>
                        <div style={{ flex:1 }}>
                            <div style={{ fontSize:13, fontWeight:700, color:T.text }}>{selItem.name}</div>
                            <div style={{ fontSize:11, color:T.textMuted }}>{selKind==="zone" ? "Polygon zone" : selKind==="slot" ? "Plantrij" : "Edit inline or type exact values"}</div>
                        </div>
                        <Btn size="sm" variant="ghost" onClick={() => { setSelId(null); setSelKind(null); }}>✕</Btn>
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
                                <Btn size="sm" variant="primary" onClick={saveEdit}>💾 Save Zone</Btn>
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
                                    <Btn size="sm" variant="primary" onClick={saveEdit}>💾 Save</Btn>
                                    <Btn size="sm" variant="secondary" onClick={() => dispatch({ type:"UPDATE_SLOT", payload:{ ...selItem, orientation: selItem.orientation === "vertical" ? "horizontal" : "vertical" } })}>Rotate 90?</Btn>
                                    <Btn size="sm" variant="ghost" onClick={() => openPlantsForSlot(selItem.id)}>🌱 Plants</Btn>
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
                                <Btn size="sm" variant="primary" onClick={saveEdit}>💾 Save</Btn>
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
// LOGIN SCREEN
// ----
function LoginScreen({ state, dispatch, onLogin }) {
    const [mode, setMode] = useState("login"); // "login" | "register"
    const [lang, setLang] = useState("nl");
    const t = useT(lang);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [confirmPw, setConfirmPw] = useState("");
    const [avatar, setAvatar] = useState("🌱");
    const [color, setColor] = useState(USER_COLORS[0]);
    const [error, setError] = useState("");
    const [shake, setShake] = useState(false);
    const onboardingJourneyBase = buildJourneyTrack({ user: null, gardens: [], fields: [], plants: [], structures: [], lang });
    const onboardingJourney = {
        ...onboardingJourneyBase,
        title: onboardingJourneyBase.headline,
        subtitle: onboardingJourneyBase.subtitle,
        progress: mode === "register" ? 12 : 0,
    };

    const doShake = () => { setShake(true); setTimeout(() => setShake(false), 500); };

    const handleLogin = () => {
        setError("");
        const user = state.users.find(u => u.email?.toLowerCase() === email.toLowerCase() && u.password === password);
        if (!user) { setError(t("wrong_password")); doShake(); return; }
        dispatch({ type:"SET_ACTIVE_USER", payload: user.id });
        setSession(user.id);
        onLogin(user.id);
    };

    const handleRegister = () => {
        setError("");
        if (!name.trim() || !email.trim() || !password) { setError("Please fill in all required fields."); doShake(); return; }
        if (password !== confirmPw) { setError(t("passwords_no_match")); doShake(); return; }
        if (state.users.find(u => u.email?.toLowerCase() === email.toLowerCase())) { setError(t("email_taken")); doShake(); return; }
        const newUser = { id:gid(), name:name.trim(), email:email.trim().toLowerCase(), password, avatar, color, settings:{ lang }, created_at:new Date().toISOString() };
        dispatch({ type:"ADD_USER", payload: newUser });
        dispatch({ type:"SET_ACTIVE_USER", payload: newUser.id });
        setSession(newUser.id);
        onLogin(newUser.id);
    };

    const LANGS = [["en","🇬🇧"],["nl","🇧🇪"],["fr","🇫🇷"],["de","🇩🇪"]];

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,700;0,9..144,800;0,9..144,900&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        html, body { margin:0; padding:0; font-family:'DM Sans',system-ui,sans-serif; background:#F5F0E8; }
        @keyframes gg-shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-6px)} 40%,80%{transform:translateX(6px)} }
        .gg-shake { animation: gg-shake 0.45s ease; }
      `}</style>
            <div style={{ minHeight:"100vh", background:`linear-gradient(160deg, #1E4A08 0%, #2B5C10 40%, #F5F0E8 100%)`, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
                <div style={{ width:"100%", maxWidth:420 }}>
                    {/* Logo */}
                    <div style={{ textAlign:"center", marginBottom:32 }}>
                        <div style={{ fontSize:56, marginBottom:8 }}>🌱</div>
                        <div style={{ fontSize:28, fontWeight:900, color:"#FFF", fontFamily:"Fraunces,serif", letterSpacing:-0.5 }}>MyGarden</div>
                        <div style={{ fontSize:13, color:"rgba(255,255,255,0.65)", marginTop:4 }}>{t("app_subtitle")}</div>
                        {/* Lang picker */}
                        <div style={{ display:"flex", gap:6, justifyContent:"center", marginTop:12 }}>
                            {LANGS.map(([code,flag]) => (
                                <button key={code} onClick={()=>setLang(code)} style={{ background:lang===code?"rgba(255,255,255,0.25)":"rgba(255,255,255,0.08)", border:`1.5px solid ${lang===code?"rgba(255,255,255,0.6)":"transparent"}`, borderRadius:T.rs, padding:"4px 10px", cursor:"pointer", fontSize:16, color:"#FFF", transition:"all 0.15s" }}>{flag}</button>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginBottom:16 }}>
            <JourneyPanel
                headerLabel={t("dashboard_missions")}
                title={onboardingJourney.title}
                subtitle={onboardingJourney.subtitle}
                progress={onboardingJourney.progress}
                steps={onboardingJourney.steps}
                tokens={onboardingJourney.tokens}
                reward={onboardingJourney.reward}
                nextStep={onboardingJourney.nextStep}
                lang={lang}
            />
                    </div>

                    {/* Card */}
                    <div className={shake?"gg-shake":""} style={{ background:T.surface, borderRadius:T.rl, padding:"28px 30px", boxShadow:T.shLg }}>
                        <h2 style={{ margin:"0 0 4px", fontSize:20, fontWeight:900, color:T.text, fontFamily:"Fraunces,serif" }}>
                            {mode==="login" ? t("login_title") : t("register_title")}
                        </h2>
                        <p style={{ margin:"0 0 20px", fontSize:13, color:T.textMuted }}>{mode==="login" ? t("login_sub") : t("register_sub")}</p>

                        {error && <div style={{ background:T.dangerBg, border:`1px solid ${T.danger}33`, borderRadius:T.rs, padding:"9px 12px", fontSize:13, color:T.danger, marginBottom:14 }}>⚠️ {error}</div>}

                        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                            {mode==="register" && (
                                <>
                                    <Input label={t("display_name")} value={name} onChange={setName} placeholder="e.g. Marie" required/>
                                    <div>
                                        <label style={{ fontSize:11, fontWeight:700, color:T.textSub, letterSpacing:0.5, textTransform:"uppercase", display:"block", marginBottom:6 }}>Avatar</label>
                                        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                                            {USER_AVATARS.map(a => <button key={a} onClick={()=>setAvatar(a)} style={{ width:36, height:36, borderRadius:T.rs, border:`2px solid ${avatar===a?T.primary:T.border}`, background:avatar===a?T.primaryBg:T.surface, fontSize:18, cursor:"pointer" }}>{a}</button>)}
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ fontSize:11, fontWeight:700, color:T.textSub, letterSpacing:0.5, textTransform:"uppercase", display:"block", marginBottom:6 }}>{t("colour")}</label>
                                        <div style={{ display:"flex", gap:6 }}>
                                            {USER_COLORS.map(c => <button key={c} onClick={()=>setColor(c)} style={{ width:26, height:26, borderRadius:99, background:c, border:`3px solid ${color===c?"#fff":"transparent"}`, outline:`2px solid ${color===c?c:"transparent"}`, cursor:"pointer" }}/>)}
                                        </div>
                                    </div>
                                </>
                            )}
                            <Input label={t("email")} value={email} onChange={setEmail} type="email" placeholder="naam@example.com" required/>
                            <Input label={t("password")} value={password} onChange={setPassword} type="password" placeholder="••••••••" required/>
                            {mode==="register" && <Input label={t("confirm_password")} value={confirmPw} onChange={setConfirmPw} type="password" placeholder="••••••••" required/>}
                        </div>

                        <Btn variant="primary" size="lg" style={{ width:"100%", marginTop:18, justifyContent:"center" }} onClick={mode==="login"?handleLogin:handleRegister}>
                            {mode==="login" ? t("login") : t("register")}
                        </Btn>

                        <div style={{ textAlign:"center", marginTop:16, fontSize:13, color:T.textMuted }}>
                            {mode==="login" ? t("no_account") : t("have_account")}{" "}
                            <button onClick={()=>{ setMode(mode==="login"?"register":"login"); setError(""); }} style={{ background:"none", border:"none", color:T.primary, fontWeight:700, cursor:"pointer", fontSize:13, fontFamily:"inherit" }}>
                                {mode==="login" ? t("register") : t("login")}
                            </button>
                        </div>
                    </div>

                    {/* Demo hint */}
                    <div style={{ textAlign:"center", marginTop:14, fontSize:12, color:"rgba(255,255,255,0.45)" }}>
                        Demo accounts: alex@gardengrid.app / garden123 &nbsp;?&nbsp; sam@gardengrid.app / moestuin1
                    </div>
                </div>
            </div>
        </>
    );
}

// ----
// ACCOUNT SCREEN
// ----
function AccountScreen({ state, dispatch, navigate, lang, onLogout }) {
    const t = useT(lang);
    const uid = state.activeUserId;
    const user = state.users.find(u => u.id === uid);
    if (!user) return null;

    const [tab, setTab] = useState("profile"); // "profile" | "password" | "stats"
    const [saved, setSaved] = useState(false);
    const showSaved = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

    // Profile form
    const [pName, setPName] = useState(user.name);
    const [pEmail, setPEmail] = useState(user.email||"");
    const [pAvatar, setPAvatar] = useState(user.avatar);
    const [pColor, setPColor] = useState(user.color);
    const [profileError, setProfileError] = useState("");

    const saveProfile = () => {
        setProfileError("");
        if (!pName.trim()) { setProfileError("Display name is required."); return; }
        const emailTaken = state.users.find(u => u.id!==uid && u.email?.toLowerCase()===pEmail.toLowerCase());
        if (pEmail && emailTaken) { setProfileError(t("email_taken")); return; }
        dispatch({ type:"UPDATE_USER", payload:{ ...user, name:pName.trim(), email:pEmail.trim(), avatar:pAvatar, color:pColor } });
        showSaved();
    };

    // Password form
    const [curPw, setCurPw] = useState("");
    const [newPw, setNewPw] = useState("");
    const [confPw, setConfPw] = useState("");
    const [pwError, setPwError] = useState("");

    const savePassword = () => {
        setPwError("");
        if (curPw !== user.password) { setPwError(t("wrong_current")); return; }
        if (newPw !== confPw) { setPwError(t("passwords_no_match")); return; }
        if (!newPw) { setPwError("New password cannot be empty."); return; }
        dispatch({ type:"UPDATE_USER", payload:{ ...user, password:newPw } });
        setCurPw(""); setNewPw(""); setConfPw("");
        showSaved();
    };

    // Stats
    const myGardens = forUser(state.gardens, uid);
    const myPlants  = forUser(state.plants, uid);
    const myTasks   = forUser(state.tasks, uid);
    const myFields  = forUser(state.fields, uid);
    const questBoard = buildUserQuestProgress({ user, gardens: myGardens, fields: myFields, structures: forUser(state.structures, uid), plants: myPlants, tasks: myTasks, lang });
    const joined    = user.created_at ? new Date(user.created_at).toLocaleDateString(LOCALE_MAP[lang]||"en-GB",{day:"numeric",month:"long",year:"numeric"}) : "—";

    const TABS = [["profile","👤",t("edit_profile")],["password","🔑",t("change_password")],["stats","📊",t("your_stats")]];
    const handleQuestStep = (step) => {
        if (step.actionKind === "confirm_email") {
            dispatch({ type:"SET_SETTING", payload:{ email_verified:true } });
            return;
        }
        if (step.route) {
            if (step.route === "gardens" && myGardens[0]) {
                dispatch({ type:"SET_ACTIVE_GARDEN", payload: myGardens[0].id });
            }
            if (step.route === "editor" && state.activeGardenId) {
                dispatch({ type:"SET_ACTIVE_GARDEN", payload: state.activeGardenId });
            }
            if (step.route === "plants" && state.activeGardenId) {
                dispatch({ type:"SET_ACTIVE_GARDEN", payload: state.activeGardenId });
            }
            navigate?.(step.route);
        }
    };

    return (
        <div style={{ padding:28, maxWidth:600, margin:"0 auto" }}>
            <JourneyPanel
                headerLabel={t("your_profile")}
                title={questBoard.headline}
                subtitle={questBoard.subtitle}
                progress={questBoard.progress}
                steps={questBoard.steps}
                tokens={questBoard.tokens}
                reward={questBoard.reward}
                nextStep={questBoard.nextStep}
                onStepAction={handleQuestStep}
                lang={lang}
                action={saved ? <Badge color={T.success} bg={T.successBg}>✓ {t("account_saved")}</Badge> : null}
            />

            <div style={{ display:"flex", alignItems:"center", gap:16, margin:"22px 0 28px" }}>
                <div style={{ width:64, height:64, borderRadius:99, background:user.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, flexShrink:0, boxShadow:T.shMd }}>{user.avatar}</div>
                <div style={{ flex:1 }}>
                    <h1 style={{ margin:0, fontSize:22, fontWeight:900, fontFamily:"Fraunces,serif", color:T.text }}>{user.name}</h1>
                    <div style={{ fontSize:13, color:T.textMuted, marginTop:2 }}>{user.email} · {t("joined")} {joined}</div>
                </div>
                <Btn variant="ghost" onClick={onLogout} icon="🚪">{t("logout")}</Btn>
            </div>

            {/* Tab bar */}
            <div style={{ display:"flex", gap:2, marginBottom:20, background:T.surfaceAlt, padding:4, borderRadius:T.r }}>
                {TABS.map(([id,icon,label]) => (
                    <button key={id} onClick={()=>setTab(id)} style={{ flex:1, padding:"9px 12px", borderRadius:T.rs, border:"none", background:tab===id?T.surface:"transparent", color:tab===id?T.text:T.textMuted, cursor:"pointer", fontFamily:"inherit", fontWeight:tab===id?700:500, fontSize:13, transition:"all 0.15s", display:"flex", alignItems:"center", justifyContent:"center", gap:6, boxShadow:tab===id?T.sh:"none" }}>
                        <span>{icon}</span><span>{label}</span>
                    </button>
                ))}
            </div>

            {/* Profile tab */}
            {tab==="profile" && (
                <Card style={{ padding:22 }}>
                    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                        {profileError && <div style={{ background:T.dangerBg, borderRadius:T.rs, padding:"9px 12px", fontSize:13, color:T.danger }}>⚠️ {profileError}</div>}
                        <Input label={t("display_name")} value={pName} onChange={setPName} required/>
                        <Input label={t("email")} value={pEmail} onChange={setPEmail} type="email"/>
                        <div>
                            <label style={{ fontSize:11, fontWeight:700, color:T.textSub, letterSpacing:0.5, textTransform:"uppercase", display:"block", marginBottom:8 }}>Avatar</label>
                            <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
                                {USER_AVATARS.map(a => <button key={a} onClick={()=>setPAvatar(a)} style={{ width:42, height:42, borderRadius:T.rs, border:`2.5px solid ${pAvatar===a?T.primary:T.border}`, background:pAvatar===a?T.primaryBg:T.surface, fontSize:22, cursor:"pointer", transition:"all 0.15s" }}>{a}</button>)}
                            </div>
                        </div>
                        <div>
                            <label style={{ fontSize:11, fontWeight:700, color:T.textSub, letterSpacing:0.5, textTransform:"uppercase", display:"block", marginBottom:8 }}>{t("colour")}</label>
                            <div style={{ display:"flex", gap:8 }}>
                                {USER_COLORS.map(c => <button key={c} onClick={()=>setPColor(c)} style={{ width:32, height:32, borderRadius:99, background:c, border:`3px solid ${pColor===c?"#fff":"transparent"}`, outline:`2.5px solid ${pColor===c?c:"transparent"}`, cursor:"pointer", transition:"all 0.15s" }}/>)}
                            </div>
                        </div>
                        {/* Preview */}
                        <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", background:T.surfaceAlt, borderRadius:T.rs }}>
                            <div style={{ width:38, height:38, borderRadius:99, background:pColor, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>{pAvatar}</div>
                            <div>
                                <div style={{ fontWeight:700, color:T.text, fontSize:14 }}>{pName||"…"}</div>
                                <div style={{ fontSize:11, color:T.textMuted }}>{pEmail||"no email"}</div>
                            </div>
                        </div>
                        <Btn variant="primary" onClick={saveProfile} icon="💾">{t("save")}</Btn>
                    </div>
                </Card>
            )}

            {/* Password tab */}
            {tab==="password" && (
                <Card style={{ padding:22 }}>
                    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                        {pwError && <div style={{ background:T.dangerBg, borderRadius:T.rs, padding:"9px 12px", fontSize:13, color:T.danger }}>⚠️ {pwError}</div>}
                        <Input label={t("current_password")} value={curPw} onChange={setCurPw} type="password" placeholder="••••••••" required/>
                        <Input label={t("new_password")} value={newPw} onChange={setNewPw} type="password" placeholder="••••••••" required/>
                        <Input label={t("confirm_new")} value={confPw} onChange={setConfPw} type="password" placeholder="••••••••" required/>
                        <div style={{ fontSize:12, color:T.textMuted, padding:"8px 12px", background:T.surfaceAlt, borderRadius:T.rs }}>
                            🔒 Wachtwoorden worden lokaal opgeslagen in je browser. MyGarden verstuurt geen gegevens naar een server.
                        </div>
                        <Btn variant="primary" onClick={savePassword} icon="🔑">{t("change_password")}</Btn>
                    </div>
                </Card>
            )}

            {/* Stats tab */}
            {tab==="stats" && (
                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                        <StatCard icon="🌿" label={t("gardens")} value={myGardens.length} color={T.primary}/>
                        <StatCard icon="🌱" label={t("plant_varieties")} value={myPlants.length} color="#388E3C"/>
                        <StatCard icon="✅" label={t("tasks_pending")} value={myTasks.filter(t2=>t2.status==="pending").length} color={T.warning}/>
                        <StatCard icon="🧺" label={t("ready_to_harvest")} value={myPlants.filter(p=>p.status==="harvestable").length} color={T.accent}/>
                    </div>
                    <Card style={{ padding:16 }}>
                        <div style={{ fontSize:12, color:T.textMuted, display:"flex", flexDirection:"column", gap:6 }}>
                            <div>📅 {t("joined")}: <strong style={{color:T.text}}>{joined}</strong></div>
                            <div>🌱 Total plants in garden: <strong style={{color:T.text}}>{myPlants.reduce((s,p)=>s+(+p.quantity||0),0)}</strong></div>
                            <div>🛏️ Total bed area: <strong style={{color:T.text}}>{forUser(state.fields,uid).reduce((s,f)=>s+f.width*f.height,0).toFixed(1)}m²</strong></div>
                            <div>✓ Tasks completed: <strong style={{color:T.success}}>{myTasks.filter(t2=>t2.status==="done").length}</strong></div>
                        </div>
                    </Card>
                    {/* Danger zone */}
                    <Card style={{ padding:16, border:`1px solid ${T.danger}44` }}>
                        <div style={{ fontSize:13, fontWeight:700, color:T.danger, marginBottom:8 }}>⚠️ {t("danger_zone")}</div>
                        <div style={{ fontSize:12, color:T.textSub, marginBottom:12 }}>{t("delete_account_confirm")}</div>
                        <Btn variant="danger" onClick={() => {
                            if (window.confirm(t("delete_account_confirm"))) {
                                // Remove this user's data
                                dispatch({ type:"DELETE_USER", payload: uid });
                                setSession(null);
                                onLogout();
                            }
                        }}>{t("delete_account")}</Btn>
                    </Card>
                </div>
            )}
        </div>
    );
}

// ----
// SCREEN: DASHBOARD
// ----
function DashboardScreen({ state, dispatch, navigate, lang }) {
    const t = useT(lang);
    const uid = state.activeUserId;
    const user = state.users.find(u => u.id === uid);
    const gardens = forUser(state.gardens, uid);
    const fields = forUser(state.fields, uid);
    const plants = forUser(state.plants, uid);
    const structures = forUser(state.structures, uid);
    const tasks = forUser(state.tasks, uid);
    const journey = buildJourneyTrack({ user, gardens, fields, plants, structures, lang });
    const pending = tasks.filter(task => task.status !== "done");
    const overdue = pending.filter(task => isOverdue(task.due_date, task.status));
    const harvestable = plants.filter(p => p.status === "harvestable");
    const todayDate = new Date(new Date().toDateString());
    const upcoming = [...pending].sort((a, b) => {
        const da = a.due_date ? new Date(a.due_date + "T00:00:00") : new Date(8640000000000000);
        const db = b.due_date ? new Date(b.due_date + "T00:00:00") : new Date(8640000000000000);
        return da - db;
    });
    const todayTasks = upcoming.filter(task => isSameDay(task.due_date, todayDate)).slice(0, 5);
    const soonTasks = upcoming.filter(task => {
        if (!task.due_date) return false;
        const diff = new Date(task.due_date + "T00:00:00") - todayDate;
        return diff > 0 && diff <= 5 * 24 * 60 * 60 * 1000;
    }).slice(0, 4);
    const emptyBeds = fields.filter(field => !plants.some(p => p.field_id === field.id));
    const nextHarvest = plants.filter(p => p.harvest_date).sort((a, b) => new Date(a.harvest_date + "T00:00:00") - new Date(b.harvest_date + "T00:00:00"))[0];
    const greenhouseCount = structures.filter(s => GH_TYPES.includes(s.type)).length;
    const totalArea = fields.reduce((sum, field) => sum + ((+field.width || 0) * (+field.height || 0)), 0).toFixed(1);
    const todayLabel = todayDate.toLocaleDateString(LOCALE_MAP[lang] || "en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    const instructionMeta = [
        <MetaBadge key="gardens" value={gardens.length} label={t("gardens")} />,
        <MetaBadge key="beds" value={fields.length} label={t("beds_fields")} />,
        <MetaBadge key="area" value={`${totalArea}m²`} label={t("total_area")} />,
        <MetaBadge key="tasks" value={pending.length} label={t("tasks_pending")} />,
    ];
    const quickActions = [
        <Btn key="tasks" variant="secondary" size="sm" onClick={() => navigate("tasks")}>{t("upcoming_tasks")}</Btn>,
        <Btn key="editor" variant="secondary" size="sm" onClick={() => navigate("editor")}>{t("nav_editor")}</Btn>,
        <Btn key="fields" variant="ghost" size="sm" onClick={() => navigate("fields")}>{t("beds_fields")}</Btn>,
        <Btn key="plants" variant="primary" size="sm" icon="+" onClick={() => navigate("plants")}>{t("add_plant")}</Btn>,
    ];
    const journeyRoute = journey.progress >= 100
        ? "gardens"
        : journey.nextStep?.key === "garden"
            ? "gardens"
            : journey.nextStep?.key === "layout"
                ? "editor"
                : "plants";
    const handleQuestStep = (step) => {
        if (step.actionKind === "confirm_email") {
            dispatch({ type:"SET_SETTING", payload:{ email_verified:true } });
            return;
        }
        if (step.route === "gardens" && gardens[0]) {
            dispatch({ type:"SET_ACTIVE_GARDEN", payload: gardens[0].id });
        }
        if ((step.route === "editor" || step.route === "plants" || step.route === "tasks" || step.route === "greenhouses") && state.activeGardenId) {
            dispatch({ type:"SET_ACTIVE_GARDEN", payload: state.activeGardenId });
        }
        navigate(step.route || "dashboard");
    };
    const attentionTasks = overdue.length > 0 ? overdue.slice(0, 4) : soonTasks;
    const renderTaskRow = (task) => {
        const statusCfg = TASK_STATUS_C[task.status] || TASK_STATUS_C.pending;
        const due = task.due_date ? fmtDate(task.due_date, lang) : t("nothing_ready");
        const linkedField = fields.find(f => f.id === task.field_id)?.name;
        const linkedStruct = structures.find(s => s.id === task.struct_id)?.name;
        const metaParts = [due, task.type];
        if (linkedField) metaParts.push(linkedField);
        if (linkedStruct) metaParts.push(linkedStruct);
        return (
            <ListRow
                key={task.id}
                icon={TASK_ICONS[task.type] || "📋"}
                title={task.title}
                meta={metaParts.join(" · ")}
                status={{ label: t(TASK_STATUS_K[task.status]) || task.status, color: statusCfg.color, bg: statusCfg.bg }}
                actions={[
                    <Btn key="done" size="xs" variant="success" onClick={() => dispatch({ type: "UPDATE_TASK", payload: { ...task, status: "done" } })}>{t("task_done")}</Btn>
                ]}
                hint={task.notes}
            />
        );
    };
    const renderHarvestRow = (plant) => {
        const bed = fields.find(f => f.id === plant.field_id);
        const struct = structures.find(s => s.id === plant.struct_id);
        return (
            <ListRow
                key={plant.id}
                icon={CAT_ICONS[plant.category] || "🌿"}
                title={`${plant.name}${plant.variety ? ` (${plant.variety})` : ""}`}
                meta={`${fmtDate(plant.harvest_date, lang)} · ${bed?.name || struct?.name || t("unassigned")}`}
                hint={plant.quantity ? `×${plant.quantity}` : undefined}
                actionSlot={<Badge color={T.textSub} bg={T.surfaceAlt}>×{plant.quantity || 1}</Badge>}
            />
        );
    };
    const renderGardenCard = (garden) => {
        const gardenFields = fields.filter(f => f.garden_id === garden.id);
        const gardenStructs = structures.filter(s => s.garden_id === garden.id);
        const gardenPlants = plants.filter(p => p.garden_id === garden.id);
        const bedCount = gardenFields.length;
        const structCount = gardenStructs.length;
        const plantCount = gardenPlants.reduce((sum, p) => sum + Math.max(1, +p.quantity || 1), 0);
        const gardenTasks = tasks.filter(t2 => t2.garden_id === garden.id);
        const nextTask = gardenTasks.filter(t2 => t2.status !== "done" && t2.due_date).sort((a, b) => new Date(a.due_date) - new Date(b.due_date))[0];
        const lastTask = gardenTasks.sort((a, b) => new Date(b.due_date || 0) - new Date(a.due_date || 0))[0];
        const activityLabel = nextTask
            ? `${t("dashboard_next_prefix")}: ${fmtDate(nextTask.due_date, lang)} · ${nextTask.title}`
            : lastTask
                ? `${t("dashboard_last_prefix")}: ${fmtDate(lastTask.due_date, lang)} · ${lastTask.title}`
                : `${t("dashboard_created_prefix")} ${garden.created_at ? new Date(garden.created_at).toLocaleDateString() : "—"}`;
        const isGreenhouse = garden.type?.toLowerCase().includes("greenhouse");
        return (
            <div key={garden.id} style={{ background:T.surface, border:`1px solid ${T.borderSoft}`, borderRadius:T.radiusLg, padding:16, boxShadow:"0 2px 6px rgba(0,0,0,0.06)", minHeight:190, display:"flex", flexDirection:"column", gap:10 }}>
                <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:10 }}>
                    <div>
                        <div style={{ fontSize:15, fontWeight:800, color:T.text }}>{garden.name}</div>
                        <div style={{ fontSize:11, color:T.textMuted }}>{garden.width} × {garden.height}m · {t(GARDEN_TYPE_LABEL_K[garden.type] || garden.type) || garden.type}</div>
                    </div>
                    <Badge color={isGreenhouse?T.accent:T.primary} bg={isGreenhouse?T.accentBg:T.primaryBg}>{t(GARDEN_TYPE_LABEL_K[garden.type] || garden.type) || garden.type}</Badge>
                </div>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                    <Badge color={T.primary} bg={T.primaryBg}>{bedCount} {t("beds_fields").toLowerCase()}</Badge>
                    <Badge color={T.textSub} bg={T.surfaceAlt}>{structCount} {t("dashboard_structures").toLowerCase()}</Badge>
                    <Badge color={T.textSub} bg={T.surfaceAlt}>{plantCount} {t("plant_varieties").toLowerCase()}</Badge>
                </div>
                <div style={{ fontSize:12, color:T.textMuted }}>{activityLabel}</div>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:"auto" }}>
                    <Btn size="sm" variant="primary" onClick={() => { dispatch({ type: "SET_ACTIVE_GARDEN", payload: garden.id }); navigate("editor"); }}>{t("open_editor")}</Btn>
                    <Btn size="sm" variant="secondary" onClick={() => { dispatch({ type: "SET_ACTIVE_GARDEN", payload: garden.id }); navigate("fields"); }}>{t("beds_fields")}</Btn>
                    <Btn size="sm" variant="ghost" onClick={() => { dispatch({ type: "SET_ACTIVE_GARDEN", payload: garden.id }); navigate("plants"); }}>{t("plant_varieties")}</Btn>
                </div>
            </div>
        );
    };
    const suggestionItems = [
        {
            icon: "🧺",
            label: nextHarvest ? `${t("harvest")} ${nextHarvest.name}` : t("dashboard_review_harvest"),
            helper: nextHarvest ? `${t("due_date")} ${fmtDate(nextHarvest.harvest_date, lang)}` : t("dashboard_no_harvest_soon"),
            onClick: () => navigate("plants"),
        },
        {
            icon: "🪴",
            label: emptyBeds.length ? `${emptyBeds.length} ${t("dashboard_empty_beds")}` : t("dashboard_all_beds_planted"),
            helper: emptyBeds.length ? t("dashboard_fill_beds") : t("dashboard_keep_beds_full"),
            onClick: () => navigate("fields"),
        },
        {
            icon: "🌡️",
            label: greenhouseCount ? `${greenhouseCount} ${t("dashboard_greenhouse_spots")}` : t("dashboard_add_greenhouse"),
            helper: greenhouseCount ? t("dashboard_check_ventilation") : t("dashboard_create_protected"),
            onClick: () => navigate("greenhouses"),
        },
        {
            icon: "🔎",
            label: t("dashboard_seo_hub"),
            helper: t("dashboard_seo_hub_helper"),
            onClick: () => { window.location.href = "/seo/"; },
        },
    ];
    return (
        <PageShell width={1180}>
            <PageHeader
                title={`${t("good_morning")} 🌤️`}
                subtitle={todayLabel}
                meta={instructionMeta}
                actions={quickActions}
            />
            <JourneyPanel
                headerLabel={t("dashboard_missions")}
                title={journey.headline || t("dashboard_world_title")}
                subtitle={journey.subtitle || t("dashboard_world_subtitle")}
                progress={journey.progress}
                steps={journey.steps}
                tokens={journey.tokens}
                reward={journey.reward}
                nextStep={journey.nextStep}
                onStepAction={handleQuestStep}
                lang={lang}
                action={
                    <Btn size="sm" variant="primary" onClick={() => navigate(journeyRoute)}>
                        {journey.progress >= 100 ? t("dashboard_open_garden") : t("dashboard_next_step")}
                    </Btn>
                }
            />
            <PanelGroup>
                <StatCard icon="🌿" label={t("gardens")} value={gardens.length} color={T.primary} sub={`${fields.length} ${t("beds_total")}`} onClick={() => navigate("gardens")} />
                <StatCard icon="🛏️" label={t("beds_fields")} value={fields.length} color="#558B2F" sub={`${totalArea}m² ${t("total_area")}`} onClick={() => navigate("fields")} />
                <StatCard icon="🌱" label={t("plant_varieties")} value={plants.length} color="#388E3C" sub={`${plants.reduce((sum, p) => sum + (+p.quantity || 0), 0)} plants`} onClick={() => navigate("plants")} />
                <StatCard icon="✅" label={t("tasks_pending")} value={pending.length} color={overdue.length > 0 ? T.danger : T.warning} sub={overdue.length > 0 ? `${overdue.length} ${t("overdue_badge")}` : t("all_on_track")} onClick={() => navigate("tasks")} />
                {harvestable.length > 0 && (
                    <StatCard icon="🧺" label={t("ready_to_harvest")} value={harvestable.length} color={T.accent} sub={t("harvestable_badge")} onClick={() => navigate("plants")} />
                )}
            </PanelGroup>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 16 }}>
                <SectionPanel title={`📅 ${t("today")}`} subtitle={`${todayTasks.length} ${t("tasks_pending").toLowerCase()}`} action={<Btn size="sm" variant="ghost" onClick={() => navigate("tasks")}>{t("view_all")}</Btn>}>
                    {todayTasks.length ? todayTasks.map(renderTaskRow) : (
                        <div style={{ padding: "24px 0", fontSize: 13, color: T.textMuted, minHeight:120 }}>{t("dashboard_no_tasks_today")}</div>
                    )}
                </SectionPanel>
                <SectionPanel title={t("ready_to_harvest")} subtitle={`${harvestable.length} ${t("ready_to_harvest").toLowerCase()}`} accent={{ border: T.accent, titleColor: T.text, subColor: T.textMuted }} action={<Btn size="sm" variant="ghost" onClick={() => navigate("plants")}>{t("view_all")}</Btn>}>
                    {harvestable.length ? harvestable.slice(0, 4).map(renderHarvestRow) : (
                        <div style={{ padding: "24px 0", fontSize: 13, color: T.textMuted, minHeight:120 }}>{t("dashboard_no_harvest")}</div>
                    )}
                </SectionPanel>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 16 }}>
                <SectionPanel title={t("dashboard_attention_title")} subtitle={`${attentionTasks.length} ${t("dashboard_attention_subtitle")}`} accent={{ border: T.danger, titleColor: T.danger }} action={<Btn size="sm" variant="ghost" onClick={() => navigate("tasks")}>{t("view_all")}</Btn>}>
                    {attentionTasks.length ? attentionTasks.map(renderTaskRow) : (
                        <div style={{ padding: "24px 0", fontSize: 13, color: T.textMuted, minHeight:120 }}>{t("dashboard_nothing_urgent")}</div>
                    )}
                </SectionPanel>
                <SectionPanel title={t("dashboard_my_gardens")} subtitle={`${gardens.length} ${t("gardens").toLowerCase()}`} action={<Btn size="sm" variant="ghost" onClick={() => navigate("gardens")}>{t("view_all")}</Btn>}>
                    {gardens.length ? (
                        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:12 }}>
                            {gardens.map(renderGardenCard)}
                        </div>
                    ) : (
                        <div style={{ padding: "24px 0" }}>
                            <EmptyState icon="🌱" title={t("no_gardens")} subtitle={t("dashboard_create_garden_hint")} action={<Btn variant="primary" onClick={() => navigate("gardens")} icon="+">{t("new_garden")}</Btn>} />
                        </div>
                    )}
                </SectionPanel>
            </div>
            <SectionPanel title={t("dashboard_seasonal_suggestions")} subtitle={t("dashboard_smart_tips")} accent={{ border: T.primary, titleColor: T.text, subColor: T.textMuted }}>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {suggestionItems.map(s => (
                        <QuickAction key={s.label} icon={s.icon} label={s.label} helper={s.helper} onClick={s.onClick} />
                    ))}
                </div>
            </SectionPanel>
        </PageShell>
    );
}
// ----
// SCREEN: GARDENS
// ----
function GardensScreen({ state, dispatch, navigate, lang }) {
    const t = useT(lang);
    const uid = state.activeUserId;
    const gardens = forUser(state.gardens, uid);
    const fields  = forUser(state.fields, uid);
    const plants  = forUser(state.plants, uid);
    const structures = forUser(state.structures, uid);
    const tasks = forUser(state.tasks, uid);
    const [show, setShow] = useState(false);
    const ef = { name:"", width:"", height:"", unit:"m", type:"mixed", notes:"" };
    const [form, setForm] = useState(ef);
    const set = k => v => setForm(f=>({...f,[k]:v}));
    const create = () => {
        if (!form.name.trim()||!form.width||!form.height) return;
        dispatch({ type:"ADD_GARDEN", payload:{ id:gid(), name:form.name, width:+form.width, height:+form.height, unit:form.unit, type:form.type, notes:form.notes, created_at:new Date().toISOString() }});
        setShow(false); setForm(ef);
    };
    const totalArea = fields.reduce((sum, field) => sum + ((+field.width || 0) * (+field.height || 0)), 0).toFixed(1);
    const user = state.users.find(u => u.id === uid);
    const journey = buildJourneyTrack({ user, gardens, fields, plants, structures, lang });
    const metaBadges = [
        <MetaBadge key="beds" value={fields.length} label={t("beds_fields")} />,
        <MetaBadge key="area" value={`${totalArea}m²`} label={t("total_area")} />,
    ];
    return (
        <PageShell width={1040}>
            <PageHeader
                title={`🌿 ${t("nav_gardens")}`}
                subtitle={`${gardens.length} ${t("gardens").toLowerCase()}`}
                meta={metaBadges}
                actions={[<Btn key="new" icon="+" variant="primary" onClick={()=>setShow(true)}>{t("new_garden")}</Btn>]}
            />
            <JourneyPanel
                headerLabel={t("dashboard_missions")}
                title={journey.headline}
                subtitle={journey.subtitle}
                progress={journey.progress}
                steps={journey.steps}
                tokens={journey.tokens}
                reward={journey.reward}
                nextStep={journey.nextStep}
                lang={lang}
                action={<Btn size="sm" variant="primary" icon="+" onClick={()=>setShow(true)}>{t("create_garden")}</Btn>}
            />
            {gardens.length===0 ? (
                <SectionPanel title={t("nav_gardens")} subtitle="Start by creating your first garden" action={<Btn size="sm" icon="+" variant="primary" onClick={()=>setShow(true)}>{t("create_garden")}</Btn>}>
                    <EmptyState icon="🌱" title={t("no_gardens")} subtitle="Create your first kitchen garden and start planning." />
                </SectionPanel>
            ) : (
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:16 }}>
                    {gardens.map(g => {
                        const gf = fields.filter(f=>f.garden_id===g.id);
                        const gStructs = state.structures.filter(s=>s.garden_id===g.id);
                        const gPlants = state.plants.filter(p=>p.garden_id===g.id);
                        const gardenTasks = tasks.filter(t2 => t2.garden_id === g.id);
                        const lastTask = gardenTasks.sort((a,b) => new Date(b.due_date || 0) - new Date(a.due_date || 0))[0];
                        return (
                            <Card key={g.id} variant="muted" style={{ padding:20, minHeight:240, display:"flex", flexDirection:"column", gap:10, boxShadow:"0 2px 8px rgba(0,0,0,0.05)" }}>
                                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8 }}>
                                    <div>
                                        <div style={{ fontSize:17, fontWeight:900, color:T.text }}>{g.name}</div>
                                        <div style={{ fontSize:12, color:T.textMuted }}>{g.width}m × {g.height}m · {(g.width * g.height).toFixed(1)}m² total</div>
                                    </div>
                                    <Badge color={T.primary} bg={T.primaryBg}>{g.type}</Badge>
                                </div>
                                <div style={{ fontSize:12, color:T.textSub, lineHeight:1.5, minHeight:30 }}>
                                    {g.notes || "No extra notes yet. Capture what matters in this garden."}
                                </div>
                                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                                    <Badge color={T.primary} bg={T.primaryBg}>{gf.length} beds</Badge>
                                    <Badge color={T.textSub} bg={T.surfaceAlt}>{gStructs.length} structures</Badge>
                                    <Badge color={T.textSub} bg={T.surfaceAlt}>{gPlants.length} plants</Badge>
                                </div>
                                <div style={{ fontSize:12, color:T.textMuted }}>
                                    {lastTask ? `Next task: ${fmtDate(lastTask.due_date, lang)} · ${lastTask.title}` : "No task activity yet."}
                                </div>
                                <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginTop:"auto" }}>
                                    <Btn size="sm" variant="primary" onClick={()=>{ dispatch({type:"SET_ACTIVE_GARDEN",payload:g.id}); navigate("editor"); }}>{t("open_editor")}</Btn>
                                    <Btn size="sm" variant="secondary" onClick={()=>{ dispatch({type:"SET_ACTIVE_GARDEN",payload:g.id}); navigate("fields"); }}>{t("beds_fields")}</Btn>
                                    <Btn size="sm" variant="ghost" onClick={()=>{ dispatch({type:"SET_ACTIVE_GARDEN",payload:g.id}); navigate("plants"); }}>{t("plant_varieties")}</Btn>
                                    <Btn size="sm" variant="ghost" onClick={()=>{ dispatch({type:"SET_ACTIVE_GARDEN",payload:g.id}); navigate("settings"); }}>{t("nav_settings")}</Btn>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
            {show && (
                <Modal title={`🌿 ${t("create_garden")}`} onClose={()=>setShow(false)}>
                    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                        <Input label={t("name")} value={form.name} onChange={set("name")} placeholder="e.g. Backyard Kitchen Garden" required/>
                        <FormRow cols={3}>
                            <Input label={`${t("width")} (m)`} value={form.width} onChange={set("width")} type="number" placeholder="12" min="1" max="2000" required/>
                            <Input label={`${t("height")} (m)`} value={form.height} onChange={set("height")} type="number" placeholder="8" min="1" max="2000" required/>
                            <Sel label="Unit" value={form.unit} onChange={set("unit")} options={[{value:"m",label:"Metres"},{value:"ft",label:"Feet"}]}/>
                        </FormRow>
                        <Sel label={t("type")} value={form.type} onChange={set("type")} options={GARDEN_TYPES.map(gt=>({ value:gt, label:t(GARDEN_TYPE_LABEL_K[gt]) || gt }))}/>
                        <Textarea label={t("notes")} value={form.notes} onChange={set("notes")} rows={2}/>
                        <FormActions onCancel={()=>{ setShow(false); setForm(ef); }} onSave={create} saveLabel={t("create_garden")} t={t}/>
                    </div>
                </Modal>
            )}
        </PageShell>
    );
}

// ----
// SCREEN: GARDEN EDITOR
// ----
function EditorScreen({ state, dispatch, navigate, lang }) {
    const t = useT(lang);
    const garden = state.gardens.find(g=>g.id===state.activeGardenId);
    const [showField, setShowField] = useState(false);
    const [showStruct, setShowStruct] = useState(false);
    const ef = { name:"", type:"raised_bed", shape:"rect", x:"", y:"", width:"", height:"", notes:"" };
    const es = { name:"", type:"greenhouse", x:"", y:"", width:"", height:"", notes:"", linked_field_id:"", species:"", info:"", maintenance_notes:"", prune_interval_weeks:"", next_prune_date:"" };
    const [ff, setFf] = useState(ef); const [sf, setSf] = useState(es);
    const setF = k=>v=>setFf(f=>({...f,[k]:v}));
    const setS = k=>v=>setSf(f=>({...f,[k]:v}));
    if (!garden) {
        return (
            <PageShell width={980}>
                <EmptyState
                    icon="🗺️"
                    title={t("editor_no_garden_title")}
                    subtitle={t("editor_no_garden_subtitle")}
                    action={<Btn onClick={()=>navigate("gardens")} variant="primary">{t("editor_no_garden_action")}</Btn>}
                />
            </PageShell>
        );
    }
    const gFields   = state.fields.filter(f=>f.garden_id===garden.id);
    const gStructs  = state.structures.filter(s=>s.garden_id===garden.id);
    const gZones    = state.zones.filter(z=>z.garden_id===garden.id);
    const gPlants   = state.plants.filter(p=>p.garden_id===garden.id);
    const gSlots    = (state.slots||[]).filter(s => s.garden_id===garden.id);
    const linkedPlants = gPlants.filter(p => p.field_id || p.struct_id || p.slot_id).length;
    const unassignedPlants = Math.max(0, gPlants.length - linkedPlants);
    const gardenArea = (garden.width * garden.height).toFixed(1);
    const gardenTypeLabel = LANG[lang]?.[GARDEN_TYPE_LABEL_K[garden.type]] || garden.type;
    const posHint = `${t("editor_position_hint")} ${garden.width}m × ${garden.height}m.`;
    const summaryCards = [
        { label:t("editor_stats_beds"), value:gFields.length, helper:t("nav_fields") },
        { label:t("editor_stats_structures"), value:gStructs.length, helper:t("nav_greenhouses") },
        { label:t("editor_stats_zones"), value:gZones.length, helper:t("editor_stats_zones") },
        { label:t("editor_stats_plants"), value:gPlants.length, helper:t("nav_plants") },
        { label:t("editor_stats_slots"), value:gSlots.length, helper:t("editor_stats_slots") },
        { label:t("editor_stats_unassigned"), value:unassignedPlants, helper:t("editor_stats_plants") },
    ];
    const quickActions = [
        { icon:"🛏️", label:t("add_bed"), helper:t("editor_add_bed_hint"), onClick:()=>setShowField(true) },
        { icon:"🏡", label:t("add_structure"), helper:t("editor_add_structure_hint"), onClick:()=>setShowStruct(true) },
        { icon:"🌿", label:t("editor_open_beds"), helper:t("editor_bed_overview_sub"), onClick:()=>navigate("fields") },
        { icon:"🌱", label:t("editor_open_plants"), helper:t("editor_position_hint"), onClick:()=>navigate("plants") },
    ];
    const addField  = () => { if (!ff.name||!ff.x||!ff.y||!ff.width||!ff.height) return; dispatch({type:"ADD_FIELD",payload:{id:gid(),garden_id:garden.id,...ff,x:+ff.x,y:+ff.y,width:+ff.width,height:+ff.height}}); setShowField(false); setFf(ef); };
    const addStruct = () => {
        if (!sf.name||!sf.x||!sf.y||!sf.width||!sf.height) return;
        const payload = {
            id:gid(),
            garden_id:garden.id,
            ...sf,
            x:+sf.x,
            y:+sf.y,
            width:+sf.width,
            height:+sf.height,
            ventilated:false,
            temperature:"",
            humidity:"",
            linked_field_id:sf.linked_field_id||"",
        };
        if (MAINTENANCE_STRUCT_TYPES.has(sf.type)) {
            payload.species = sf.species || "";
            payload.info = sf.info || "";
            payload.maintenance_notes = sf.maintenance_notes || "";
            payload.prune_interval_weeks = Math.max(0, +sf.prune_interval_weeks || 0);
            payload.next_prune_date = sf.next_prune_date || "";
        }
        dispatch({type:"ADD_STRUCT",payload});
        setShowStruct(false);
        setSf(es);
    };
    return (
        <PageShell width={1460}>
            <PageHeader
                title={garden.name}
                subtitle={`${gardenTypeLabel} · ${garden.width}m × ${garden.height}m · ${gFields.length} ${t("editor_stats_beds").toLowerCase()} · ${gStructs.length} ${t("editor_stats_structures").toLowerCase()}`}
                meta={[
                    <MetaBadge key="size" value={`${garden.width}×${garden.height}m`} label={t("editor_stats_area")} />,
                    <MetaBadge key="beds" value={gFields.length} label={t("editor_stats_beds")} />,
                    <MetaBadge key="structures" value={gStructs.length} label={t("editor_stats_structures")} />,
                    <MetaBadge key="plants" value={gPlants.length} label={t("editor_stats_plants")} />,
                ]}
                actions={[
                    <Btn key="gardens" size="sm" variant="ghost" onClick={()=>navigate("gardens")} icon="🌿">{t("editor_open_gardens")}</Btn>,
                    <Btn key="struct" size="sm" variant="secondary" onClick={()=>setShowStruct(true)} icon="🏡">{t("add_structure")}</Btn>,
                    <Btn key="bed" size="sm" variant="primary" onClick={()=>setShowField(true)} icon="🛏️">{t("add_bed")}</Btn>
                ]}
            />
            <PanelGroup cols="repeat(auto-fit,minmax(250px,1fr))">
                <SectionPanel title={t("editor_summary_title")} subtitle={t("editor_summary_subtitle")} style={{ minHeight:"100%" }}>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(2,minmax(0,1fr))", gap:10 }}>
                        {summaryCards.map(card => (
                            <div key={card.label} style={{ padding:"12px 12px 11px", border:`1px solid ${T.borderSoft}`, borderRadius:18, background:`linear-gradient(180deg, ${T.surfaceSoft} 0%, ${T.surface} 100%)`, boxShadow:"0 8px 18px rgba(20,18,14,0.05)" }}>
                                <div style={{ fontSize:11, fontWeight:800, color:T.textMuted, textTransform:"uppercase", letterSpacing:0.6 }}>{card.label}</div>
                                <div style={{ marginTop:6, fontSize:24, fontWeight:900, fontFamily:"Fraunces, serif", color:T.text }}>{card.value}</div>
                                <div style={{ marginTop:4, fontSize:11, color:T.textSub }}>{card.helper}</div>
                            </div>
                        ))}
                    </div>
                </SectionPanel>
                <SectionPanel title={t("editor_quick_actions")} subtitle={t("editor_quick_actions_subtitle")} style={{ minHeight:"100%" }}>
                    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                        {quickActions.map(action => (
                            <QuickAction key={action.label} icon={action.icon} label={action.label} helper={action.helper} onClick={action.onClick} style={{ width:"100%" }} />
                        ))}
                    </div>
                </SectionPanel>
                <SectionPanel title={t("editor_garden_label")} subtitle={t("editor_position_hint")} style={{ minHeight:"100%" }}>
                    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                        <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                            <Badge color={T.primary} bg={T.primaryBg}>{gardenTypeLabel}</Badge>
                            <Badge color={T.textSub} bg={T.surfaceAlt}>{garden.width}m × {garden.height}m</Badge>
                            <Badge color={T.textSub} bg={T.surfaceAlt}>{gardenArea}m²</Badge>
                        </div>
                        <div style={{ display:"grid", gridTemplateColumns:"repeat(2,minmax(0,1fr))", gap:10 }}>
                            <div style={{ padding:"12px 12px 11px", border:`1px solid ${T.borderSoft}`, borderRadius:18, background:T.surfaceSoft }}>
                                <div style={{ fontSize:11, fontWeight:800, color:T.textMuted, textTransform:"uppercase", letterSpacing:0.6 }}>{t("editor_stats_beds")}</div>
                                <div style={{ marginTop:6, fontSize:22, fontWeight:900, fontFamily:"Fraunces, serif", color:T.text }}>{gFields.length}</div>
                            </div>
                            <div style={{ padding:"12px 12px 11px", border:`1px solid ${T.borderSoft}`, borderRadius:18, background:T.surfaceSoft }}>
                                <div style={{ fontSize:11, fontWeight:800, color:T.textMuted, textTransform:"uppercase", letterSpacing:0.6 }}>{t("editor_stats_structures")}</div>
                                <div style={{ marginTop:6, fontSize:22, fontWeight:900, fontFamily:"Fraunces, serif", color:T.text }}>{gStructs.length}</div>
                            </div>
                            <div style={{ padding:"12px 12px 11px", border:`1px solid ${T.borderSoft}`, borderRadius:18, background:T.surfaceSoft }}>
                                <div style={{ fontSize:11, fontWeight:800, color:T.textMuted, textTransform:"uppercase", letterSpacing:0.6 }}>{t("editor_stats_plants")}</div>
                                <div style={{ marginTop:6, fontSize:22, fontWeight:900, fontFamily:"Fraunces, serif", color:T.text }}>{gPlants.length}</div>
                            </div>
                            <div style={{ padding:"12px 12px 11px", border:`1px solid ${T.borderSoft}`, borderRadius:18, background:T.surfaceSoft }}>
                                <div style={{ fontSize:11, fontWeight:800, color:T.textMuted, textTransform:"uppercase", letterSpacing:0.6 }}>{t("editor_stats_unassigned")}</div>
                                <div style={{ marginTop:6, fontSize:22, fontWeight:900, fontFamily:"Fraunces, serif", color:T.text }}>{unassignedPlants}</div>
                            </div>
                        </div>
                        <div style={{ fontSize:12, color:T.textSub, lineHeight:1.6 }}>
                            {posHint}
                        </div>
                    </div>
                </SectionPanel>
            </PanelGroup>
            <SectionPanel title={t("editor_map_title")} subtitle={t("editor_map_subtitle")} style={{ padding:16 }}>
                <GardenEditor garden={garden} fields={gFields} structures={gStructs} zones={gZones} plants={gPlants} slots={gSlots} dispatch={dispatch} lang={lang} navigate={navigate}/>
            </SectionPanel>
            {showField && (
                <Modal title={`🛏️ ${t("add_bed")}`} onClose={()=>setShowField(false)}>
                    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                        <Input label={t("name")} value={ff.name} onChange={setF("name")} placeholder="e.g. Tomato Raised Bed" required/>
                        <Sel label={t("type")} value={ff.type} onChange={setF("type")} options={FIELD_TYPES.map(ft=>({value:ft,label:LANG[lang]?.[FIELD_LABEL_K[ft]]||ft}))}/>
                        <BedShapePicker value={ff.shape||"rect"} onChange={setF("shape")}/>
                        <InfoBanner icon="📐">{posHint}</InfoBanner>
                        <FormRow><Input label="X (m)" value={ff.x} onChange={setF("x")} type="number" step="0.1" min="0" required/><Input label="Y (m)" value={ff.y} onChange={setF("y")} type="number" step="0.1" min="0" required/><Input label={`${t("width")} (m)`} value={ff.width} onChange={setF("width")} type="number" step="0.1" min="0.1" required/><Input label={`${t("height")} (m)`} value={ff.height} onChange={setF("height")} type="number" step="0.1" min="0.1" required/></FormRow>
                        <Textarea label={t("notes")} value={ff.notes} onChange={setF("notes")} rows={2}/>
                        <FormActions onCancel={()=>{ setShowField(false); setFf(ef); }} onSave={addField} saveLabel={t("add_bed")} t={t}/>
                    </div>
                </Modal>
            )}
            {showStruct && (
                <Modal title={`🏡 ${t("add_structure")}`} onClose={()=>setShowStruct(false)}>
                    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                        <Input label={t("name")} value={sf.name} onChange={setS("name")} placeholder="e.g. Main Greenhouse" required/>
                        <Sel label={t("type")} value={sf.type} onChange={setS("type")} options={STRUCT_TYPES.map(st=>({value:st,label:`${STRUCT_ICONS[st]} ${LANG[lang]?.[STRUCT_LABEL_K[st]]||st}`}))}/>
                        <Sel label="Linked field" value={sf.linked_field_id || ""} onChange={setS("linked_field_id")} options={[{ value:"", label:"No link" }, ...gFields.map(f=>({ value:f.id, label:f.name }))]} />
                        <Textarea label="Info" value={sf.info} onChange={setS("info")} rows={2} placeholder="Short description shown in details" />
                        {MAINTENANCE_STRUCT_TYPES.has(sf.type) && (
                            <>
                                <FormRow cols={2}>
                                    <Input label="Species / type" value={sf.species} onChange={setS("species")} placeholder="Beech, yew, privet..." />
                                    <Input label="Prune interval (weeks)" value={sf.prune_interval_weeks} onChange={setS("prune_interval_weeks")} type="number" min="0" max="52" placeholder="20" />
                                </FormRow>
                                <Input label="Next prune date" value={sf.next_prune_date} onChange={setS("next_prune_date")} type="date" />
                                <Textarea label="Maintenance notes" value={sf.maintenance_notes} onChange={setS("maintenance_notes")} rows={2} placeholder="Cut in late spring and after summer growth" />
                            </>
                        )}
                        <InfoBanner icon="📐">{posHint}</InfoBanner>
                        <FormRow><Input label="X (m)" value={sf.x} onChange={setS("x")} type="number" step="0.1" min="0" required/><Input label="Y (m)" value={sf.y} onChange={setS("y")} type="number" step="0.1" min="0" required/><Input label={`${t("width")} (m)`} value={sf.width} onChange={setS("width")} type="number" step="0.1" min="0.1" required/><Input label={`${t("height")} (m)`} value={sf.height} onChange={setS("height")} type="number" step="0.1" min="0.1" required/></FormRow>
                        <Textarea label={t("notes")} value={sf.notes} onChange={setS("notes")} rows={2}/>
                        <FormActions onCancel={()=>{ setShowStruct(false); setSf(es); }} onSave={addStruct} saveLabel={t("add_structure")} t={t}/>
                    </div>
                </Modal>
            )}
        </PageShell>
    );
}

// ----
// SCREEN: BEDS & FIELDS
// ----
function FieldsScreen({ state, dispatch, navigate, lang }) {
    const t = useT(lang);
    const uid = state.activeUserId;
    const gardens = forUser(state.gardens, uid);
    const allPlants = forUser(state.plants, uid);
    const structures = forUser(state.structures, uid);
    const tasks = forUser(state.tasks, uid);
    const allSlots = forUser(state.slots||[], uid);
    const slots   = allSlots.filter(s => s.parent_type==="field");
    const [filterGarden, setFilterGarden] = useState(state.activeGardenId||"all");
    const [show, setShow] = useState(false);
    const [showSlot, setShowSlot] = useState(false);
    const [slotField, setSlotField] = useState(null);
    const [editSlot, setEditSlot] = useState(null);
    const [editSlotForm, setEditSlotForm] = useState(null);
    const [gardenSel, setGardenSel] = useState(state.activeGardenId||gardens[0]?.id||"");
    const ef = { name:"", type:"raised_bed", shape:"rect", x:"", y:"", width:"", height:"", notes:"" };
    const esl = { name:"", label:"", type:"bed_row", row_count:"1", spacing_cm:"", plant_count:"", row_length_m:"", orientation:"horizontal", notes:"" };
    const [form, setForm] = useState(ef);
    const [slotForm, setSlotForm] = useState(esl);
    const set = k=>v=>setForm(f=>({...f,[k]:v}));
    const setSlot = k=>v=>setSlotForm(f=>({...f,[k]:v}));
    const allFields = forUser(state.fields, uid);
    const display = filterGarden==="all" ? allFields : allFields.filter(f=>f.garden_id===filterGarden);
    const displayArea = display.reduce((sum, f) => sum + ((+f.width || 0) * (+f.height || 0)), 0).toFixed(1);
    const garden = gardens.find(g=>g.id===gardenSel);
    const create = () => {
        if (!form.name||!form.x||!form.y||!form.width||!form.height||!gardenSel) return;
        dispatch({type:"ADD_FIELD",payload:{id:gid(),garden_id:gardenSel,...form,x:+form.x,y:+form.y,width:+form.width,height:+form.height}});
        setShow(false); setForm(ef);
    };
    const openSlotModal = (field) => {
        const count = slots.filter(s => s.parent_id===field.id).length + 1;
        setSlotField(field);
        setSlotForm({ name:`${field.name} Row ${count}`, label:`R${count}`, type:"bed_row", row_count:"1", spacing_cm:"", plant_count:"", row_length_m:"", orientation:"horizontal", notes:"" });
        setShowSlot(true);
    };
    const createSlot = () => {
        if (!slotField || !slotForm.name.trim()) return;
        dispatch({
            type:"ADD_SLOT",
            payload:{
                id:gid(),
                garden_id:slotField.garden_id,
                parent_type:"field",
                parent_id:slotField.id,
                ...slotForm,
                row_count: slotForm.type==="bed_row" ? (+slotForm.row_count || 1) : undefined,
                spacing_cm: slotForm.type==="bed_row" ? (+slotForm.spacing_cm || 0) : undefined,
                plant_count: slotForm.type==="bed_row" ? (+slotForm.plant_count || 0) : undefined,
                row_length_m: slotForm.type==="bed_row" ? (+slotForm.row_length_m || 0) : undefined,
                orientation: slotForm.type==="bed_row" ? (slotForm.orientation || "horizontal") : undefined,
                label:(slotForm.label||slotForm.name).trim(),
            }
        });
        setShowSlot(false);
        setSlotField(null);
        setSlotForm(esl);
    };
    const openEditSlot = (slot) => {
        setEditSlot(slot);
        setEditSlotForm({
            name: slot.name || "",
            label: slot.label || "",
            row_count: String(slot.row_count || 1),
            spacing_cm: slot.spacing_cm ? String(slot.spacing_cm) : "",
            plant_count: slot.plant_count ? String(slot.plant_count) : "",
            row_length_m: slot.row_length_m ? String(slot.row_length_m) : "",
            orientation: slot.orientation || "horizontal",
            notes: slot.notes || "",
        });
    };
    const deleteSlotTree = (slot) => {
        if (!slot) return;
        const childMap = new Map();
        allSlots.forEach(s => {
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
        walk(slot.id);
        const slotIds = [slot.id, ...descendants.map(s => s.id)];
        const plantsToRemove = allPlants.filter(p => slotIds.includes(p.slot_id)).map(p => p.id);
        plantsToRemove.forEach(id => dispatch({ type:"DELETE_PLANT", payload:id }));
        slotIds.slice().reverse().forEach(id => dispatch({ type:"DELETE_SLOT", payload:id }));
    };
    const saveEditSlot = () => {
        if (!editSlot || !editSlotForm?.name.trim()) return;
        const next = {
            ...editSlot,
            name: editSlotForm.name.trim(),
            label: (editSlotForm.label || editSlotForm.name).trim(),
            notes: editSlotForm.notes || "",
        };
        if (editSlot.type === "tunnel_row" || editSlot.type === "bed_row") {
            next.row_count = Math.max(1, +editSlotForm.row_count || 1);
            next.spacing_cm = Math.max(0, +editSlotForm.spacing_cm || 0);
            next.plant_count = Math.max(0, +editSlotForm.plant_count || 0);
            next.row_length_m = Math.max(0, +editSlotForm.row_length_m || 0);
            next.orientation = editSlotForm.orientation || "horizontal";
        }
        dispatch({ type:"UPDATE_SLOT", payload: next });
        setEditSlot(null);
        setEditSlotForm(null);
    };
    return (
        <PageShell width={1120}>
            <PageHeader
                title={`🛏️ ${t("nav_fields")}`}
                subtitle={`${display.length} ${t("beds_total")} · ${displayArea}m² planned`}
                meta={[
                    <MetaBadge key="beds" value={display.length} label={t("beds_fields")} />,
                    <MetaBadge key="area" value={`${displayArea}m²`} label={t("total_area")} />
                ]}
                actions={[<Btn key="add" variant="primary" icon="+" onClick={()=>setShow(true)}>{t("add_bed")}</Btn>]}
            />
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, flexWrap:"wrap", marginBottom:18 }}>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                    <Sel value={filterGarden} onChange={setFilterGarden} options={[{value:"all",label:t("all")},...gardens.map(g=>({value:g.id,label:g.name}))]} style={{ minWidth:160 }}/>
                    <Badge color={T.textSub} bg={T.surfaceAlt}>{display.length} beds</Badge>
                </div>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                    <Btn size="sm" variant="secondary" icon="🗺️" onClick={()=>navigate("editor")} title="Open editor">Editor</Btn>
                    <Btn size="sm" variant="secondary" onClick={()=>navigate("gardens")} title="Go to gardens">Gardens</Btn>
                </div>
            </div>

            {display.length===0 ? (
                <SectionPanel title={`🛏️ ${t("nav_fields")}`} subtitle={t("no_beds")} action={<Btn size="sm" variant="primary" onClick={()=>setShow(true)}>{t("add_bed")}</Btn>}>
                    <EmptyState icon="🛏️" title={t("no_beds")} subtitle="Add beds or fields to start planning." />
                </SectionPanel>
            ) : (
                <SectionPanel title="Bed overzicht" subtitle="Compacte status per bed" style={{ padding:0 }}>
                    <div style={{ display:"flex", flexDirection:"column", gap:12, padding:18 }}>
                        {display.map(f => {
                            const fp = allPlants.filter(p=>p.field_id===f.id);
                            const fs = slots.filter(s=>s.parent_id===f.id);
                            const fc = FIELD_COLORS[f.type] || T.primary;
                            const slotCount = fs.length;
                            const plantCount = fp.reduce((sum,p)=>sum + Math.max(1, +p.quantity || 1), 0);
                            const typeLabel = LANG[lang]?.[FIELD_LABEL_K[f.type]] || f.type;
                            const nextTask = tasks.filter(t => t.field_id === f.id && t.status !== "done" && t.due_date)
                                .sort((a, b) => (a.due_date||"").localeCompare(b.due_date||""))[0];
    const nextLabel = nextTask ? `${t("dashboard_next_prefix")}: ${fmtDate(nextTask.due_date, lang)} · ${nextTask.title}` : t("dashboard_no_upcoming_tasks");
                            return (
                                <ListRow
                                    key={f.id}
                                    icon="🛏️"
                                    title={f.name}
                                    meta={`${f.width}m × ${f.height}m · ${typeLabel}`}
                                    hint={`Area ${(f.width*f.height).toFixed(1)}m² · Pos (${f.x}m, ${f.y}m) · ${nextLabel}`}
                                    status={{ label:typeLabel, color:fc, bg:fc+"22" }}
                                    actionSlot={<div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                                        <Badge color={T.textSub} bg={T.surfaceAlt}>{slotCount} slots</Badge>
                                        <Badge color={T.textSub} bg={T.surfaceAlt}>{plantCount} plants</Badge>
                                    </div>}
                                    actions={[
                                        <Btn key="slot" size="xs" variant="secondary" onClick={()=>openSlotModal(f)}>+ Row</Btn>,
                                        <Btn key="map" size="xs" variant="secondary" onClick={()=>{ dispatch({type:"SET_ACTIVE_GARDEN",payload:f.garden_id}); navigate("editor"); }}>Map</Btn>,
                                        <Btn key="del" size="xs" variant="ghost" onClick={()=>{ if(window.confirm(t("delete_bed"))) dispatch({type:"DELETE_FIELD",payload:f.id}); }}>✕</Btn>,
                                    ]}
                                />
                            );
                        })}
                    </div>
                </SectionPanel>
            )}

            {show && (
                <Modal title={`🛏️ ${t("add_bed")}`} onClose={()=>setShow(false)}>
                    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                        {gardens.length>1 && <Sel label={t("gardens")} value={gardenSel} onChange={setGardenSel} options={gardens.map(g=>({value:g.id,label:g.name}))} required/>}
                        <Input label={t("name")} value={form.name} onChange={set("name")} placeholder="e.g. Tomato Raised Bed" required/>
                        <Sel label={t("type")} value={form.type} onChange={set("type")} options={FIELD_TYPES.map(ft=>({value:ft,label:LANG[lang]?.[FIELD_LABEL_K[ft]]||ft}))}/>
                        <BedShapePicker value={form.shape||"rect"} onChange={set("shape")}/>
                        {garden && <InfoBanner icon="📐">Garden is {garden.width}m × {garden.height}m. Position from top-left (0, 0).</InfoBanner>}
                        <FormRow><Input label="X (m)" value={form.x} onChange={set("x")} type="number" step="0.1" min="0" required/><Input label="Y (m)" value={form.y} onChange={set("y")} type="number" step="0.1" min="0" required/><Input label={`${t("width")} (m)`} value={form.width} onChange={set("width")} type="number" step="0.1" min="0.1" required/><Input label={`${t("height")} (m)`} value={form.height} onChange={set("height")} type="number" step="0.1" min="0.1" required/></FormRow>
                        <Textarea label={t("notes")} value={form.notes} onChange={set("notes")} rows={2}/>
                        <FormActions onCancel={()=>{ setShow(false); setForm(ef); }} onSave={create} saveLabel={t("add_bed")} t={t}/>
                    </div>
                </Modal>
            )}
            {showSlot && slotField && (
                <Modal title={`🪴 Add Row In ${slotField.name}`} onClose={()=>{ setShowSlot(false); setSlotField(null); setSlotForm(esl); }}>
                    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                        <InfoBanner icon="🪴">Rows are internal locations inside a bed. Existing plants without a row stay valid.</InfoBanner>
                        <FormRow cols={2}>
                            <Input label="Name" value={slotForm.name} onChange={setSlot("name")} placeholder="e.g. North Row" required/>
                            <Input label="Label" value={slotForm.label} onChange={setSlot("label")} placeholder="R1" required/>
                        </FormRow>
                        <Sel label="Type" value={slotForm.type} onChange={setSlot("type")} options={[{ value:"bed_row", label:"Row" }, { value:"bed_section", label:"Section" }]}/>
                        {(slotForm.type==="bed_row") && (
                            <FormRow cols={4}>
                                <Input label="Rows" value={slotForm.row_count} onChange={setSlot("row_count")} type="number" min="1" max="24" placeholder="4"/>
                                <Input label="Spacing (cm)" value={slotForm.spacing_cm} onChange={setSlot("spacing_cm")} type="number" min="1" max="200" placeholder="13"/>
                                <Input label="Plants" value={slotForm.plant_count} onChange={setSlot("plant_count")} type="number" min="1" max="1000" placeholder="80"/>
                                <Sel label="Orientation" value={slotForm.orientation || "horizontal"} onChange={setSlot("orientation")} options={[{ value:"horizontal", label:"Horizontal" }, { value:"vertical", label:"Vertical (90°)" }]} />
                            </FormRow>
                        )}
                        {(slotForm.type==="bed_row") && (
                            <>
                                <Input label="Row length (m)" value={slotForm.row_length_m} onChange={setSlot("row_length_m")} type="number" min="0.1" max="100" placeholder="2.6"/>
                                {renderSlotSeedPlan({ ...slotForm, id: slotField?.id || "preview", type:"bed_row" }, { compact:true })}
                            </>
                        )}
                        <Textarea label={t("notes")} value={slotForm.notes} onChange={setSlot("notes")} rows={2}/>
                        <FormActions onCancel={()=>{ setShowSlot(false); setSlotField(null); setSlotForm(esl); }} onSave={createSlot} saveLabel="Add Row" t={t}/>
                    </div>
                </Modal>
            )}
            {editSlot && editSlotForm && (
                <Modal title={`✏️ Edit ${editSlot.name}`} onClose={()=>{ setEditSlot(null); setEditSlotForm(null); }}>
                    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                        <InfoBanner icon="ℹ️">Existing rows can be adjusted here. The preview updates from row count, spacing and plant count.</InfoBanner>
                        <FormRow cols={2}>
                            <Input label="Name" value={editSlotForm.name} onChange={v=>setEditSlotForm(f=>({...f,name:v}))} required/>
                            <Input label="Label" value={editSlotForm.label} onChange={v=>setEditSlotForm(f=>({...f,label:v}))} required/>
                        </FormRow>
                        <Input label="Type" value={slotTypeLabel(editSlot, t)} disabled/>
                        {(editSlot.type === "tunnel_row" || editSlot.type === "bed_row") && (
                            <>
                                <FormRow cols={4}>
                                    <Input label="Rows" value={editSlotForm.row_count} onChange={v=>setEditSlotForm(f=>({...f,row_count:v}))} type="number" min="1" max="24"/>
                                    <Input label="Spacing (cm)" value={editSlotForm.spacing_cm} onChange={v=>setEditSlotForm(f=>({...f,spacing_cm:v}))} type="number" min="1" max="200"/>
                                    <Input label="Plants" value={editSlotForm.plant_count} onChange={v=>setEditSlotForm(f=>({...f,plant_count:v}))} type="number" min="0" max="1000"/>
                                    <Sel label="Orientation" value={editSlotForm.orientation || "horizontal"} onChange={v=>setEditSlotForm(f=>({...f,orientation:v}))} options={[{ value:"horizontal", label:"Horizontal" }, { value:"vertical", label:"Vertical (90°)" }]} />
                                </FormRow>
                                <Input label="Row length (m)" value={editSlotForm.row_length_m} onChange={v=>setEditSlotForm(f=>({...f,row_length_m:v}))} type="number" min="0.1" max="100"/>
                                {renderSlotSeedPlan({ ...editSlot, ...editSlotForm, row_count: editSlotForm.row_count, spacing_cm: editSlotForm.spacing_cm, plant_count: editSlotForm.plant_count, row_length_m: editSlotForm.row_length_m })}
                            </>
                        )}
                        <Textarea label={t("notes")} value={editSlotForm.notes} onChange={v=>setEditSlotForm(f=>({...f,notes:v}))} rows={2}/>
                        <FormActions onCancel={()=>{ setEditSlot(null); setEditSlotForm(null); }} onSave={saveEditSlot} saveLabel={t("save")} t={t}/>
                        <Btn
                            variant="danger"
                            onClick={() => {
                                if (window.confirm(`Delete ${editSlot.name}? This also removes any nested slots and linked plants.`)) {
                                    deleteSlotTree(editSlot);
                                    setEditSlot(null);
                                    setEditSlotForm(null);
                                }
                            }}
                        >
                            {t("delete")}
                        </Btn>
                    </div>
                </Modal>
            )}
        </PageShell>
    );
}
// ----
// QUICK ADD PLANT MODAL
// ----
function QuickAddPlantModal({ onClose, gardens, fields, structures, lang, dispatch, uid }) {
    const t = useT(lang);
    const [query, setQuery] = useState("");
    const [libEntry, setLibEntry] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [stage, setStage] = useState("jonge_plant");
    const [quantity, setQuantity] = useState("1");
    const [placementType, setPlacementType] = useState("field");
    const [gardenId, setGardenId] = useState(gardens[0]?.id || "");
    const [fieldId, setFieldId] = useState("");
    const [structId, setStructId] = useState("");
    const inputRef = useRef(null);

    const hits = query.length >= 1
        ? PLANT_LIB.filter(p =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.varieties.some(v => v.toLowerCase().includes(query.toLowerCase()))
          ).slice(0, 6)
        : [];

    const selectEntry = (entry) => {
        setLibEntry(entry);
        setQuery(entry.name);
        setShowDropdown(false);
    };

    const harvestDate = useMemo(() => {
        if (!libEntry?.days_to_harvest) return "";
        const days = stage === "zaailing"
            ? libEntry.days_to_harvest
            : stage === "jonge_plant"
            ? Math.round(libEntry.days_to_harvest * 0.6)
            : Math.round(libEntry.days_to_harvest * 0.2);
        const d = new Date();
        d.setDate(d.getDate() + days);
        return d.toISOString().slice(0, 10);
    }, [libEntry, stage]);

    const statusMap = { zaailing:"sown", jonge_plant:"planted", volwassen:"growing" };
    const today = new Date().toISOString().slice(0, 10);

    const save = () => {
        const name = libEntry?.name || query.trim();
        if (!name) return;
        dispatch({
            type: "ADD_PLANT",
            payload: {
                id: gid(),
                user_id: uid,
                name,
                variety: libEntry?.varieties[0] || "",
                category: libEntry?.category || "Vegetable",
                status: statusMap[stage],
                quantity: Math.max(1, parseInt(quantity) || 1),
                garden_id: gardenId || "",
                field_id: placementType === "field" ? fieldId || "" : "",
                struct_id: placementType === "struct" ? structId || "" : "",
                sow_date: stage === "zaailing" ? today : "",
                plant_date: stage !== "zaailing" ? today : "",
                harvest_date: harvestDate,
                notes: "",
            }
        });
        onClose();
    };

    const bedOptions = fields
        .filter(f => f.garden_id === gardenId)
        .map(f => ({ value: f.id, label: f.name }));
    const structOptions = structures
        .filter(s => s.garden_id === gardenId && GH_TYPES.includes(s.type))
        .map(s => ({ value: s.id, label: s.name }));
    const targetLabel = placementType === "struct" ? "Serre" : "Bed";
    const targetOptions = placementType === "struct" ? structOptions : bedOptions;

    const stages = [
        { id:"zaailing",    label:"🌰 Zaailing",     hint:"Net gezaaid" },
        { id:"jonge_plant", label:"🌿 Jonge plant",  hint:"Al een beetje gegroeid" },
        { id:"volwassen",   label:"🌳 Volwassen",    hint:"Bijna oogstbaar" },
    ];

    return (
        <Modal title="🌱 Plant toevoegen" onClose={onClose} width={480}>
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                {/* Search */}
                <div style={{ position:"relative" }}>
                    <label style={{ fontSize:11, fontWeight:700, color:T.textSub, letterSpacing:0.5, textTransform:"uppercase", display:"block", marginBottom:4 }}>Plant</label>
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={e => { setQuery(e.target.value); setLibEntry(null); setShowDropdown(true); }}
                        onFocus={() => query && setShowDropdown(true)}
                        placeholder="Zoek op naam… bijv. Tomaat, Basilicum"
                        autoFocus
                        style={{ width:"100%", fontFamily:"inherit", fontSize:14, color:T.text, background:T.surface, border:`1.5px solid ${T.borderSoft}`, borderRadius:T.radiusMd, padding:"10px 14px", outline:"none", boxSizing:"border-box" }}
                    />
                    {showDropdown && hits.length > 0 && (
                        <div style={{ position:"absolute", top:"100%", left:0, right:0, background:T.surface, border:`1.5px solid ${T.borderSoft}`, borderRadius:T.radiusMd, boxShadow:T.shMd, zIndex:10, overflow:"hidden", marginTop:4 }}>
                            {hits.map(h => (
                                <button key={h.name} onClick={() => selectEntry(h)} style={{ display:"flex", alignItems:"center", gap:10, width:"100%", padding:"10px 14px", background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", fontSize:13, color:T.text, textAlign:"left", borderBottom:`1px solid ${T.borderLight}` }}
                                    onMouseEnter={e => e.currentTarget.style.background = T.surfaceSoft}
                                    onMouseLeave={e => e.currentTarget.style.background = "none"}>
                                    <span style={{ fontSize:18 }}>{CAT_ICONS[h.category] || "🌿"}</span>
                                    <div>
                                        <div style={{ fontWeight:700 }}>{h.name}</div>
                                        <div style={{ fontSize:11, color:T.textMuted }}>{h.category}{h.varieties.length ? ` · ${h.varieties[0]}` : ""}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Stage */}
                <div>
                    <label style={{ fontSize:11, fontWeight:700, color:T.textSub, letterSpacing:0.5, textTransform:"uppercase", display:"block", marginBottom:8 }}>Groeifase</label>
                    <div style={{ display:"flex", gap:8 }}>
                        {stages.map(s => (
                            <button key={s.id} onClick={() => setStage(s.id)} style={{ flex:1, padding:"10px 8px", borderRadius:T.radiusMd, border:`1.5px solid ${stage===s.id ? T.primary : T.borderSoft}`, background:stage===s.id ? T.primaryBg : T.surface, color:stage===s.id ? T.primary : T.textSub, cursor:"pointer", fontFamily:"inherit", fontSize:12, fontWeight:700, transition:`all ${T.transitionFast}`, outline:"none", textAlign:"center" }}>
                                <div>{s.label}</div>
                                <div style={{ fontWeight:400, fontSize:10, marginTop:2, opacity:0.8 }}>{s.hint}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Harvest preview */}
                {harvestDate && (
                    <InfoBanner icon="🗓️">
                        Geschatte oogst: <strong>{new Date(harvestDate + "T00:00:00").toLocaleDateString(lang === "nl" ? "nl-BE" : "en-GB", { day:"numeric", month:"long", year:"numeric" })}</strong>
                    </InfoBanner>
                )}

                {/* Quantity */}
                <Input label="Aantal" value={quantity} onChange={setQuantity} type="number" min="1" max="999" />

                <div style={{ display:"flex", flexDirection:"column", gap:10, background:T.surfaceSoft, borderRadius:T.radiusMd, padding:"12px 14px", border:`1px solid ${T.borderMuted}` }}>
                    <div style={{ fontSize:11, fontWeight:700, color:T.textSub, letterSpacing:0.5, textTransform:"uppercase" }}>Locatie</div>
                    <Sel
                        label="Tuin"
                        value={gardenId}
                        onChange={v => { setGardenId(v); setFieldId(""); setStructId(""); }}
                        options={gardens.map(g => ({ value:g.id, label:g.name }))}
                    />
                    <Sel
                        label="Koppelen aan"
                        value={placementType}
                        onChange={v => { setPlacementType(v); setFieldId(""); setStructId(""); }}
                        options={[
                            { value:"field", label:"Bed" },
                            { value:"struct", label:"Serre" },
                        ]}
                    />
                    {targetOptions.length > 0 ? (
                        <Sel
                            label={targetLabel}
                            value={placementType === "struct" ? structId : fieldId}
                            onChange={placementType === "struct" ? setStructId : setFieldId}
                            options={[{ value:"", label:`- Kies een ${targetLabel.toLowerCase()} -` }, ...targetOptions]}
                        />
                    ) : (
                        <InfoBanner icon="ℹ️">
                            Er is geen {targetLabel.toLowerCase()} gevonden in deze tuin.
                        </InfoBanner>
                    )}
                </div>
                <FormActions onCancel={onClose} onSave={save} saveLabel="Toevoegen ✓" t={t} />
            </div>
        </Modal>
    );
}

// ----
// SCREEN: PLANTS
// ----
function PlantsScreen({ state, dispatch, lang, routeParams = {}, navigate }) {
    const t = useT(lang);
    const uid = state.activeUserId;
    const gardens = forUser(state.gardens, uid);
    const fields  = forUser(state.fields, uid);
    const structures = forUser(state.structures, uid).filter(s => GH_TYPES.includes(s.type));
    const slots   = forUser(state.slots||[], uid);
    const plants  = forUser(state.plants, uid);
    const [showQuick, setShowQuick] = useState(false);
    const [show, setShow] = useState(false);
    const [showLib, setShowLib] = useState(false);
    const [editing, setEditing] = useState(null);
    const [bulkPrompt, setBulkPrompt] = useState(null);
    const [fStatus, setFStatus] = useState("all");
    const [fCat, setFCat] = useState("all");
    const [search, setSearch] = useState("");
    const [libSearch, setLibSearch] = useState("");
    const [libCat, setLibCat] = useState("all");
    const slotFilterId = routeParams.slot || "";
    const slotFilter = slotFilterId ? slots.find(s => s.id === slotFilterId) : null;
    const ep = { name:"", variety:"", category:"Vegetable", status:"planned", quantity:"1", garden_id:gardens[0]?.id||"", placement_type:"field", field_id:"", struct_id:"", slot_id:"", row_count:"", sow_spacing_cm:"", row_plant_count:"", row_length_m:"", sow_date:"", plant_date:"", harvest_date:"", notes:"" };
    const [form, setForm] = useState(ep);
    const set = k=>v=>setForm(f=>({...f,[k]:v}));
    const placeOptions = form.placement_type==="struct"
        ? structures.filter(s=>s.garden_id===form.garden_id).map(s=>({value:s.id,label:s.name}))
        : fields.filter(f=>f.garden_id===form.garden_id).map(f=>({value:f.id,label:f.name}));
    const slotTargetId = form.placement_type==="struct" ? form.struct_id : form.field_id;
    const slotTargetType = form.placement_type==="struct" ? "struct" : "field";
    const slotOptions = [
        { value:"", label:"No sub-location" },
        ...childSlotsFor(slots, slotTargetType, slotTargetId).map(s => ({ value:s.id, label:slotDisplayLabel(s, slots) })),
    ];
    const selectedSlot = slots.find(s => s.id === form.slot_id);
    const selectedSlotIsRow = selectedSlot && ["bed_row","tunnel_row"].includes(selectedSlot.type);
    const rowCountValue = selectedSlotIsRow ? Math.max(1, +form.row_count || +selectedSlot.row_count || 1) : 1;
    const quantityValue = Math.max(1, +form.quantity || 1);
    const rowPlantValue = selectedSlotIsRow ? Math.max(1, +form.row_plant_count || Math.ceil(quantityValue / rowCountValue)) : quantityValue;
    const filtered = plants.filter(p => {
        if (fStatus!=="all"&&p.status!==fStatus) return false;
        if (fCat!=="all"&&p.category!==fCat) return false;
        if (slotFilterId && p.slot_id !== slotFilterId) return false;
        if (search&&!p.name.toLowerCase().includes(search.toLowerCase())&&!(p.variety||"").toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });
    const libFiltered = PLANT_LIB.filter(p => {
        if (libCat!=="all"&&p.category!==libCat) return false;
        if (libSearch&&!p.name.toLowerCase().includes(libSearch.toLowerCase())) return false;
        return true;
    });
    const openEdit = (p) => {
        setForm({
            ...ep,
            ...p,
            quantity:String(p.quantity||1),
            garden_id:p.garden_id||"",
            placement_type:p.struct_id ? "struct" : "field",
            field_id:p.field_id||"",
            struct_id:p.struct_id||"",
            slot_id:p.slot_id||"",
            row_count:p.row_count ? String(p.row_count) : "",
            sow_spacing_cm:p.sow_spacing_cm ? String(p.sow_spacing_cm) : "",
            row_plant_count:p.row_plant_count ? String(p.row_plant_count) : "",
            row_length_m:p.row_length_m ? String(p.row_length_m) : "",
        });
        setEditing(p);
        setShow(true);
    };
    const close = () => { setShow(false); setEditing(null); setForm(ep); };
    const applySave = (payload) => {
        if (editing) dispatch({type:"UPDATE_PLANT",payload:{...editing,...payload}});
        else dispatch({type:"ADD_PLANT",payload:{id:gid(),...payload}});
        close();
    };
    const save = () => {
        if (!form.name||!form.garden_id) return;
        const rowCount = selectedSlotIsRow ? Math.max(1, +form.row_count || +selectedSlot?.row_count || 1) : 1;
        const quantity = Math.max(1, +form.quantity || 1);
        const rowPlantCount = selectedSlotIsRow ? Math.max(1, +form.row_plant_count || Math.ceil(quantity / rowCount)) : "";
        const payload = {
            ...form,
            quantity,
            field_id: form.placement_type==="field" ? form.field_id : "",
            struct_id: form.placement_type==="struct" ? form.struct_id : "",
            row_count: selectedSlotIsRow && rowCount > 1 ? rowCount : "",
            sow_spacing_cm: form.sow_spacing_cm ? +form.sow_spacing_cm : "",
            row_plant_count: selectedSlotIsRow && rowCount > 1 ? rowPlantCount : (form.row_plant_count ? +form.row_plant_count : ""),
            row_length_m: form.row_length_m ? +form.row_length_m : "",
        };
        if (!editing && selectedSlotIsRow && quantity > 1 && rowCount > 1) {
            setBulkPrompt({
                rowCount,
                rowPlantCount,
                quantity,
                slotName: slotDisplayLabel(selectedSlot, slots),
                payload,
            });
            return;
        }
        applySave(payload);
    };
    const saveAsSimplePlant = () => {
        if (!bulkPrompt) return;
        const payload = {
            ...bulkPrompt.payload,
            row_count: "",
            row_plant_count: "",
        };
        setBulkPrompt(null);
        applySave(payload);
    };
    const saveAsRowPlan = () => {
        if (!bulkPrompt) return;
        const payload = {
            ...bulkPrompt.payload,
            row_count: bulkPrompt.rowCount,
            row_plant_count: bulkPrompt.rowPlantCount,
        };
        setBulkPrompt(null);
        applySave(payload);
    };
    const pickFromLib = (plant) => {
        setForm(f=>({...f, name:plant.name, category:plant.category, variety:plant.varieties[0]||""}));
        setShowLib(false); setShow(true);
    };
    return (
        <PageShell width={1100}>
            <PageHeader
                title={`🌱 ${t("nav_plants")}`}
                subtitle={slotFilter ? `${filtered.length}/${plants.length} plants · ${slotDisplayLabel(slotFilter, slots)}` : `${filtered.length}/${plants.length} plants`}
                meta={[
                    <MetaBadge key="gardens" value={gardens.length} label={t("gardens")} />,
                    <MetaBadge key="fields" value={fields.length} label={t("beds_fields")} />
                ]}
                actions={[
                    <Btn key="lib" variant="secondary" onClick={()=>setShowLib(true)}>{t("add_from_library")}</Btn>,
                    <Btn key="add" variant="primary" onClick={()=>setShowQuick(true)} icon="+">{t("add_plant")}</Btn>
                ]}
            />
            <Card variant="muted" style={{ padding:18, display:"flex", flexDirection:"column", gap:14, marginBottom:20, boxShadow:"0 1px 6px rgba(0,0,0,0.05)" }}>
                {slotFilter && (
                    <InfoBanner icon="🪴">
                        Filtering plants in {slotDisplayLabel(slotFilter, slots)}.
                        <Btn size="xs" variant="ghost" onClick={() => navigate && navigate("plants")}>Clear filter</Btn>
                    </InfoBanner>
                )}
                <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
                                    <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={`🔍 ${t("search")}`} style={{ flex:1, minWidth:220, fontFamily:"inherit", fontSize:13, color:T.text, background:T.surface, border:`1.5px solid ${T.border}`, borderRadius:T.radiusLg, padding:"10px 14px", outline:"none" }}/>
                    <span style={{ fontSize:12, color:T.textMuted }}>{filtered.length} / {plants.length} plants</span>
                </div>
                <div>
                    <div style={{ fontSize:12, color:T.textSub, fontWeight:700, letterSpacing:0.5, textTransform:"uppercase", marginBottom:6 }}>Status</div>
                    <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                        <PillFilter value={t("all_statuses")} active={fStatus==="all"} onClick={()=>setFStatus("all")}/>
                        {PLANT_STATUSES.map(s => <PillFilter key={s} value={t(STATUS_K[s])||s} active={fStatus===s} onClick={()=>setFStatus(s)} color={STATUS_CFG[s]?.color} bg={STATUS_CFG[s]?.bg}/>)}
                    </div>
                </div>
                <div>
                    <div style={{ fontSize:12, color:T.textSub, fontWeight:700, letterSpacing:0.5, textTransform:"uppercase", marginBottom:6 }}>Categorie</div>
                    <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                        <PillFilter value={t("all_categories")} active={fCat==="all"} onClick={()=>setFCat("all")}/>
                        {CATEGORIES.map(c => <PillFilter key={c} value={`${CAT_ICONS[c]} ${c}`} active={fCat===c} onClick={()=>setFCat(c)}/>)}
                    </div>
                </div>
            </Card>
            {filtered.length===0 ? (
                <EmptyState icon="🌱" title={plants.length===0?t("no_plants"):"No plants match filters"} action={plants.length===0?<Btn onClick={()=>setShow(true)} icon="+" variant="primary">{t("add_plant")}</Btn>:<Btn onClick={()=>{ setFStatus("all"); setFCat("all"); setSearch(""); }}>Clear Filters</Btn>}/>
            ) : (
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))", gap:14 }}>
                    {filtered.map(p => {
                        const sc_=STATUS_CFG[p.status]||STATUS_CFG.planned;
                        const sc_l=t(STATUS_K[p.status])||p.status;
                        const bed=fields.find(f=>f.id===p.field_id);
                        const greenhouse=structures.find(s=>s.id===p.struct_id);
                        const slot=slots.find(s=>s.id===p.slot_id);
                        return (
                            <Card key={p.id} style={{ padding:16 }}>
                                <div style={{ display:"flex", alignItems:"start", justifyContent:"space-between", marginBottom:10 }}>
                                    <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                                        <div style={{ fontSize:28, lineHeight:1 }}>{CAT_ICONS[p.category]||"🌿"}</div>
                                        <div><div style={{ fontSize:15, fontWeight:800, color:T.text, lineHeight:1.2 }}>{p.name}</div><div style={{ fontSize:11, color:T.textMuted, marginTop:2 }}>{p.variety||"—"}</div></div>
                                    </div>
                                    <Badge color={sc_.color} bg={sc_.bg}>{sc_l}</Badge>
                                </div>
                                <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:10 }}>
                                    <Badge color={T.textSub} bg={T.surfaceAlt}>×{p.quantity}</Badge>
                                    <Badge color={T.textSub} bg={T.surfaceAlt}>{p.category}</Badge>
                                    {bed && <Badge color={T.primary} bg={T.primaryBg}>{bed.name}</Badge>}
                                    {greenhouse && <Badge color={STRUCT_STROKE[greenhouse.type]||T.info} bg={STRUCT_FILL[greenhouse.type]||T.infoBg}>{greenhouse.name}</Badge>}
                                {slot && <Badge color={T.accent} bg={T.accentBg}>{slotDisplayLabel(slot, slots)}</Badge>}
                                </div>
                                {slot && ["bed_row","tunnel_row"].includes(slot.type) && (p.sow_spacing_cm || p.row_plant_count || p.row_length_m) && (
                                    <div style={{ fontSize:11, color:T.textMuted, marginBottom:8, display:"flex", gap:8, flexWrap:"wrap" }}>
                                        {p.row_count && <span>🧵 {p.row_count} rows</span>}
                                        {p.sow_spacing_cm && <span>↔ {p.sow_spacing_cm} cm</span>}
                                        {p.row_plant_count && <span>🌱 {p.row_plant_count} plants</span>}
                                        {p.row_length_m && <span>📏 {p.row_length_m} m</span>}
                                    </div>
                                )}
                                {(p.sow_date||p.plant_date||p.harvest_date) && (
                                    <div style={{ fontSize:11, color:T.textMuted, marginBottom:8, display:"flex", gap:8, flexWrap:"wrap" }}>
                                        {p.sow_date && <span>🌱 {fmtDate(p.sow_date,lang)}</span>}
                                        {p.plant_date && <span>🌿 {fmtDate(p.plant_date,lang)}</span>}
                                        {p.harvest_date && <span>🧺 {fmtDate(p.harvest_date,lang)}</span>}
                                    </div>
                                )}
                                {p.notes && <div style={{ fontSize:12, color:T.textSub, marginBottom:10, lineHeight:1.5, borderLeft:`2px solid ${T.border}`, paddingLeft:8 }}>{p.notes}</div>}
                                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                                    <Btn size="sm" variant="secondary" onClick={()=>openEdit(p)}>{t("edit")}</Btn>
                                    {(p.status==="growing"||p.status==="harvestable") && <Btn size="sm" variant="accent" onClick={()=>dispatch({type:"UPDATE_PLANT",payload:{...p,status:"harvested"}})}>✓ {t("harvest")}</Btn>}
                                    {p.status==="planned" && <Btn size="sm" variant="success" onClick={()=>dispatch({type:"UPDATE_PLANT",payload:{...p,status:"sown",sow_date:p.sow_date||new Date().toISOString().slice(0,10)}})}>{t("mark_sown")}</Btn>}
                                    <Btn size="sm" variant="ghost" onClick={()=>{ if(window.confirm(t("delete_plant"))) dispatch({type:"DELETE_PLANT",payload:p.id}); }}>✕</Btn>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
            {/* Add / Edit modal */}
            {show && (
                <Modal title={editing?`✏️ Edit Plant`:`🌱 ${t("add_plant")}`} onClose={close}>
                    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                        <FormRow>
                            <Input label={t("name")} value={form.name} onChange={set("name")} placeholder="e.g. Tomato" required/>
                            <Input label={t("variety")} value={form.variety} onChange={set("variety")} placeholder="e.g. Roma"/>
                        </FormRow>
                        <FormRow cols={3}>
                            <Sel label={t("category")} value={form.category} onChange={set("category")} options={CATEGORIES}/>
                            <Sel label="Status" value={form.status} onChange={set("status")} options={PLANT_STATUSES.map(s=>({value:s,label:t(STATUS_K[s])||s}))}/>
                            <Input label={t("quantity")} value={form.quantity} onChange={set("quantity")} type="number" min="1"/>
                        </FormRow>
                        <FormRow cols={4}>
                            <Sel label={t("nav_gardens")} value={form.garden_id} onChange={v=>setForm(f=>({...f,garden_id:v,field_id:"",struct_id:"",slot_id:""}))} options={[{value:"",label:t("select_garden")},...gardens.map(g=>({value:g.id,label:g.name}))]} required/>
                            <Sel label="Placement" value={form.placement_type} onChange={v=>setForm(f=>({...f,placement_type:v,field_id:"",struct_id:"",slot_id:""}))} options={[{value:"field",label:"Bed / Field"},{value:"struct",label:"Greenhouse"}]}/>
                            <Sel label={form.placement_type==="struct"?"Greenhouse":"Bed / Field"} value={form.placement_type==="struct"?form.struct_id:form.field_id} onChange={v=>setForm(f=>({...f,[f.placement_type==="struct"?"struct_id":"field_id"]:v,slot_id:""}))} options={[{value:"",label:t("unassigned")},...placeOptions]}/>
                            <Sel label="Row / Pot" value={form.slot_id} onChange={set("slot_id")} options={slotOptions}/>
                        </FormRow>
                        {selectedSlotIsRow && (
                            <FormRow cols={3}>
                                <Input label="Rows" value={form.row_count} onChange={set("row_count")} type="number" min="1" max="24" placeholder={String(selectedSlot?.row_count || 1)} />
                                <Input label="Spacing (cm)" value={form.sow_spacing_cm} onChange={set("sow_spacing_cm")} type="number" min="1" max="200" placeholder="35" />
                                <Input label="Plants in row" value={form.row_plant_count} onChange={set("row_plant_count")} type="number" min="1" max="1000" placeholder="24" />
                            </FormRow>
                        )}
                        {selectedSlotIsRow && (
                            <Input label="Row length (m)" value={form.row_length_m} onChange={set("row_length_m")} type="number" min="0.1" max="100" placeholder="8.4" />
                        )}
                        {selectedSlotIsRow && quantityValue > 1 && rowCountValue > 1 && (
                            <InfoBanner icon="🌱">
                                This can be saved as a row plan: {rowCountValue} rows × {rowPlantValue} plants in {slotDisplayLabel(selectedSlot, slots)}.
                            </InfoBanner>
                        )}
                        <FormRow cols={3}>
                            <Input label={t("sow_date")} value={form.sow_date} onChange={set("sow_date")} type="date"/>
                            <Input label={t("plant_date")} value={form.plant_date} onChange={set("plant_date")} type="date"/>
                            <Input label={t("harvest_date")} value={form.harvest_date} onChange={set("harvest_date")} type="date"/>
                        </FormRow>
                        <Textarea label={t("notes")} value={form.notes} onChange={set("notes")} rows={2}/>
                        <FormActions onCancel={close} onSave={save} saveLabel={editing?t("save"):t("add_plant")} t={t}/>
                    </div>
                </Modal>
            )}
            {/* Library modal */}
            {showLib && (
                <Modal title={t("library_title")} onClose={()=>setShowLib(false)} width={780}>
                    <p style={{ margin:"0 0 14px", fontSize:13, color:T.textMuted }}>{t("library_sub")}</p>
                    <div style={{ display:"flex", gap:8, marginBottom:14, alignItems:"center", flexWrap:"wrap" }}>
                        <input value={libSearch} onChange={e=>setLibSearch(e.target.value)} placeholder={`🔍 ${t("search")}`} style={{ fontFamily:"inherit", fontSize:13, color:T.text, background:T.surface, border:`1.5px solid ${T.border}`, borderRadius:T.rs, padding:"7px 12px", outline:"none", minWidth:180 }}/>
                        <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                            <PillFilter value={t("all")} active={libCat==="all"} onClick={()=>setLibCat("all")}/>
                            {CATEGORIES.map(c => <PillFilter key={c} value={`${CAT_ICONS[c]}`} active={libCat===c} onClick={()=>setLibCat(c)} title={c}/>)}
                        </div>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:10, maxHeight:400, overflowY:"auto" }}>
                        {libFiltered.map(p => (
                            <div key={p.name} onClick={()=>pickFromLib(p)}
                                 style={{ padding:"10px 12px", border:`1.5px solid ${T.border}`, borderRadius:T.r, cursor:"pointer", transition:"all 0.15s", background:T.surface }}
                                 onMouseEnter={e=>{ e.currentTarget.style.borderColor=T.primary; e.currentTarget.style.background=T.primaryBg; }}
                                 onMouseLeave={e=>{ e.currentTarget.style.borderColor=T.border; e.currentTarget.style.background=T.surface; }}>
                                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                                    <span style={{ fontSize:22 }}>{CAT_ICONS[p.category]||"🌿"}</span>
                                    <div>
                                        <div style={{ fontSize:13, fontWeight:700, color:T.text }}>{p.name}</div>
                                        <div style={{ fontSize:10, color:T.textMuted }}>{p.category}</div>
                                    </div>
                                </div>
                                <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                                    {p.varieties.slice(0,3).map(v => <Badge key={v} color={T.primary} bg={T.primaryBg} style={{fontSize:9,padding:"1px 6px"}}>{v}</Badge>)}
                                    {p.varieties.length>3 && <Badge color={T.textMuted} bg={T.surfaceAlt} style={{fontSize:9,padding:"1px 6px"}}>+{p.varieties.length-3}</Badge>}
                                </div>
                            </div>
                        ))}
                    </div>
                </Modal>
            )}
            {showQuick && (
                <QuickAddPlantModal
                    onClose={() => setShowQuick(false)}
                    gardens={gardens}
                    fields={fields}
                    structures={structures}
                    lang={lang}
                    dispatch={dispatch}
                    uid={state.activeUserId}
                />
            )}
            {bulkPrompt && (
                <Modal title="🌱 Save as row plan?" onClose={()=>setBulkPrompt(null)} width={520}>
                    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                        <InfoBanner icon="🧭">
                            {bulkPrompt.quantity} plants in {bulkPrompt.slotName} can be stored as a row plan: {bulkPrompt.rowCount} rows × {bulkPrompt.rowPlantCount} plants.
                        </InfoBanner>
                        <div style={{ fontSize:13, color:T.textSub, lineHeight:1.5 }}>
                            Keep it as one plant card, or save the row structure so the tunnel preview and counts stay readable.
                        </div>
                        <FormActions
                            onCancel={()=>setBulkPrompt(null)}
                            onSave={saveAsRowPlan}
                            saveLabel={`Save as ${bulkPrompt.rowCount} rows`}
                            t={t}
                        />
                        <Btn variant="ghost" onClick={saveAsSimplePlant}>Keep as one item</Btn>
                    </div>
                </Modal>
            )}
        </PageShell>
    );
}

const LinkedHint = (task, fields, structures) => {
    const parts = [];
    const field = fields.find(f => f.id === task.field_id);
    const struct = structures.find(s => s.id === task.struct_id);
    if (field) parts.push(field.name);
    if (struct) parts.push(struct.name);
    if (task.notes) parts.push(task.notes);
    return parts.length ? parts.join(" · ") : undefined;
};
const isMaintenanceTask = (task) => String(task.id || "").startsWith("maint_") || (task.linked_type === "struct" && ["pruning","repair","cleaning"].includes(task.type));

// ----
// SCREEN: TASKS
// ----
function TasksScreen({ state, dispatch, lang }) {
    const t = useT(lang);
    const uid = state.activeUserId;
    const gardens = forUser(state.gardens, uid);
    const fields  = forUser(state.fields, uid);
    const structures = forUser(state.structures, uid);
    const tasks   = forUser(state.tasks, uid);
    const todayDate = new Date(new Date().toDateString());
    const overdueTasks = tasks.filter(task => isOverdue(task.due_date, task.status) && task.status !== "done");
    const [fStatus, setFStatus] = useState("all");
    const [fType, setFType] = useState("all");
    const [show, setShow] = useState(false);
    const ef = { title:"", type:"general", status:"pending", due_date:"", linked_type:"garden", linked_id:gardens[0]?.id||"", notes:"" };
    const [form, setForm] = useState(ef);
    const set = k=>v=>setForm(f=>({...f,[k]:v}));
    const display = tasks.filter(t2 => {
        if (fStatus!=="all"&&t2.status!==fStatus) return false;
        if (fType==="maintenance" && !isMaintenanceTask(t2)) return false;
        if (fType!=="all" && fType!=="maintenance"&&t2.type!==fType) return false;
        return true;
    }).sort((a,b) => {
        if (a.status==="done"&&b.status!=="done") return 1;
        if (b.status==="done"&&a.status!=="done") return -1;
        const ao=isOverdue(a.due_date,a.status), bo=isOverdue(b.due_date,b.status);
        if (ao&&!bo) return -1; if (bo&&!ao) return 1;
        return (a.due_date||"").localeCompare(b.due_date||"");
    });
    const todayOnly = display.filter(task => task.status !== "done" && isSameDay(task.due_date, todayDate));
    const weekOnly = display.filter(task => {
        if (!task.due_date) return false;
        const due = new Date(task.due_date + "T00:00:00");
        const diff = due - todayDate;
        return diff > 0 && diff <= 7 * 24 * 60 * 60 * 1000;
    });
    const done = tasks.filter(t2=>t2.status==="done").length;
    const pct = tasks.length ? Math.round(done/tasks.length*100) : 0;
    const linkedOptions = () => {
        if (form.linked_type==="garden") return gardens.map(g=>({value:g.id,label:g.name}));
        if (form.linked_type==="field")  return fields.map(f=>({value:f.id,label:f.name}));
        return forUser(state.structures,uid).map(s=>({value:s.id,label:s.name}));
    };
    const create = () => { if (!form.title) return; dispatch({type:"ADD_TASK",payload:{id:gid(),...form}}); setShow(false); setForm(ef); };
    return (
        <PageShell width={960}>
            <PageHeader
                title={`✅ ${t("nav_tasks")}`}
                subtitle={`${done}/${tasks.length} complete`}
                meta={[
                    <MetaBadge key="open" value={tasks.length - done} label={t("task_pending")} />,
                    <MetaBadge key="done" value={done} label={t("task_done")} />
                ]}
                actions={[<Btn key="add" variant="primary" icon="+" onClick={()=>setShow(true)}>{t("add_task")}</Btn>]}
            />
            {tasks.length>0 && (
                <div style={{ marginBottom:18 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:T.textSub, marginBottom:5 }}><span>{pct}% {t("task_done")}</span><span>{done}/{tasks.length}</span></div>
                    <div style={{ height:6, background:T.borderLight, borderRadius:99 }}><div style={{ height:"100%", width:`${pct}%`, background:T.success, borderRadius:99, transition:"width 0.4s" }}/></div>
                </div>
            )}
            <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:10 }}>
                <Badge color={T.danger} bg={T.dangerBg}>{overdueTasks.length} overdue</Badge>
                <Badge color={T.primary} bg={T.primaryBg}>{todayOnly.length} today</Badge>
                <Badge color={T.accent} bg={T.accentBg}>{weekOnly.length} this week</Badge>
            </div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:14 }}>
                <PillFilter value={t("all_statuses")} active={fStatus==="all"} onClick={()=>setFStatus("all")}/>
                {Object.entries(TASK_STATUS_K).map(([k,lk]) => <PillFilter key={k} value={t(lk)||k} active={fStatus===k} onClick={()=>setFStatus(k)} color={TASK_STATUS_C[k]?.color} bg={TASK_STATUS_C[k]?.bg}/>)}
                <span style={{ width:1, background:T.border, margin:"0 4px" }}/>
                <PillFilter value="All Types" active={fType==="all"} onClick={()=>setFType("all")}/>
                <PillFilter value={t("maintenance")} active={fType==="maintenance"} onClick={()=>setFType("maintenance")}/>
                {TASK_TYPES.map(ty => <PillFilter key={ty} value={`${TASK_ICONS[ty]} ${ty}`} active={fType===ty} onClick={()=>setFType(ty)}/>)}
            </div>
            {display.length===0 ? <EmptyState icon="✅" title={t("no_tasks")} action={<Btn onClick={()=>setShow(true)} icon="+" variant="primary">{t("add_task")}</Btn>}/> : (
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                    {display.map(task => {
                        const od=isOverdue(task.due_date,task.status);
                        const sc_=TASK_STATUS_C[task.status]||TASK_STATUS_C.pending;
                        const sc_l=t(TASK_STATUS_K[task.status])||task.status;
                        const meta = `${od&&task.status!=="done"?`${t("overdue")} · `:""}${fmtDate(task.due_date,lang)} · ${task.type}`;
                        const toggleLabel = task.status==="done"?t("tasks_pending"):"Complete";
                        return (
                            <ListRow
                                key={task.id}
                                icon={TASK_ICONS[task.type]||"📋"}
                                title={task.title}
                                meta={meta}
                                status={{ label: sc_l, color: sc_.color, bg: sc_.bg }}
                                hint={LinkedHint(task, fields, structures, lang)}
                                actions={[
                                    <Btn key="toggle" size="xs" variant={task.status==="done"?"secondary":"success"} onClick={()=>dispatch({type:"UPDATE_TASK",payload:{...task,status:task.status==="done"?"pending":"done"}})}>{task.status==="done"?t("task_reopen"):t("task_done")}</Btn>,
                                    <Btn key="delete" size="xs" variant="ghost" onClick={()=>{ if(window.confirm("Delete task?")) dispatch({type:"DELETE_TASK",payload:task.id}); }}>✕</Btn>
                                ]}
                            />
                        );
                    })}
                </div>
            )}
            {show && (
                <Modal title={`📋 ${t("add_task")}`} onClose={()=>{ setShow(false); setForm(ef); }}>
                    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                        <Input label={t("name")} value={form.title} onChange={set("title")} placeholder="e.g. Water the tomatoes" required/>
                        <FormRow>
                            <Sel label="Type" value={form.type} onChange={set("type")} options={TASK_TYPES.map(ty=>({value:ty,label:`${TASK_ICONS[ty]} ${ty}`}))}/>
                            <Sel label="Status" value={form.status} onChange={set("status")} options={Object.keys(TASK_STATUS_K).map(k=>({value:k,label:t(TASK_STATUS_K[k])||k}))}/>
                            <Input label={t("due_date")} value={form.due_date} onChange={set("due_date")} type="date"/>
                        </FormRow>
                        <FormRow>
                            <Sel label={t("linked_to")} value={form.linked_type} onChange={v=>{ set("linked_type")(v); set("linked_id")(""); }} options={[{value:"garden",label:"Garden"},{value:"field",label:"Bed/Field"},{value:"struct",label:"Structure"}]}/>
                            <Sel label="Item" value={form.linked_id} onChange={set("linked_id")} options={linkedOptions()}/>
                        </FormRow>
                        <Textarea label={t("notes")} value={form.notes} onChange={set("notes")} rows={2}/>
                        <FormActions onCancel={()=>{ setShow(false); setForm(ef); }} onSave={create} saveLabel={t("add_task")} t={t}/>
                    </div>
                </Modal>
            )}
        </PageShell>
    );
}

// ----
// SCREEN: GREENHOUSES
// ----
function GreenhouseScreen({ state, dispatch, navigate, lang }) {
    const t = useT(lang);
    const uid = state.activeUserId;
    const gardens    = forUser(state.gardens, uid);
    const allFields  = forUser(state.fields, uid);
    const allPlants  = forUser(state.plants, uid);
    const allSlots   = forUser(state.slots||[], uid);
    const structSlots = allSlots.filter(s => s.parent_type==="struct");
    const traySlots = structSlots.filter(s => s.type==="greenhouse_tray");
    const structures = forUser(state.structures, uid).filter(s => GH_TYPES.includes(s.type));
    const [editGh, setEditGh] = useState(null);
    const [slotStruct, setSlotStruct] = useState(null);
    const [showSlot, setShowSlot] = useState(false);
    const [editSlot, setEditSlot] = useState(null);
    const [editSlotForm, setEditSlotForm] = useState(null);
    const [tempVal, setTempVal] = useState("");
    const [humVal, setHumVal]   = useState("");
    const [slotForm, setSlotForm] = useState({ name:"", label:"", type:"greenhouse_pot", rows:"4", cols:"6", row_count:"", spacing_cm:"", plant_count:"", row_length_m:"", orientation:"horizontal", notes:"" });
    const greenhousePlantsCount = allPlants.filter(p => p.struct_id || p.slot_id).reduce((sum, p) => sum + Math.max(1, +p.quantity || 1), 0);
    const totalSlots = structSlots.length;
    const ventilatedCount = structures.filter(s => s.ventilated).length;
    useEffect(() => {
        if (editGh) { setTempVal(editGh.temperature||""); setHumVal(editGh.humidity||""); }
    }, [editGh]);
    const saveGhMeta = () => {
        if (!editGh) return;
        dispatch({ type:"UPDATE_STRUCT", payload:{...editGh, temperature:tempVal, humidity:humVal} });
        setEditGh(null);
    };
    const toggleVent = (st) => dispatch({ type:"UPDATE_STRUCT", payload:{...st, ventilated:!st.ventilated} });
    const openEditSlot = (slot) => {
        setEditSlot(slot);
        setEditSlotForm({
            name: slot.name || "",
            label: slot.label || "",
            rows: String(slot.rows || 4),
            cols: String(slot.cols || 6),
            row_count: String(slot.row_count || 1),
            spacing_cm: slot.spacing_cm ? String(slot.spacing_cm) : "",
            plant_count: slot.plant_count ? String(slot.plant_count) : "",
            row_length_m: slot.row_length_m ? String(slot.row_length_m) : "",
            orientation: slot.orientation || "horizontal",
            notes: slot.notes || "",
        });
    };
    const saveEditSlot = () => {
        if (!editSlot || !editSlotForm?.name.trim()) return;
        const next = {
            ...editSlot,
            name: editSlotForm.name.trim(),
            label: (editSlotForm.label || editSlotForm.name).trim(),
            notes: editSlotForm.notes || "",
        };
        if (editSlot.type === "greenhouse_tray") {
            next.rows = Math.max(1, +editSlotForm.rows || 4);
            next.cols = Math.max(1, +editSlotForm.cols || 6);
        }
        if (editSlot.type === "tunnel_row" || editSlot.type === "bed_row") {
            next.row_count = Math.max(1, +editSlotForm.row_count || 1);
            next.spacing_cm = Math.max(0, +editSlotForm.spacing_cm || 0);
            next.plant_count = Math.max(0, +editSlotForm.plant_count || 0);
            next.row_length_m = Math.max(0, +editSlotForm.row_length_m || 0);
            next.orientation = editSlotForm.orientation || "horizontal";
        }
        dispatch({ type:"UPDATE_SLOT", payload: next });
        setEditSlot(null);
        setEditSlotForm(null);
    };
    const openSlotModal = (st) => {
        const nextType = st.type === "tunnel_greenhouse" ? "tunnel_row" : "greenhouse_pot";
        const count = structSlots.filter(s => s.parent_id===st.id && s.type===nextType).length + 1;
        setSlotStruct(st);
        const defaultType = st.type === "tunnel_greenhouse" ? "tunnel_row" : "greenhouse_pot";
        setSlotForm({
            name: defaultType === "tunnel_row" ? `${st.name} Row ${count}` : `${st.name} Pot ${count}`,
            label: defaultType === "tunnel_row" ? `R${count}` : `P${count}`,
            type: defaultType,
            rows:"4",
            cols:"6",
            row_count: defaultType === "tunnel_row" ? "4" : "",
            spacing_cm:"",
            plant_count:"",
            row_length_m:"",
            orientation:"horizontal",
            notes:"",
        });
        setShowSlot(true);
    };
    const createSlot = () => {
        if (!slotStruct || !slotForm.name.trim()) return;
        const trayId = gid();
        const common = {
            garden_id: slotStruct.garden_id,
            parent_type: "struct",
            parent_id: slotStruct.id,
            name: slotForm.name.trim(),
            label: (slotForm.label || slotForm.name).trim(),
            type: slotForm.type,
            notes: slotForm.notes || "",
        };
        const extra = {};
        if (slotForm.type === "greenhouse_tray") {
            extra.rows = +slotForm.rows || 4;
            extra.cols = +slotForm.cols || 6;
        }
        if (slotForm.type === "tunnel_row" || slotForm.type === "bed_row") {
            extra.row_count = +slotForm.row_count || 1;
            extra.spacing_cm = +slotForm.spacing_cm || 0;
            extra.plant_count = +slotForm.plant_count || 0;
            extra.row_length_m = +slotForm.row_length_m || 0;
            extra.orientation = slotForm.orientation || "horizontal";
        }
        dispatch({ type:"ADD_SLOT", payload:{ id:slotForm.type==="greenhouse_tray" ? trayId : gid(), ...common, ...extra } });
        if (slotForm.type === "greenhouse_tray") {
            const rows = Math.max(1, +slotForm.rows || 4);
            const cols = Math.max(1, +slotForm.cols || 6);
            const trayCells = [];
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    trayCells.push({
                        id: gid(),
                        garden_id: slotStruct.garden_id,
                        parent_type: "slot",
                        parent_id: trayId,
                        name: `Cell ${r + 1}-${c + 1}`,
                        label: `R${r + 1}C${c + 1}`,
                        type: "tray_cell",
                        notes: "",
                        row_index: r,
                        col_index: c,
                    });
                }
            }
            trayCells.forEach(cell => dispatch({ type:"ADD_SLOT", payload: cell }));
        }
        setShowSlot(false);
        setSlotStruct(null);
        setSlotForm({ name:"", label:"", type:"greenhouse_pot", rows:"4", cols:"6", row_count:"", spacing_cm:"", plant_count:"", row_length_m:"", orientation:"horizontal", notes:"" });
    };
    return (
        <PageShell width={1040}>
            <PageHeader
                title={`🏡 ${t("greenhouses")}`}
                subtitle={`${structures.length} structures across ${gardens.length} gardens`}
                meta={[
                    <MetaBadge key="gardens" value={gardens.length} label={t("gardens")} />,
                    <MetaBadge key="structures" value={structures.length} label={t("greenhouses")} />
                ]}
                actions={[<Btn key="editor" variant="secondary" onClick={()=>navigate("editor")}>{t("nav_editor")}</Btn>]}
            />
            <PanelGroup>
                <StatCard icon="🏡" label="Structures" value={structures.length} color={T.primary} sub={`${gardens.length} gardens`} />
                <StatCard icon="🫙" label="Slots" value={totalSlots} color="#558B2F" sub="Trays / Rows / Pots" />
                <StatCard icon="🌱" label="GH Plants" value={greenhousePlantsCount} color="#388E3C" sub="Inside structures" />
                <StatCard icon="🌬️" label="Ventilated" value={`${ventilatedCount}/${structures.length}`} color={ventilatedCount===structures.length?T.success:T.warning} sub="vents open" />
            </PanelGroup>
            {structures.length===0 ? (
                <SectionPanel title={t("greenhouses")} subtitle={t("no_greenhouses")} action={<Btn size="sm" variant="primary" onClick={()=>navigate("editor")}>{t("nav_editor")}</Btn>}>
                    <EmptyState icon="🏡" title={t("no_greenhouses")} subtitle={t("no_gh_sub")} />
                </SectionPanel>
            ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
                        {structures.map(st => {
                            const garden = gardens.find(g=>g.id===st.garden_id);
                            const linkedField = allFields.find(f => f.id===st.linked_field_id);
                            const insideBeds = allFields.filter(f => f.garden_id===st.garden_id && isInsideGH(f,st));
                            const insidePlants = allPlants.filter(p => insideBeds.some(b=>b.id===p.field_id));
                            const structPlants = allPlants.filter(p => p.struct_id===st.id);
                            const structDirectSlots = structSlots.filter(s => s.parent_id===st.id);
                            const trayChildren = allSlots.filter(s => s.parent_type==="slot" && structDirectSlots.some(d => d.id===s.parent_id));
                            const greenhouseSlotIds = new Set([...structDirectSlots.map(s=>s.id), ...trayChildren.map(s=>s.id)]);
                            const allGreenhousePlants = [...insidePlants, ...structPlants, ...allPlants.filter(p => greenhouseSlotIds.has(p.slot_id))];
                            const greenhousePlantQty = allGreenhousePlants.reduce((sum, p) => sum + Math.max(1, +p.quantity || 1), 0);
                            const slotCount = structDirectSlots.length;
                            const trayChildrenByParent = trayChildren.reduce((acc, slot) => {
                                (acc[slot.parent_id] ||= []).push(slot);
                                return acc;
                            }, {});
                            const isTunnel = st.type==="tunnel_greenhouse";
                            const stroke = STRUCT_STROKE[st.type]||"#00838F";
                            return (
                                <Card key={st.id} style={{ overflow:"hidden" }}>
                                    {/* Header stripe */}
                                    <div style={{ height:4, background:stroke }}/>
                                    <div style={{ padding:"16px 20px" }}>
                                        <div style={{ display:"flex", alignItems:"flex-start", gap:14, marginBottom:16 }}>
                                        <div style={{ width:52, height:52, borderRadius:T.r, background:STRUCT_FILL[st.type]||"rgba(0,131,143,0.15)", border:`2px solid ${stroke}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, flexShrink:0 }}>
                                            {isTunnel?"⛺":"🏡"}
                                        </div>
                                        <div style={{ flex:1 }}>
                                            <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                                                <h2 style={{ margin:0, fontSize:18, fontWeight:800, color:T.text, fontFamily:"Fraunces, serif" }}>{st.name}</h2>
                                                <Badge color={stroke} bg={stroke+"20"}>{t(STRUCT_LABEL_K[st.type])||st.type}</Badge>
                                                {garden && <Badge color={T.textSub} bg={T.surfaceAlt}>{garden.name}</Badge>}
                                                {linkedField && <Badge color={T.accent} bg={T.accentBg}>🔗 {linkedField.name}</Badge>}
                                            </div>
                                            <div style={{ fontSize:12, color:T.textMuted, marginTop:4 }}>{st.width}m × {st.height}m = {(st.width*st.height).toFixed(1)}m² · Position ({st.x}m, {st.y}m)</div>
                                            {st.notes && <div style={{ fontSize:12, color:T.textSub, marginTop:4, lineHeight:1.5 }}>{st.notes}</div>}
                                        </div>
                                        {/* Ventilation toggle */}
                                        <button onClick={()=>toggleVent(st)} style={{ padding:"8px 16px", borderRadius:T.rs, border:`2px solid ${st.ventilated?T.success:T.textMuted}`, background:st.ventilated?T.successBg:T.surfaceAlt, color:st.ventilated?T.success:T.textMuted, cursor:"pointer", fontFamily:"inherit", fontWeight:700, fontSize:12, transition:"all 0.15s", flexShrink:0, whiteSpace:"nowrap" }}>
                                            {st.ventilated ? t("ventilated") : t("closed")}
                                        </button>
                                        </div>
                                        <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:12 }}>
                                            <Badge color={T.textSub} bg={T.surfaceAlt}>{greenhousePlantQty} plants</Badge>
                                            <Badge color={T.textSub} bg={T.surfaceAlt}>{slotCount} slots</Badge>
                                            <Badge color={st.ventilated?T.success:T.warning} bg={st.ventilated?T.successBg:T.warningBg}>{st.ventilated ? t("ventilated") : t("closed")}</Badge>
                                        </div>
                                        {/* Climate row */}
                                        <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap" }}>
                                            <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 14px", background:T.surfaceAlt, borderRadius:T.rs, flex:1, minWidth:180 }}>
                                            <span style={{ fontSize:18 }}>🌡️</span>
                                            <div style={{ flex:1 }}>
                                                <div style={{ fontSize:10, fontWeight:700, color:T.textMuted, textTransform:"uppercase", letterSpacing:0.5 }}>{t("temp")}</div>
                                                <div style={{ fontSize:14, fontWeight:700, color:T.text }}>{st.temperature||"—"}</div>
                                            </div>
                                            <Btn size="sm" variant="ghost" onClick={()=>setEditGh(st)}>Edit</Btn>
                                        </div>
                                        <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 14px", background:T.surfaceAlt, borderRadius:T.rs, flex:1, minWidth:180 }}>
                                            <span style={{ fontSize:18 }}>💧</span>
                                            <div style={{ flex:1 }}>
                                                <div style={{ fontSize:10, fontWeight:700, color:T.textMuted, textTransform:"uppercase", letterSpacing:0.5 }}>{t("humidity")}</div>
                                                <div style={{ fontSize:14, fontWeight:700, color:T.text }}>{st.humidity ? `${st.humidity}%` : "—"}</div>
                                            </div>
                                        </div>
                                        <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 14px", background:T.surfaceAlt, borderRadius:T.rs }}>
                                            <span style={{ fontSize:18 }}>🛏️</span>
                                            <div>
                                                <div style={{ fontSize:10, fontWeight:700, color:T.textMuted, textTransform:"uppercase", letterSpacing:0.5 }}>{t("inside_beds")}</div>
                                                <div style={{ fontSize:14, fontWeight:700, color:T.primary }}>{insideBeds.length}</div>
                                            </div>
                                        </div>
                                        <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 14px", background:T.surfaceAlt, borderRadius:T.rs }}>
                                            <span style={{ fontSize:18 }}>🫙</span>
                                            <div>
                                                <div style={{ fontSize:10, fontWeight:700, color:T.textMuted, textTransform:"uppercase", letterSpacing:0.5 }}>Pots / Trays / Rows</div>
                                            <div style={{ fontSize:14, fontWeight:700, color:T.primary }}>{structDirectSlots.length}</div>
                                        </div>
                                    </div>
                                </div>
                                    {structDirectSlots.length>0 && (
                                        <div style={{ marginBottom:12 }}>
                                            <div style={{ fontSize:12, fontWeight:700, color:T.textSub, marginBottom:8, textTransform:"uppercase", letterSpacing:0.5 }}>🫙 Pots, Trays & Rows</div>
                                            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                                                {structDirectSlots.map(slot => {
                                                    const slotPlants = allPlants.filter(p => p.slot_id===slot.id);
                                                    const slotPlantQty = slotPlants.reduce((sum, p) => sum + Math.max(1, +p.quantity || 1), 0);
                                                    const isTray = slot.type === "greenhouse_tray";
                                                    const trayCellsForSlot = trayChildrenByParent[slot.id] || [];
                                                    return (
                                                        <div key={slot.id} style={{ padding:"8px 12px", background:T.surfaceAlt, border:`1px solid ${T.border}`, borderRadius:T.rs, minWidth:isTray?260:170, flex:"1 1 240px" }}>
                                                            <div style={{ display:"flex", alignItems:"start", justifyContent:"space-between", gap:8 }}>
                                                                <div>
                                                                    <div style={{ fontSize:13, fontWeight:700, color:T.text }}>{slotDisplayLabel(slot, allSlots)}</div>
                                                                    <div style={{ fontSize:11, color:T.textMuted }}>{slotTypeLabel(slot, t)}{isTray && slot.rows && slot.cols ? ` · ${slot.rows} x ${slot.cols}` : ""}{(slot.type==="tunnel_row"||slot.type==="bed_row") && slot.spacing_cm ? ` · ${slot.spacing_cm}cm spacing` : ""}{(slot.type==="tunnel_row"||slot.type==="bed_row") && slot.plant_count ? ` · ${slot.plant_count} plants` : ""}</div>
                                                                    <div style={{ fontSize:11, color:T.textSub, marginTop:2 }}>{slotPlantQty} plant{slotPlantQty!==1?"s":""}</div>
                                                                </div>
                                                                <div style={{ display:"flex", gap:6, flexWrap:"wrap", justifyContent:"flex-end" }}>
                                                                    {(slot.type==="tunnel_row" || slot.type==="bed_row") && (
                                                                        <Btn
                                                                            size="sm"
                                                                            variant="secondary"
                                                                            onClick={() => dispatch({ type:"UPDATE_SLOT", payload:{ ...slot, orientation: slot.orientation === "vertical" ? "horizontal" : "vertical" } })}
                                                                        >
                                                                            Rotate 90?
                                                                        </Btn>
                                                                    )}
                                                                    <Btn size="sm" variant="ghost" onClick={()=>openEditSlot(slot)}>Edit</Btn>
                                                                </div>
                                                            </div>
                                                            {isTray && trayCellsForSlot.length>0 && (
                                                                <div style={{ marginTop:8, display:"grid", gridTemplateColumns:`repeat(${slot.cols || 6}, minmax(0, 1fr))`, gap:4 }}>
                                                                    {trayCellsForSlot.sort((a,b)=>(a.row_index-b.row_index)||(a.col_index-b.col_index)).map(cell => {
                                                                        const cellPlants = allPlants.filter(p => p.slot_id===cell.id);
                                                                        return (
                                                                            <div key={cell.id} style={{ border:`1px solid ${T.border}`, borderRadius:6, padding:"6px 5px", background:T.surface, minHeight:42, display:"flex", flexDirection:"column", gap:3 }}>
                                                                                <div style={{ fontSize:9, fontWeight:800, color:T.textMuted }}>{cell.label}</div>
                                                                                <div style={{ fontSize:10, color:T.textSub, lineHeight:1.2 }}>{cellPlants.length ? `${cellPlants.length} plant${cellPlants.length!==1?"s":""}` : "empty"}</div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            )}
                                                            {(slot.type==="tunnel_row"||slot.type==="bed_row") && renderSlotSeedPlan(slot)}
                                                            {slotPlants.length>0 && (
                                                                <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginTop:5 }}>
                                                                    {slotPlants.map(p => <Badge key={p.id} color={STATUS_CFG[p.status]?.color||T.textSub} bg={STATUS_CFG[p.status]?.bg||T.surfaceAlt}>{CAT_ICONS[p.category]||"🌿"} {p.name} · ×{Math.max(1, +p.quantity || 1)}</Badge>)}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                    {/* Inside beds */}
                                    {insideBeds.length>0 && (
                                        <div style={{ marginBottom:12 }}>
                                            <div style={{ fontSize:12, fontWeight:700, color:T.textSub, marginBottom:8, textTransform:"uppercase", letterSpacing:0.5 }}>🛏️ {t("inside_beds")}</div>
                                            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                                                {insideBeds.map(bed => {
                                                    const fc=FIELD_COLORS[bed.type]||T.primary;
                                                    const bp=insidePlants.filter(p=>p.field_id===bed.id);
                                                    return (
                                                        <div key={bed.id} style={{ padding:"8px 12px", background:fc+"12", border:`1.5px solid ${fc}`, borderRadius:T.rs, minWidth:160 }}>
                                                            <div style={{ fontSize:13, fontWeight:700, color:T.text }}>{bed.name}</div>
                                                            <div style={{ fontSize:11, color:T.textMuted }}>{bed.width}m × {bed.height}m · {LANG[lang]?.[FIELD_LABEL_K[bed.type]]||bed.type}</div>
                                                            {bp.length>0 && (
                                                                <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginTop:5 }}>
                                                                    {bp.map(p => <Badge key={p.id} color={STATUS_CFG[p.status]?.color||T.textSub} bg={STATUS_CFG[p.status]?.bg||T.surfaceAlt}>{CAT_ICONS[p.category]||"🌿"} {p.name}</Badge>)}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                    {/* Inside plants summary */}
                                    {allGreenhousePlants.length>0 && (
                                        <div>
                                            <div style={{ fontSize:12, fontWeight:700, color:T.textSub, marginBottom:8, textTransform:"uppercase", letterSpacing:0.5 }}>🌱 {t("inside_plants")} ({greenhousePlantQty})</div>
                                            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                                                {allGreenhousePlants.map(p => {
                                                    const sc_=STATUS_CFG[p.status]||STATUS_CFG.planned;
                                                    const sc_l=t(STATUS_K[p.status])||p.status;
                                                    const slot=allSlots.find(s => s.id===p.slot_id);
                                                    return (
                                                        <div key={p.id} style={{ padding:"6px 10px", background:T.surface, border:`1px solid ${T.border}`, borderRadius:T.rs, display:"flex", alignItems:"center", gap:6 }}>
                                                            <span style={{ fontSize:16 }}>{CAT_ICONS[p.category]||"🌿"}</span>
                                                            <div>
                                                                <div style={{ fontSize:12, fontWeight:700, color:T.text }}>{p.name}</div>
                                                                <div style={{ fontSize:10, color:T.textMuted }}>{p.variety} · ×{Math.max(1, +p.quantity || 1)}{slot ? ` · ${slot.name}` : ""}{p.row_count ? ` · ${p.row_count} rows` : ""}{p.row_plant_count ? ` · ${p.row_plant_count}/row` : ""}</div>
                                                            </div>
                                                            <Badge color={sc_.color} bg={sc_.bg} style={{fontSize:9}}>{sc_l}</Badge>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                    {insideBeds.length===0 && (
                                        <div style={{ padding:"12px 16px", background:T.surfaceAlt, borderRadius:T.rs, fontSize:12, color:T.textMuted, textAlign:"center" }}>
                                            No beds detected inside this {isTunnel?"tunnel":"greenhouse"}. Move or resize beds in the Garden Editor to place them inside.
                                        </div>
                                    )}
                                    {/* Actions */}
                                    <div style={{ display:"flex", gap:8, marginTop:14, flexWrap:"wrap" }}>
                                        <Btn size="sm" variant="secondary" onClick={()=>openSlotModal(st)}>🫙 Add {isTunnel ? "Row" : "Pot / Tray / Row"}</Btn>
                                        <Btn size="sm" variant="primary" onClick={()=>{ dispatch({type:"SET_ACTIVE_GARDEN",payload:st.garden_id}); navigate("editor"); }}>📐 {t("nav_editor")}</Btn>
                                        <Btn size="sm" variant={st.ventilated?"ghost":"success"} onClick={()=>toggleVent(st)}>
                                            {st.ventilated ? `🔒 ${t("close_vents")}` : `🌬️ ${t("ventilate")}`}
                                        </Btn>
                                        <Btn size="sm" variant="secondary" onClick={()=>setEditGh(st)}>🌡️ Log Climate</Btn>
                                        <Btn size="sm" variant="danger" onClick={()=>{ if(window.confirm(t("delete_struct"))) dispatch({type:"DELETE_STRUCT",payload:st.id}); }}>✕ {t("delete")}</Btn>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
            {showSlot && slotStruct && (
            <Modal title={`🫙 Add ${slotStruct.type==="tunnel_greenhouse" ? "Row" : "Pot"} In ${slotStruct.name}`} onClose={()=>{ setShowSlot(false); setSlotStruct(null); setSlotForm({ name:"", label:"", type:"greenhouse_pot", rows:"4", cols:"6", row_count:"", spacing_cm:"", plant_count:"", row_length_m:"", orientation:"horizontal", notes:"" }); }}>
                    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                        <InfoBanner icon="🫙">
                            {slotStruct.type==="tunnel_greenhouse"
                                ? "Tunnel layouts work best as rows. Add row counts, spacing and plants per row."
                                : "Pots, trays, tables and rows are optional internal locations inside a greenhouse."}
                        </InfoBanner>
                        <FormRow cols={2}>
                            <Input label="Name" value={slotForm.name} onChange={v=>setSlotForm(f=>({...f,name:v}))} placeholder="e.g. Tomato Pot Bench" required/>
                            <Input label="Label" value={slotForm.label} onChange={v=>setSlotForm(f=>({...f,label:v}))} placeholder="P1" required/>
                        </FormRow>
                        {slotStruct.type==="tunnel_greenhouse" ? (
                            <Input label="Type" value="Row" disabled />
                        ) : (
                            <Sel label="Type" value={slotForm.type} onChange={v=>setSlotForm(f=>({...f,type:v}))} options={[
                                { value:"greenhouse_pot", label:"Pot" },
                                { value:"greenhouse_tray", label:"Tray" },
                                { value:"greenhouse_table", label:"Table" },
                            ]}/>
                        )}
                        {(slotForm.type==="greenhouse_tray") && (
                            <FormRow cols={2}>
                                <Input label="Rows" value={slotForm.rows} onChange={v=>setSlotForm(f=>({...f,rows:v}))} type="number" min="1" max="24" required/>
                                <Input label="Cols" value={slotForm.cols} onChange={v=>setSlotForm(f=>({...f,cols:v}))} type="number" min="1" max="24" required/>
                            </FormRow>
                        )}
                        {(slotStruct.type==="tunnel_greenhouse" || slotForm.type==="tunnel_row" || slotForm.type==="bed_row") && (
                            <>
                                <FormRow cols={4}>
                                    <Input label="Rows" value={slotForm.row_count} onChange={v=>setSlotForm(f=>({...f,row_count:v}))} type="number" min="1" max="24" placeholder="4"/>
                                    <Input label="Spacing (cm)" value={slotForm.spacing_cm} onChange={v=>setSlotForm(f=>({...f,spacing_cm:v}))} type="number" min="1" max="200" placeholder="35"/>
                                    <Input label="Plants" value={slotForm.plant_count} onChange={v=>setSlotForm(f=>({...f,plant_count:v}))} type="number" min="1" max="1000" placeholder="24"/>
                                    <Sel label="Orientation" value={slotForm.orientation || "horizontal"} onChange={v=>setSlotForm(f=>({...f,orientation:v}))} options={[{ value:"horizontal", label:"Horizontal" }, { value:"vertical", label:"Vertical (90°)" }]} />
                                </FormRow>
                                <Input label="Row length (m)" value={slotForm.row_length_m} onChange={v=>setSlotForm(f=>({...f,row_length_m:v}))} type="number" min="0.1" max="100" placeholder="8.4"/>
                            </>
                        )}
                        <Textarea label={t("notes")} value={slotForm.notes} onChange={v=>setSlotForm(f=>({...f,notes:v}))} rows={2}/>
                        <FormActions onCancel={()=>{ setShowSlot(false); setSlotStruct(null); setSlotForm({ name:"", label:"", type:"greenhouse_pot", rows:"4", cols:"6", row_count:"", spacing_cm:"", plant_count:"", row_length_m:"", orientation:"horizontal", notes:"" }); }} onSave={createSlot} saveLabel="Add Pot" t={t}/>
                    </div>
                </Modal>
            )}
            {editSlot && editSlotForm && (
                <Modal title={`✏️ Edit ${editSlot.name}`} onClose={()=>{ setEditSlot(null); setEditSlotForm(null); }}>
                    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                        <InfoBanner icon="ℹ️">This edits an existing slot. Row count and spacing control the scale preview only for row-based slots.</InfoBanner>
                        <FormRow cols={2}>
                            <Input label="Name" value={editSlotForm.name} onChange={v=>setEditSlotForm(f=>({...f,name:v}))} required/>
                            <Input label="Label" value={editSlotForm.label} onChange={v=>setEditSlotForm(f=>({...f,label:v}))} required/>
                        </FormRow>
                        <Input label="Type" value={slotTypeLabel(editSlot, t)} disabled/>
                        {editSlot.type === "greenhouse_tray" && (
                            <FormRow cols={2}>
                                <Input label="Rows" value={editSlotForm.rows} onChange={v=>setEditSlotForm(f=>({...f,rows:v}))} type="number" min="1" max="24"/>
                                <Input label="Cols" value={editSlotForm.cols} onChange={v=>setEditSlotForm(f=>({...f,cols:v}))} type="number" min="1" max="24"/>
                            </FormRow>
                        )}
                        {(editSlot.type === "tunnel_row" || editSlot.type === "bed_row") && (
                            <>
                                <FormRow cols={4}>
                                    <Input label="Rows" value={editSlotForm.row_count} onChange={v=>setEditSlotForm(f=>({...f,row_count:v}))} type="number" min="1" max="24"/>
                                    <Input label="Spacing (cm)" value={editSlotForm.spacing_cm} onChange={v=>setEditSlotForm(f=>({...f,spacing_cm:v}))} type="number" min="1" max="200"/>
                                    <Input label="Plants" value={editSlotForm.plant_count} onChange={v=>setEditSlotForm(f=>({...f,plant_count:v}))} type="number" min="0" max="1000"/>
                                    <Sel label="Orientation" value={editSlotForm.orientation || "horizontal"} onChange={v=>setEditSlotForm(f=>({...f,orientation:v}))} options={[{ value:"horizontal", label:"Horizontal" }, { value:"vertical", label:"Vertical (90°)" }]} />
                                </FormRow>
                                <Input label="Row length (m)" value={editSlotForm.row_length_m} onChange={v=>setEditSlotForm(f=>({...f,row_length_m:v}))} type="number" min="0.1" max="100"/>
                                {renderSlotSeedPlan({ ...editSlot, ...editSlotForm, row_count: editSlotForm.row_count, spacing_cm: editSlotForm.spacing_cm, plant_count: editSlotForm.plant_count, row_length_m: editSlotForm.row_length_m })}
                            </>
                        )}
                        <Textarea label={t("notes")} value={editSlotForm.notes} onChange={v=>setEditSlotForm(f=>({...f,notes:v}))} rows={2}/>
                        <FormActions onCancel={()=>{ setEditSlot(null); setEditSlotForm(null); }} onSave={saveEditSlot} saveLabel={t("save")} t={t}/>
                    </div>
                </Modal>
            )}
            {editGh && (
                <Modal title={`🌡️ Climate Log — ${editGh.name}`} onClose={()=>setEditGh(null)} width={400}>
                    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                        <Input label={`🌡️ ${t("temp")} (e.g. 22°C)`} value={tempVal} onChange={setTempVal} placeholder="22°C"/>
                        <Input label={`💧 ${t("humidity")} (0-100%)`} value={humVal} onChange={setHumVal} type="number" min="0" max="100" placeholder="65"/>
                        <FormActions onCancel={()=>setEditGh(null)} onSave={saveGhMeta} saveLabel={t("save")} t={t}/>
                    </div>
                </Modal>
            )}
        </PageShell>
    );
}

// ----
// SCREEN: SETTINGS
// ----
function SettingsScreen({ state, dispatch, lang }) {
    const t = useT(lang);
    const uid = state.activeUserId;
    const activeUser = state.users.find(u=>u.id===uid);
    const [weatherForm, setWeatherForm] = useState({
        location_name: "",
        latitude: "",
        longitude: "",
        sms_phone: "",
        sms_alerts_enabled: false,
    });
    const [weather, setWeather] = useState(null);
    const [weatherLoading, setWeatherLoading] = useState(false);
    const [weatherError, setWeatherError] = useState("");
    useEffect(() => {
        const settings = activeUser?.settings || {};
        setWeatherForm({
            location_name: settings.weather_location_name || "",
            latitude: settings.weather_latitude || "",
            longitude: settings.weather_longitude || "",
            sms_phone: settings.sms_phone || "",
            sms_alerts_enabled: Boolean(settings.sms_alerts_enabled),
        });
    }, [activeUser]);
    const exportData = () => {
        const blob = new Blob([JSON.stringify(state,null,2)],{type:"application/json"});
        const a = document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="gardengrid-export.json"; a.click();
    };
    const resetData = async () => {
        if (window.confirm(t("reset_confirm"))) {
            await resetState();
            window.location.reload();
        }
    };
    const refreshWeather = useCallback(async (latitude = weatherForm.latitude, longitude = weatherForm.longitude) => {
        if (!latitude || !longitude) return;
        setWeatherLoading(true);
        setWeatherError("");
        try {
            const data = await apiJson(`/api/weather.php?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}`);
            setWeather(data);
        } catch {
            setWeatherError("Weather data could not be loaded.");
        } finally {
            setWeatherLoading(false);
        }
    }, [weatherForm.latitude, weatherForm.longitude]);
    useEffect(() => {
        if (weatherForm.latitude && weatherForm.longitude) {
            refreshWeather(weatherForm.latitude, weatherForm.longitude);
        } else {
            setWeather(null);
        }
    }, [weatherForm.latitude, weatherForm.longitude, refreshWeather]);
    const saveWeatherSettings = () => {
        dispatch({
            type:"SET_SETTING",
            payload:{
                weather_location_name: weatherForm.location_name.trim(),
                weather_latitude: weatherForm.latitude.trim(),
                weather_longitude: weatherForm.longitude.trim(),
                sms_phone: weatherForm.sms_phone.trim(),
                sms_alerts_enabled: weatherForm.sms_alerts_enabled,
            }
        });
    };
    const LANGS = [["en","🇬🇧","English"],["nl","🇧🇪","Nederlands"],["fr","🇫🇷","Français"],["de","🇩🇪","Deutsch"]];
    return (
        <div style={{ padding:28, maxWidth:640, margin:"0 auto" }}>
            <h1 style={{ margin:"0 0 24px", fontSize:24, fontWeight:900, fontFamily:"Fraunces, serif", color:T.text }}>⚙️ {t("nav_settings")}</h1>
            <Card style={{ marginBottom:16 }}>
                <div style={{ padding:"14px 18px 12px", borderBottom:`1px solid ${T.border}` }}>
                    <h2 style={{ margin:0, fontSize:14, fontWeight:800, color:T.text, fontFamily:"Fraunces, serif" }}>🌍 {t("language")}</h2>
                </div>
                <div style={{ padding:18, display:"flex", flexDirection:"column", gap:8 }}>
                    {LANGS.map(([code,flag,name]) => (
                        <label key={code} style={{ display:"flex", alignItems:"center", gap:12, cursor:"pointer", padding:"11px 14px", borderRadius:T.rs, background:lang===code?T.primaryBg:T.surface, border:`1.5px solid ${lang===code?T.primary:T.border}`, transition:"all 0.15s" }}>
                            <input type="radio" name="lang" checked={lang===code} onChange={()=>dispatch({type:"SET_SETTING",payload:{lang:code}})} style={{ accentColor:T.primary }}/>
                            <span style={{ fontSize:18 }}>{flag}</span>
                            <span style={{ fontSize:13, fontWeight:700, color:lang===code?T.primary:T.text, flex:1 }}>{name}</span>
                            <Badge color={lang===code?T.success:T.textMuted} bg={lang===code?T.successBg:T.surfaceAlt}>{lang===code?"Active":"✓"}</Badge>
                        </label>
                    ))}
                </div>
            </Card>
            <Card style={{ marginBottom:16 }}>
                <div style={{ padding:"14px 18px 12px", borderBottom:`1px solid ${T.border}` }}>
                    <h2 style={{ margin:0, fontSize:14, fontWeight:800, color:T.text, fontFamily:"Fraunces, serif" }}>👥 {t("your_profile")}</h2>
                </div>
                <div style={{ padding:18 }}>
                    <div style={{ display:"flex", gap:14, alignItems:"center", marginBottom:16 }}>
                        <div style={{ width:52, height:52, borderRadius:99, background:activeUser?.color||T.primary, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, flexShrink:0 }}>{activeUser?.avatar||"🌱"}</div>
                        <div><div style={{ fontSize:16, fontWeight:800, color:T.text }}>{activeUser?.name||"User"}</div><div style={{ fontSize:12, color:T.textMuted }}>{forUser(state.gardens,uid).length} gardens · {forUser(state.plants,uid).length} plants · {forUser(state.tasks,uid).filter(t2=>t2.status==="pending").length} pending tasks</div></div>
                    </div>
                    <div style={{ fontSize:13, color:T.textSub }}>Manage profiles using the user switcher in the sidebar header.</div>
                </div>
            </Card>
            <Card style={{ marginBottom:16 }}>
                <div style={{ padding:"14px 18px 12px", borderBottom:`1px solid ${T.border}` }}>
                    <h2 style={{ margin:0, fontSize:14, fontWeight:800, color:T.text, fontFamily:"Fraunces, serif" }}>🌦️ Weather & Storm Alerts</h2>
                </div>
                <div style={{ padding:18, display:"flex", flexDirection:"column", gap:14 }}>
                    <FormRow cols={2}>
                        <Input label="Location name" value={weatherForm.location_name} onChange={v=>setWeatherForm(f=>({...f,location_name:v}))} placeholder="e.g. Aarschot garden"/>
                        <Input label="SMS phone" value={weatherForm.sms_phone} onChange={v=>setWeatherForm(f=>({...f,sms_phone:v}))} placeholder="+32478118430"/>
                    </FormRow>
                    <FormRow cols={2}>
                        <Input label="Latitude" value={weatherForm.latitude} onChange={v=>setWeatherForm(f=>({...f,latitude:v}))} placeholder="50.9841"/>
                        <Input label="Longitude" value={weatherForm.longitude} onChange={v=>setWeatherForm(f=>({...f,longitude:v}))} placeholder="4.8365"/>
                    </FormRow>
                    <label style={{ display:"flex", alignItems:"center", gap:10, fontSize:13, color:T.text, cursor:"pointer" }}>
                        <input type="checkbox" checked={weatherForm.sms_alerts_enabled} onChange={e=>setWeatherForm(f=>({...f,sms_alerts_enabled:e.target.checked}))} style={{ accentColor:T.primary }}/>
                        Enable SMS alerts when a storm is forecast
                    </label>
                    <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                        <Btn variant="primary" onClick={saveWeatherSettings}>Save Weather Settings</Btn>
                        <Btn variant="secondary" onClick={()=>refreshWeather()} disabled={!weatherForm.latitude || !weatherForm.longitude || weatherLoading}>
                            {weatherLoading ? "Loading..." : "Refresh Live Weather"}
                        </Btn>
                    </div>
                    <div style={{ fontSize:12, color:T.textMuted, lineHeight:1.6 }}>
                        Free live weather uses Open-Meteo. SMS alerts can be sent through an Android SMS gateway that uses your own SIM card and phone number when storm risk is detected.
                    </div>
                    {weatherError && <div style={{ background:T.dangerBg, color:T.danger, borderRadius:T.rs, padding:"9px 12px", fontSize:12 }}>{weatherError}</div>}
                    {weather?.current && (
                        <div style={{ background:T.surfaceAlt, borderRadius:T.r, padding:14, display:"flex", flexDirection:"column", gap:8 }}>
                            <div style={{ display:"flex", justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
                                <div>
                                    <div style={{ fontSize:12, color:T.textMuted }}>Current weather</div>
                                    <div style={{ fontSize:18, fontWeight:800, color:T.text }}>
                                        {weather.current.temperature_2m}°C · {WEATHER_CODE_LABELS[weather.current.weather_code] || `Code ${weather.current.weather_code}`}
                                    </div>
                                </div>
                                <div style={{ fontSize:12, color:T.textSub }}>
                                    Wind {weather.current.wind_speed_10m} km/h · Gusts {weather.current.wind_gusts_10m} km/h
                                </div>
                            </div>
                            <div style={{ fontSize:12, color:weather.storm?.active ? T.danger : T.success }}>
                                {weather.storm?.active
                                    ? `Storm warning: ${weather.storm.reason} expected around ${weather.storm.starts_at}.`
                                    : `No storm forecast right now. Max gust in forecast: ${Math.round(weather.storm?.max_gust_kmh || 0)} km/h.`}
                            </div>
                        </div>
                    )}
                </div>
            </Card>
            <Card style={{ marginBottom:16 }}>
                <div style={{ padding:"14px 18px 12px", borderBottom:`1px solid ${T.border}` }}>
                    <h2 style={{ margin:0, fontSize:14, fontWeight:800, color:T.text, fontFamily:"Fraunces, serif" }}>💾 {t("data_mgmt")}</h2>
                </div>
                <div style={{ padding:18, display:"flex", flexDirection:"column", gap:12 }}>
                    <div style={{ fontSize:13, color:T.textSub, lineHeight:1.6, background:T.surfaceAlt, borderRadius:T.rs, padding:12 }}>
                        🔒 Your garden data is now stored securely on the server in MySQL so it stays available across devices and sessions.
                    </div>
                    <div style={{ display:"flex", gap:8 }}>
                        <Btn variant="secondary" onClick={exportData} icon="📤">{t("export_backup")}</Btn>
                        <Btn variant="danger" onClick={resetData} icon="🗑️">{t("reset_all")}</Btn>
                    </div>
                    <div style={{ fontSize:11, color:T.textMuted }}>
                        {state.users.length} profiles · {state.gardens.length} gardens · {state.fields.length} beds · {state.plants.length} plants · {state.tasks.length} tasks
                    </div>
                </div>
            </Card>
            <Card>
                <div style={{ padding:24, textAlign:"center" }}>
                    <div style={{ fontSize:48, marginBottom:10 }}>🌱</div>
                    <div style={{ fontSize:20, fontWeight:900, color:T.text, fontFamily:"Fraunces, serif" }}>MyGarden</div>
                    <div style={{ fontSize:12, color:T.textMuted, marginTop:4, lineHeight:1.7 }}>
                        v2.0.0 · {t("app_subtitle")}<br/>
                        Multi-user · 4 languages · 60+ plant library<br/>
                        Greenhouse tracking · Offline-first
                    </div>
                    <div style={{ marginTop:14, display:"flex", justifyContent:"center", gap:8, flexWrap:"wrap" }}>
                        {["Multi-user","EN/NL/FR/DE","Plant Library","Greenhouse Tracker","Drag & Resize Editor"].map(f=><Badge key={f} color={T.primary} bg={T.primaryBg}>{f}</Badge>)}
                    </div>
                </div>
            </Card>
        </div>
    );
}

// ----
// SCREEN: DEV (Ollama plant generator)
// ----
const DEV_CATEGORIES = ["Vegetable","Leafy Green","Herb","Fruit","Legume","Root","Flower"];
const DEV_CATEGORY_LABEL_K = {
    Vegetable:"dev_category_vegetable",
    "Leafy Green":"dev_category_leafy_green",
    Herb:"dev_category_herb",
    Fruit:"dev_category_fruit",
    Legume:"dev_category_legume",
    Root:"dev_category_root",
    Flower:"dev_category_flower",
    Other:"dev_category_other",
};

// ----
async function callAI(prompt) {
    const res = await fetch("/api/ai.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Server error");
    return data;
}

// ----
function DevError({ msg }) {
    if (!msg) return null;
    return (
        <div style={{ background:"#FEE2E2", border:"1px solid #FCA5A5", borderRadius:T.radiusMd, padding:"12px 16px", color:"#991B1B", fontSize:13, marginBottom:16 }}>
            ❌ {msg}
        </div>
    );
}
function AiResult({ children, model }) {
    return (
        <Card style={{ padding:20, marginTop:16 }}>
            {model && <div style={{ fontSize:11, color:T.textMuted, marginBottom:10, display:"flex", alignItems:"center", gap:6 }}><span style={{ background:T.primaryBg, color:T.primary, borderRadius:99, padding:"2px 8px", fontWeight:700 }}>{model}</span></div>}
            {children}
        </Card>
    );
}

// ----
function DevCodexPlantBuilder({ lang = "en" }) {
    const t = useT(lang);
    const [category, setCategory] = useState("Vegetable");
    const [count, setCount]       = useState(8);
    const [brief, setBrief]       = useState(() => t("dev_prompt_placeholder") || "More easy-to-grow crops for a mixed kitchen garden.");
    const [varieties, setVarieties] = useState(() => t("dev_varieties_placeholder") || "Tomato, Cherry Tomato, Cluster Tomato");
    const [search, setSearch]     = useState("");
    const [library, setLibrary]   = useState([]);
    const [libraryLoading, setLibraryLoading] = useState(false);
    const [loading, setLoading]   = useState(false);
    const [result, setResult]     = useState(null);
    const [error, setError]       = useState(null);

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                setLibraryLoading(true);
                const res = await fetch("/api/plants-library.php?limit=300");
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Could not load plant library");
                if (active) setLibrary(Array.isArray(data.plants) ? data.plants : []);
            } catch (e) {
                if (active) setError(e.message);
            } finally {
                if (active) setLibraryLoading(false);
            }
        })();
        return () => { active = false; };
    }, []);

    const presets = [
        { label: t("dev_presets_easy"), text: t("dev_presets_easy_text") },
        { label: t("dev_presets_pollinators"), text: t("dev_presets_pollinators_text") },
        { label: t("dev_presets_greenhouse"), text: t("dev_presets_greenhouse_text") },
        { label: t("dev_presets_autumn"), text: t("dev_presets_autumn_text") },
    ];
    const categoryOptions = DEV_CATEGORIES.map(value => ({ value, label: t(DEV_CATEGORY_LABEL_K[value]) || value }));

    async function handleGenerate() {
        setLoading(true);
        setResult(null);
        setError(null);
        try {
            const res = await fetch("/api/generate-plants.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ count, category, prompt: `${brief}\nExisting varieties to consider: ${varieties}` }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Server error");
            setResult(data);
            const refreshed = await fetch("/api/plants-library.php?limit=300");
            const refreshedData = await refreshed.json();
            if (refreshed.ok && Array.isArray(refreshedData.plants)) {
                setLibrary(refreshedData.plants);
            }
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <div style={{ fontSize:13, color:T.textMuted, marginBottom:20, lineHeight:1.6 }}>
                {t("dev_intro")}
            </div>
            <Card style={{ padding:24, marginBottom:4 }}>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:14, alignItems:"end" }}>
                    <Sel label={t("dev_category")} value={category} onChange={v=>setCategory(v)} options={categoryOptions}/>
                    <Input label={t("dev_count")} type="number" value={count} min={1} max={30} onChange={e=>setCount(Number(e.target.value) || 1)}/>
                    <Btn variant="primary" onClick={handleGenerate} disabled={loading} style={{ minWidth:170, height:38, justifySelf:"start" }}>
                        {loading ? t("dev_generate_loading") : t("dev_generate")}
                    </Btn>
                </div>
                <div style={{ marginTop:14 }}>
                    <Input
                        label={t("dev_varieties")}
                        value={varieties}
                        onChange={setVarieties}
                        placeholder={t("dev_varieties_placeholder")}
                        hint={t("dev_varieties_hint")}
                    />
                </div>
                <div style={{ marginTop:14, display:"flex", gap:8, flexWrap:"wrap" }}>
                    {presets.map(p => (
                        <button
                            key={p.label}
                            onClick={() => setBrief(p.text)}
                            style={{
                                border:`1px solid ${T.borderSoft}`,
                                background:T.surfaceSoft,
                                color:T.text,
                                borderRadius:T.radiusRound,
                                padding:"7px 11px",
                                fontSize:12,
                                fontWeight:700,
                                cursor:"pointer",
                            }}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
                <div style={{ marginTop:14 }}>
                    <Textarea
                        label={t("dev_prompt")}
                        value={brief}
                        onChange={setBrief}
                        rows={4}
                        placeholder={t("dev_prompt_placeholder")}
                        hint={t("dev_prompt_hint")}
                    />
                </div>
            </Card>
            <Card style={{ padding:24, marginTop:16 }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, marginBottom:12 }}>
                    <div>
                        <div style={{ fontSize:16, fontWeight:900, fontFamily:"Fraunces, serif", color:T.text }}>{t("dev_library_title")}</div>
                        <div style={{ fontSize:12, color:T.textMuted }}>
                            {libraryLoading ? t("dev_library_loading") : `${library.length} ${t("dev_library_found")}`}
                        </div>
                    </div>
                    <Input label={t("dev_library_search")} value={search} onChange={setSearch} placeholder={t("dev_library_search_placeholder")} />
                </div>
                <div style={{ maxHeight:420, overflow:"auto", borderTop:`1px solid ${T.border}`, paddingTop:12 }}>
                    {library
                        .filter(p => {
                            const q = search.trim().toLowerCase();
                            if (!q) return true;
                            const hay = `${p.name} ${p.category} ${(p.varieties || []).join(" ")} ${p.description || ""}`.toLowerCase();
                            return hay.includes(q);
                        })
                        .slice(0, 80)
                        .map(item => (
                            <div key={item.id} style={{ padding:"10px 0", borderBottom:`1px solid ${T.borderLight}`, display:"flex", flexDirection:"column", gap:5 }}>
                                <div style={{ display:"flex", justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
                                    <div style={{ fontWeight:800, color:T.text }}>{item.icon || "🌱"} {item.name}</div>
                                    <Badge color={T.primary} bg={T.primaryBg}>{t(DEV_CATEGORY_LABEL_K[item.category] || item.category) || item.category}</Badge>
                                </div>
                                <div style={{ fontSize:12, color:T.textMuted, lineHeight:1.5 }}>{item.description || t("dev_library_none")}</div>
                                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                                    {(item.varieties || []).map(v => <Badge key={v} color={T.textSub} bg={T.surfaceAlt}>{v}</Badge>)}
                                </div>
                            </div>
                        ))}
                </div>
            </Card>
            <DevError msg={error}/>
            {result && (
                <AiResult model={result.model}>
                    <div style={{ fontWeight:700, marginBottom:12, color:T.primary }}>
                        ✅ {result.saved ?? 0} {t("dev_library_saved")} · {result.updated ?? 0} {t("dev_library_updated")}
                    </div>
                    {Array.isArray(result.plants) && result.plants.map((p, i) => (
                        <div key={i} style={{ padding:"8px 0", borderBottom: i < result.plants.length-1 ? `1px solid ${T.border}` : "none", fontSize:13 }}>
                            <span style={{ fontWeight:600 }}>{p.name}</span>
                            {p.description ? <span style={{ color:T.textMuted, marginLeft:8 }}>{p.description}</span> : null}
                            {p.days_to_maturity ? <span style={{ color:T.textMuted, marginLeft:8 }}>🗓 {p.days_to_maturity}d</span> : null}
                        </div>
                    ))}
                </AiResult>
            )}
        </>
    );
}

// ----
function DevGardenAdvisor({ state }) {
    const uid = state.activeUserId;
    const myPlants  = forUser(state.plants, uid);
    const myGardens = forUser(state.gardens, uid);
    const [focus, setFocus] = useState("algemeen");
    const [loading, setLoading] = useState(false);
    const [result, setResult]   = useState(null);
    const [error, setError]     = useState(null);
    const FOCI = [
        { v:"algemeen",    label:"🌿 Algemeen" },
        { v:"bemesting",   label:"🌱 Bemesting" },
        { v:"ongedierte",  label:"🐛 Plagen & ziekten" },
        { v:"seizoen",     label:"📅 Seizoensadvies" },
        { v:"watergeven",  label:"💧 Water" },
    ];

    async function handleAdvise() {
        setLoading(true); setResult(null); setError(null);
        const plantNames = myPlants.slice(0,25).map(p => `${p.name}${p.quantity>1?" (x"+p.quantity+")":""}`).join(", ") || "geen planten nog";
        const gardenDesc = myGardens.length > 0 ? myGardens.map(g=>g.name).join(", ") : "1 tuin";
        const prompt = `Je bent een ervaren Belgische tuinadviseur. Mijn tuin (${gardenDesc}) bevat momenteel deze planten: ${plantNames}.

Geef me 5 concrete, praktische tips gefocust op: ${focus}.
Wees specifiek over mijn planten waar relevant. Geen algemene flauwekul.
Antwoord in het Nederlands. Gebruik een genummerde lijst.`;
        try {
            const data = await callAI(prompt);
            setResult(data);
        } catch(e) { setError(e.message); }
        finally { setLoading(false); }
    }

    return (
        <>
            <div style={{ fontSize:13, color:T.textMuted, marginBottom:20 }}>
                AI analyseert jouw tuin ({myPlants.length} planten) en geeft gepersonaliseerd advies.
            </div>
            <Card style={{ padding:24, marginBottom:4 }}>
                <div style={{ marginBottom:14 }}>
                    <div style={{ fontSize:11, fontWeight:700, color:T.textSub, letterSpacing:0.5, textTransform:"uppercase", marginBottom:8 }}>Focus</div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                        {FOCI.map(f => (
                            <PillFilter key={f.v} value={f.label} active={focus===f.v} onClick={()=>setFocus(f.v)}/>
                        ))}
                    </div>
                </div>
                <Btn variant="primary" onClick={handleAdvise} disabled={loading || myPlants.length===0} style={{ minWidth:180 }}>
                    {loading ? "⏳ Analyseren..." : "🧠 Analyseer mijn tuin"}
                </Btn>
                {myPlants.length === 0 && <div style={{ fontSize:12, color:T.textMuted, marginTop:8 }}>Voeg eerst planten toe aan je tuin.</div>}
            </Card>
            <DevError msg={error}/>
            {result && (
                <AiResult model={result.model}>
                    <div style={{ fontSize:14, lineHeight:1.7, color:T.text, whiteSpace:"pre-wrap" }}>{result.response}</div>
                </AiResult>
            )}
        </>
    );
}

// ----
function DevCompanions({ state }) {
    const uid = state.activeUserId;
    const myPlants = forUser(state.plants, uid);
    const [plantName, setPlantName] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult]   = useState(null);
    const [error, setError]     = useState(null);

    // Autocomplete from user's plants + PLANT_LIB
    const suggestions = useMemo(() => {
        const q = plantName.toLowerCase();
        if (!q || q.length < 2) return [];
        const fromMine = myPlants.map(p=>p.name);
        const fromLib  = PLANT_LIB.map(p=>p.name);
        return [...new Set([...fromMine, ...fromLib])].filter(n => n.toLowerCase().includes(q)).slice(0,6);
    }, [plantName, myPlants]);

    async function handleCheck() {
        if (!plantName.trim()) return;
        setLoading(true); setResult(null); setError(null);
        const prompt = `Je bent een tuinexpert. Geef compagnonsplanten advies voor: ${plantName}.

Geef:
1. Top 5 GOEDE gezelschapsplanten (met korte uitleg waarom)
2. Top 3 planten om NIET naast te zetten (met korte uitleg waarom)

Antwoord in het Nederlands. Wees praktisch en bondig.`;
        try {
            const data = await callAI(prompt);
            setResult(data);
        } catch(e) { setError(e.message); }
        finally { setLoading(false); }
    }

    return (
        <>
            <div style={{ fontSize:13, color:T.textMuted, marginBottom:20 }}>
                Zoek welke planten goed samengaan (of juist niet) via AI.
            </div>
            <Card style={{ padding:24, marginBottom:4 }}>
                <div style={{ position:"relative", marginBottom:16 }}>
                    <Input
                        label="Plant"
                        value={plantName}
                        onChange={e=>setPlantName(e.target.value)}
                        placeholder="bijv. Tomaat, Wortel, Basilicum..."
                        onKeyDown={e=>{ if(e.key==="Enter") handleCheck(); }}
                    />
                    {suggestions.length > 0 && (
                        <div style={{ position:"absolute", top:"100%", left:0, right:0, background:T.surface, border:`1px solid ${T.border}`, borderRadius:T.radiusMd, boxShadow:T.shMd, zIndex:20, marginTop:2 }}>
                            {suggestions.map(s => (
                                <div key={s} onClick={()=>{ setPlantName(s); }}
                                    style={{ padding:"8px 12px", cursor:"pointer", fontSize:13, borderBottom:`1px solid ${T.borderLight}` }}
                                    onMouseEnter={e=>e.currentTarget.style.background=T.surfaceAlt}
                                    onMouseLeave={e=>e.currentTarget.style.background=T.surface}>
                                    {s}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <Btn variant="primary" onClick={handleCheck} disabled={loading || !plantName.trim()} style={{ minWidth:180 }}>
                    {loading ? "⏳ Opzoeken..." : "🌿 Check compagnons"}
                </Btn>
            </Card>
            <DevError msg={error}/>
            {result && (
                <AiResult model={result.model}>
                    <div style={{ fontSize:14, lineHeight:1.7, color:T.text, whiteSpace:"pre-wrap" }}>{result.response}</div>
                </AiResult>
            )}
        </>
    );
}

// ----
function DevSowCalendar() {
    const MONTHS = ["Januari","Februari","Maart","April","Mei","Juni","Juli","Augustus","September","Oktober","November","December"];
    const currentMonth = new Date().getMonth(); // 0-indexed
    const [month, setMonth]     = useState(String(currentMonth));
    const [extra, setExtra]     = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult]   = useState(null);
    const [error, setError]     = useState(null);

    async function handleGenerate() {
        setLoading(true); setResult(null); setError(null);
        const monthName = MONTHS[Number(month)];
        const extraPart = extra.trim() ? ` Ik focus op: ${extra}.` : "";
        const prompt = `Je bent een Belgische tuinkalender-expert (klimaatzone 8a). Maak een beknopte, praktische zaai- en tuinagenda voor de maand ${monthName}.${extraPart}

Structureer je antwoord als:
🌱 BINNENSHUIS ZAAIEN: [lijst]
🌿 BUITEN ZAAIEN / PLANTEN: [lijst]
🔄 VERPLANTEN / OOGSTEN: [lijst]
💡 TIPS VOOR ${monthName.toUpperCase()}: [2-3 praktische tips]

Antwoord in het Nederlands. Wees specifiek met plantnamen.`;
        try {
            const data = await callAI(prompt);
            setResult(data);
        } catch(e) { setError(e.message); }
        finally { setLoading(false); }
    }

    return (
        <>
            <div style={{ fontSize:13, color:T.textMuted, marginBottom:20 }}>
                Genereer een maandelijkse zaai- en tuinagenda op basis van het Belgische klimaat.
            </div>
            <Card style={{ padding:24, marginBottom:4 }}>
                <div style={{ display:"flex", gap:16, flexWrap:"wrap", alignItems:"flex-end" }}>
                    <div style={{ flex:1, minWidth:160 }}>
                        <Sel label="Maand" value={month} onChange={v=>setMonth(v)} options={MONTHS.map((m,i)=>({ value:String(i), label:m }))}/>
                    </div>
                    <div style={{ flex:2, minWidth:200 }}>
                        <Input label="Focus (optioneel)" value={extra} onChange={e=>setExtra(e.target.value)} placeholder="bijv. groenten, kruiden, exoten..."/>
                    </div>
                </div>
                <div style={{ marginTop:16 }}>
                    <Btn variant="primary" onClick={handleGenerate} disabled={loading} style={{ minWidth:180 }}>
                        {loading ? "⏳ Genereren..." : "📅 Genereer zaaiplan"}
                    </Btn>
                </div>
            </Card>
            <DevError msg={error}/>
            {result && (
                <AiResult model={result.model}>
                    <div style={{ fontSize:14, lineHeight:1.8, color:T.text, whiteSpace:"pre-wrap" }}>{result.response}</div>
                </AiResult>
            )}
        </>
    );
}

// ----
function DevFreeChat() {
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult]   = useState(null);
    const [error, setError]     = useState(null);

    async function handleSend() {
        if (!prompt.trim()) return;
        setLoading(true); setResult(null); setError(null);
        try {
            const data = await callAI(prompt + "\n\nAntwoord in het Nederlands.");
            setResult(data);
        } catch(e) { setError(e.message); }
        finally { setLoading(false); }
    }

    return (
        <>
            <div style={{ fontSize:13, color:T.textMuted, marginBottom:20 }}>
                Stel elke tuingerelateerde vraag rechtstreeks aan de AI.
            </div>
            <Card style={{ padding:24, marginBottom:4 }}>
                <Textarea
                    label="Vraag / prompt"
                    value={prompt}
                    onChange={e=>setPrompt(e.target.value)}
                    placeholder="Bijv: Wat is het verschil tussen determinante en indeterminante tomaten?"
                    rows={4}
                />
                <div style={{ marginTop:12 }}>
                    <Btn variant="primary" onClick={handleSend} disabled={loading || !prompt.trim()} style={{ minWidth:160 }}>
                        {loading ? "⏳ Nadenken..." : "💬 Vraag stellen"}
                    </Btn>
                </div>
            </Card>
            <DevError msg={error}/>
            {result && (
                <AiResult model={result.model}>
                    <div style={{ fontSize:14, lineHeight:1.7, color:T.text, whiteSpace:"pre-wrap" }}>{result.response}</div>
                </AiResult>
            )}
        </>
    );
}

// ----
function DevScreen({ state, dispatch, lang }) {
    const t = useT(lang);
    const [tab, setTab] = useState("plants");
    const TABS = [
        { id:"plants",   icon:"🌱", label:t("dev_tab_plants") },
        { id:"codex",    icon:"🧠", label:t("dev_tab_codex") },
        { id:"advisor",  icon:"🧠", label:t("dev_tab_advisor") },
        { id:"companions", icon:"🌿", label:t("dev_tab_companions") },
        { id:"calendar", icon:"📅", label:t("dev_tab_calendar") },
        { id:"chat",     icon:"💬", label:t("dev_tab_chat") },
    ];

    return (
        <div style={{ padding:"32px 24px", maxWidth:760, margin:"0 auto" }}>
            <div style={{ marginBottom:24 }}>
                <div style={{ fontSize:24, fontWeight:900, fontFamily:"Fraunces, serif", color:T.primary, marginBottom:4 }}>
                    {t("dev_ai_dashboard")}
                </div>
                <div style={{ fontSize:13, color:T.textMuted }}>{t("dev_ai_subtitle")}</div>
            </div>

            {/* Tab bar */}
            <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:24, padding:"4px", background:T.surfaceAlt, borderRadius:T.radiusMd, border:`1px solid ${T.border}` }}>
                {TABS.map(t2 => (
                    <button key={t2.id} onClick={()=>setTab(t2.id)}
                        style={{ flex:"1 1 auto", padding:"8px 12px", border:"none", borderRadius:T.radiusSm, cursor:"pointer", fontFamily:"inherit", fontSize:13, fontWeight:tab===t2.id?700:500, background:tab===t2.id?T.surface:"transparent", color:tab===t2.id?T.primary:T.textMuted, boxShadow:tab===t2.id?T.sh:"none", transition:"all 0.15s" }}>
                        {t2.icon} {t2.label}
                    </button>
                ))}
            </div>

            {tab === "plants"     && <DevCodexPlantBuilder lang={lang}/>}
            {tab === "codex"      && <DevCodexPlantBuilder lang={lang}/>}
            {tab === "advisor"    && <DevGardenAdvisor state={state}/>}
            {tab === "companions" && <DevCompanions state={state}/>}
            {tab === "calendar"   && <DevSowCalendar/>}
            {tab === "chat"       && <DevFreeChat/>}
        </div>
    );
}

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

    // Not logged in → show login screen
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
                        {screen==="editor"      && <EditorScreen      {...props}/>}
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
