<?php
/**
 * Seed script: voegt alle gangbare Belgische tuinplanten toe aan plants_library.
 * Aanroepen via: POST /api/seed-plants.php  (optioneel met {"secret":"..."}  als je dat wilt beveiligen)
 * Of via CLI: php seed-plants.php
 */

require_once __DIR__ . '/_bootstrap.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'CLI';
if ($method !== 'POST' && $method !== 'CLI') {
    respond(['error' => 'POST only'], 405);
}

$PLANTS = [

    // ── GROENTEN ───────────────────────────────────────────────────────────────
    ['name'=>'Tomaat','category'=>'Vegetable','icon'=>'🍅','sunlight'=>'full sun','water_needs'=>'medium','days_to_maturity'=>75,'hardiness_zone'=>'9',
        'varieties'=>['Gardeners Delight','Moneymaker','San Marzano','Black Cherry','Sungold','Brandywine','Roma','Tigerella','Sweet 100','Beefsteak','Yellow Pear','Green Zebra','Matina','Stupice','Coeur de Bœuf'],
        'description'=>'Veelzijdige vruchtgroente; ideaal voor de Belgische zomer in tunnel of volle grond.'],
    ['name'=>'Komkommer','category'=>'Vegetable','icon'=>'🥒','sunlight'=>'full sun','water_needs'=>'high','days_to_maturity'=>55,'hardiness_zone'=>'9',
        'varieties'=>['Marketmore','Burpless Tasty Green','Mini Munch','Crystal Apple','Passandra','Delikate','La Diva'],
        'description'=>'Snel groeiende klimplant; beste resultaten in kas of tunnel.'],
    ['name'=>'Courgette','category'=>'Vegetable','icon'=>'🥬','sunlight'=>'full sun','water_needs'=>'medium','days_to_maturity'=>50,'hardiness_zone'=>'8',
        'varieties'=>['Astia','Black Beauty','Romanesco','Patio Star','Eight Ball','Golden Delight','Tromboncino'],
        'description'=>'Productieve zomervrucht; één plant volstaat voor een gezin.'],
    ['name'=>'Pompoen','category'=>'Vegetable','icon'=>'🎃','sunlight'=>'full sun','water_needs'=>'medium','days_to_maturity'=>100,'hardiness_zone'=>'8',
        'varieties'=>['Hokkaido','Butternut','Crown Prince','Musquée de Provence','Atlantic Giant','Jack be Little','Sweet Dumpling'],
        'description'=>'Grote rankvrucht; ideaal voor de herfst.'],
    ['name'=>'Paprika','category'=>'Vegetable','icon'=>'🫑','sunlight'=>'full sun','water_needs'=>'medium','days_to_maturity'=>80,'hardiness_zone'=>'10',
        'varieties'=>['California Wonder','Yolo Wonder','Lipstick','Marconi','Mini Bell','Lamuyo','Carnival'],
        'description'=>'Warmteminnend; best in kas of beschutte plek.'],
    ['name'=>'Aubergine','category'=>'Vegetable','icon'=>'🍆','sunlight'=>'full sun','water_needs'=>'medium','days_to_maturity'=>80,'hardiness_zone'=>'10',
        'varieties'=>['Black Beauty','Listada de Gandia','Rosa Bianca','Ping Tung Long','Calliope'],
        'description'=>'Mediterrane vruchtgroente; heeft warmte nodig.'],
    ['name'=>'Sla','category'=>'Leafy Green','icon'=>'🥗','sunlight'=>'partial','water_needs'=>'medium','days_to_maturity'=>45,'hardiness_zone'=>'7',
        'varieties'=>['Butterhead','Lollo Rossa','Lollo Bionda','Feuille de Chêne','Batavia','Romaine','Little Gem','Ice Queen','Merlot'],
        'description'=>'Snelgroeiend blad; te zaaien van maart tot september.'],
    ['name'=>'Spinazie','category'=>'Leafy Green','icon'=>'🌿','sunlight'=>'partial','water_needs'=>'medium','days_to_maturity'=>40,'hardiness_zone'=>'6',
        'varieties'=>['Matador','Medania','Palco','Regiment','Viroflay','New Zealand Spinach'],
        'description'=>'Koudminnend blad; ideaal voor vroege lente en herfst.'],
    ['name'=>'Boerenkool','category'=>'Leafy Green','icon'=>'🥦','sunlight'=>'full sun','water_needs'=>'medium','days_to_maturity'=>60,'hardiness_zone'=>'6',
        'varieties'=>['Nero di Toscana','Starbor','Redbor','Westlandse Winter','Dwarf Green Curled'],
        'description'=>'Vorsthard blad; lekkerder na de eerste vorst.'],
    ['name'=>'Snijbiet','category'=>'Leafy Green','icon'=>'🌿','sunlight'=>'partial','water_needs'=>'medium','days_to_maturity'=>50,'hardiness_zone'=>'6',
        'varieties'=>['Bright Lights','Fordhook Giant','Rhubarb Chard','Rainbow Chard','White Silver 2'],
        'description'=>'Kleurrijke bladgroente; bijna het hele jaar te oogsten.'],
    ['name'=>'Andijvie','category'=>'Leafy Green','icon'=>'🥬','sunlight'=>'partial','water_needs'=>'medium','days_to_maturity'=>90,'hardiness_zone'=>'6',
        'varieties'=>['Scarola Bianca','Grobo','Fine Maraîchère','Nuance'],
        'description'=>'Licht bittere herfstgroente; geschikt voor koud weer.'],
    ['name'=>'Witlof','category'=>'Leafy Green','icon'=>'🥬','sunlight'=>'partial','water_needs'=>'low','days_to_maturity'=>150,'hardiness_zone'=>'6',
        'varieties'=>['Zoom','Metavite','Robin','Toner'],
        'description'=>'Wortel wordt getrokken en in het donker geforceerd.'],
    ['name'=>'Rucola','category'=>'Leafy Green','icon'=>'🌿','sunlight'=>'partial','water_needs'=>'medium','days_to_maturity'=>30,'hardiness_zone'=>'6',
        'varieties'=>['Selvática','Standard','Apollo','Coltivata','Dragon Tongue'],
        'description'=>'Pittig blad; snel te oogsten en door het jaar te zaaien.'],
    ['name'=>'Veldsla','category'=>'Leafy Green','icon'=>'🌿','sunlight'=>'partial','water_needs'=>'low','days_to_maturity'=>40,'hardiness_zone'=>'5',
        'varieties'=>['Vit','Trophy','Cavallo','Favor','Holandaise à Graine Dorée'],
        'description'=>'Winterhard blad; perfect voor herfst- en winteroogst.'],
    ['name'=>'Postelein','category'=>'Leafy Green','icon'=>'🌿','sunlight'=>'full sun','water_needs'=>'low','days_to_maturity'=>30,'hardiness_zone'=>'8',
        'varieties'=>['Gewone','Gouden Purslane','Winterpostelein'],
        'description'=>'Vettig blad; hittebestendig en droogteresistent.'],

    // Koolsoorten
    ['name'=>'Broccoli','category'=>'Vegetable','icon'=>'🥦','sunlight'=>'full sun','water_needs'=>'medium','days_to_maturity'=>80,'hardiness_zone'=>'6',
        'varieties'=>['Calabrese','Romanesco','Purple Sprouting','Belstar','Marathon','De Cicco'],
        'description'=>'Voedzame koolsoort; zowel hoofdkool als zijscheuten eetbaar.'],
    ['name'=>'Bloemkool','category'=>'Vegetable','icon'=>'🥦','sunlight'=>'full sun','water_needs'=>'medium','days_to_maturity'=>80,'hardiness_zone'=>'6',
        'varieties'=>['Snowball','Cheddar','Purple Cape','Graffiti','Neckarperle'],
        'description'=>'Compacte witte kool; kan ook in oranje, groen of paars.'],
    ['name'=>'Spruitjes','category'=>'Vegetable','icon'=>'🥦','sunlight'=>'full sun','water_needs'=>'medium','days_to_maturity'=>100,'hardiness_zone'=>'5',
        'varieties'=>['Jade Cross','Long Island Improved','Falstaff','Nautic','Brigitte'],
        'description'=>'Winterhard; oogsten na eerste vorst voor betere smaak.'],
    ['name'=>'Witte kool','category'=>'Vegetable','icon'=>'🥬','sunlight'=>'full sun','water_needs'=>'medium','days_to_maturity'=>90,'hardiness_zone'=>'6',
        'varieties'=>['Herfst-kool','Langedijker Bewaar','Stonehead','Kilaton','Farao'],
        'description'=>'Grote bewaarkool; ideaal voor zuurkool.'],
    ['name'=>'Rode kool','category'=>'Vegetable','icon'=>'🥬','sunlight'=>'full sun','water_needs'=>'medium','days_to_maturity'=>90,'hardiness_zone'=>'6',
        'varieties'=>['Rodynda','Lasso','Marner Lagerrot','Red Drumhead'],
        'description'=>'Kleurrijke bewaarkool; lekker als rauwkost of gestoofd.'],
    ['name'=>'Savooiekool','category'=>'Vegetable','icon'=>'🥬','sunlight'=>'full sun','water_needs'=>'medium','days_to_maturity'=>85,'hardiness_zone'=>'5',
        'varieties'=>['Wintessa','Tundra','Ormskirk Extra Late','Vertus'],
        'description'=>'Gerimpelde winterkool; vorsthard tot -15°C.'],
    ['name'=>'Paksoi','category'=>'Vegetable','icon'=>'🥬','sunlight'=>'partial','water_needs'=>'medium','days_to_maturity'=>45,'hardiness_zone'=>'7',
        'varieties'=>['Joi Choi','Mei Qing Choi','Shanghai','Tatsoi'],
        'description'=>'Aziatische kool; snel klaar en lekker in de wok.'],
    ['name'=>'Koolrabi','category'=>'Vegetable','icon'=>'🥦','sunlight'=>'full sun','water_needs'=>'medium','days_to_maturity'=>55,'hardiness_zone'=>'6',
        'varieties'=>['Kolibri','Azur Star','Gigante','Superschmelz','White Vienna'],
        'description'=>'Knolvormige koolsoort; rauw of gekookt te eten.'],

    // Wortels / knollen
    ['name'=>'Wortel','category'=>'Root','icon'=>'🥕','sunlight'=>'full sun','water_needs'=>'medium','days_to_maturity'=>70,'hardiness_zone'=>'5',
        'varieties'=>['Nantes','Chantenay','Berlicum','Autumn King','Purple Haze','Yellowstone','Oxheart','Little Finger'],
        'description'=>'Klassieke wortelgroente; zaai in diepe losse grond.'],
    ['name'=>'Pastinaak','category'=>'Root','icon'=>'🥕','sunlight'=>'full sun','water_needs'=>'medium','days_to_maturity'=>120,'hardiness_zone'=>'5',
        'varieties'=>['Hollow Crown','Tender and True','Gladiator','White Gem'],
        'description'=>'Zoete winterwortel; lekkerder na vorst.'],
    ['name'=>'Biet','category'=>'Root','icon'=>'🟣','sunlight'=>'full sun','water_needs'=>'medium','days_to_maturity'=>55,'hardiness_zone'=>'6',
        'varieties'=>['Detroit','Chioggia','Boltardy','Golden','Cylindra','Pablo','Mono King Explorer'],
        'description'=>'Veelzijdige knol; wortel, blad én stelen eetbaar.'],
    ['name'=>'Radijs','category'=>'Root','icon'=>'🌶️','sunlight'=>'partial','water_needs'=>'medium','days_to_maturity'=>25,'hardiness_zone'=>'6',
        'varieties'=>['Cherry Belle','French Breakfast','Ostergruß Rosa','Watermelon','Black Spanish','Daikon','Viola'],
        'description'=>'Snelste groente van de tuin; klaar in 3-4 weken.'],
    ['name'=>'Koolraap','category'=>'Root','icon'=>'🟤','sunlight'=>'full sun','water_needs'=>'medium','days_to_maturity'=>90,'hardiness_zone'=>'5',
        'varieties'=>['Gele Tankard','Best of All','Purple Top','Wilhelmsburger'],
        'description'=>'Grote bewaarknol; dubbel gebruik als groenvoer.'],
    ['name'=>'Aardappel','category'=>'Vegetable','icon'=>'🥔','sunlight'=>'full sun','water_needs'=>'medium','days_to_maturity'=>90,'hardiness_zone'=>'5',
        'varieties'=>['Bintje','Nicola','Désirée','Agria','Charlotte','Vitelotte','Blue Congo','Ratte','Asterix','Innovator','Fontane'],
        'description'=>'Belgische basisgroente; vroege rassen al klaar in juni.'],
    ['name'=>'Zoete aardappel','category'=>'Root','icon'=>'🍠','sunlight'=>'full sun','water_needs'=>'medium','days_to_maturity'=>120,'hardiness_zone'=>'9',
        'varieties'=>['Beauregard','Georgia Jet','O'Henry','Purple','Murasaki'],
        'description'=>'Warmteminnende knol; goede opbrengst bij een warm zomer.'],
    ['name'=>'Selderie (knol)','category'=>'Root','icon'=>'⬜','sunlight'=>'partial','water_needs'=>'high','days_to_maturity'=>120,'hardiness_zone'=>'6',
        'varieties'=>['Monarch','Giant Prague','Alabaster','Prinz'],
        'description'=>'Grote witte knol; lang groeiseizoen vereist.'],
    ['name'=>'Selderie (steel)','category'=>'Vegetable','icon'=>'🌿','sunlight'=>'partial','water_needs'=>'high','days_to_maturity'=>120,'hardiness_zone'=>'6',
        'varieties'=>['Utah','Tango','Golden Self-Blanching','Loretta','Pascal'],
        'description'=>'Waterrijke stengel; geschikt voor soep en rauwkost.'],
    ['name'=>'Venkel','category'=>'Vegetable','icon'=>'🌿','sunlight'=>'full sun','water_needs'=>'medium','days_to_maturity'=>75,'hardiness_zone'=>'7',
        'varieties'=>['Romanesco','Zefa Fino','Orion','Victorio','Finale'],
        'description'=>'Anijsachtige smaak; zowel knol als blad eetbaar.'],

    // Peulvruchten
    ['name'=>'Tuinboon','category'=>'Legume','icon'=>'🫘','sunlight'=>'full sun','water_needs'=>'medium','days_to_maturity'=>90,'hardiness_zone'=>'5',
        'varieties'=>['Aquadulce','Bunyard\'s Exhibition','Red Epicure','Witkiem Manita','Super Aquadulce'],
        'description'=>'Vroegste peulvrucht; zaaien in november of vroeg voorjaar.'],
    ['name'=>'Pronkboon','category'=>'Legume','icon'=>'🫘','sunlight'=>'full sun','water_needs'=>'medium','days_to_maturity'=>60,'hardiness_zone'=>'8',
        'varieties'=>['Scarlet Emperor','Painted Lady','White Lady','Mergoles','Streamline'],
        'description'=>'Klimmende boon met decoratieve bloemen; oogstt lang door.'],
    ['name'=>'Stamboon','category'=>'Legume','icon'=>'🫘','sunlight'=>'full sun','water_needs'=>'medium','days_to_maturity'=>55,'hardiness_zone'=>'9',
        'varieties'=>['Prelude','Contender','Masterpiece','Venture','Coco Blanc','Borlotti'],
        'description'=>'Compacte boon zonder steunen; vroeg en productief.'],
    ['name'=>'Snijboon','category'=>'Legume','icon'=>'🫘','sunlight'=>'full sun','water_needs'=>'medium','days_to_maturity'=>65,'hardiness_zone'=>'9',
        'varieties'=>['Cobra','Helda','Hunter','Largo','Blauhilde'],
        'description'=>'Klimmer met lange brede peulen; lang oogstseizoen.'],
    ['name'=>'Suikerpeulen','category'=>'Legume','icon'=>'🫘','sunlight'=>'full sun','water_needs'=>'medium','days_to_maturity'=>60,'hardiness_zone'=>'6',
        'varieties'=>['Oregon Sugar Pod','Carouby de Maussane','Mammoth Melting Sugar','Norli'],
        'description'=>'Hele peul eetbaar; zoet en knapperig rauw of gestoomd.'],
    ['name'=>'Doperwt','category'=>'Legume','icon'=>'🫘','sunlight'=>'full sun','water_needs'=>'medium','days_to_maturity'=>65,'hardiness_zone'=>'6',
        'varieties'=>['Kelvedon Wonder','Feltham First','Alderman','Douce Provence','Ambassador','Sugar Snap'],
        'description'=>'Klassieke erwt; vroeg te zaaien en lang houdbaar als dop.'],
    ['name'=>'Kikkererwt','category'=>'Legume','icon'=>'🫘','sunlight'=>'full sun','water_needs'=>'low','days_to_maturity'=>100,'hardiness_zone'=>'7',
        'varieties'=>['Kabuli','Desi','Black Kabuli'],
        'description'=>'Droogte­tolerant; goed in droge Belgische zomers.'],
    ['name'=>'Sojaboon','category'=>'Legume','icon'=>'🫘','sunlight'=>'full sun','water_needs'=>'medium','days_to_maturity'=>90,'hardiness_zone'=>'9',
        'varieties'=>['Edamame','Envy','Fiskeby V'],
        'description'=>'Edamame als jong oogsten of volledig drogen als soja.'],

    // Uien / lookfamilie
    ['name'=>'Ui','category'=>'Vegetable','icon'=>'🧅','sunlight'=>'full sun','water_needs'=>'low','days_to_maturity'=>110,'hardiness_zone'=>'5',
        'varieties'=>['Sturon','Centurion','Jet Set','Red Baron','Ailsa Craig','Walla Walla','Stuttgarter'],
        'description'=>'Basis keukenkruid; te telen van zaad of plantui.'],
    ['name'=>'Sjalot','category'=>'Vegetable','icon'=>'🧅','sunlight'=>'full sun','water_needs'=>'low','days_to_maturity'=>90,'hardiness_zone'=>'5',
        'varieties'=>['Golden Gourmet','Longor','Ronde de Jersey','Pikant','Ambition'],
        'description'=>'Fijnere smaak dan ui; ideaal voor sauzen.'],
    ['name'=>'Knoflook','category'=>'Herb','icon'=>'🧄','sunlight'=>'full sun','water_needs'=>'low','days_to_maturity'=>240,'hardiness_zone'=>'4',
        'varieties'=>['Germidour','Printanor','Theridor','Messidrome','Cristo','Lautrec Wight','Purple Wight','Solent Wight'],
        'description'=>'Planten in herfst; oogsten volgend jaar in juli.'],
    ['name'=>'Prei','category'=>'Vegetable','icon'=>'🌿','sunlight'=>'full sun','water_needs'=>'medium','days_to_maturity'=>120,'hardiness_zone'=>'5',
        'varieties'=>['Musselburgh','Bandit','Oarsman','Atlanta','Belton','Pandora'],
        'description'=>'Lange wintergroente; kan staan tot -15°C.'],
    ['name'=>'Lente-ui','category'=>'Vegetable','icon'=>'🌿','sunlight'=>'full sun','water_needs'=>'medium','days_to_maturity'=>60,'hardiness_zone'=>'6',
        'varieties'=>['White Lisbon','North Holland Blood Red','Ishikura','Guardsman','Parade'],
        'description'=>'Snelle dunne ui; het hele jaar te zaaien.'],
    ['name'=>'Bieslook','category'=>'Herb','icon'=>'🌿','sunlight'=>'full sun','water_needs'=>'medium','days_to_maturity'=>60,'hardiness_zone'=>'3',
        'varieties'=>['Common','Garlic Chives','Purly','Forescate'],
        'description'=>'Vaste plant; bloemen ook eetbaar.'],

    // Sla & bladgroenten extra
    ['name'=>'Waterkers','category'=>'Leafy Green','icon'=>'🌿','sunlight'=>'partial','water_needs'=>'high','days_to_maturity'=>60,'hardiness_zone'=>'5',
        'varieties'=>['Aqua','Garden Cress','Curled'],
        'description'=>'Groeit het best aan de rand van vijver of beek.'],
    ['name'=>'Raapstelen','category'=>'Leafy Green','icon'=>'🌿','sunlight'=>'partial','water_needs'=>'medium','days_to_maturity'=>30,'hardiness_zone'=>'5',
        'varieties'=>['All Seasons','Extra vroege','Winter'],
        'description'=>'Snelgroeiend winterblad; zaai in aug-sept voor herfst.'],
    ['name'=>'Wilde rucola','category'=>'Leafy Green','icon'=>'🌿','sunlight'=>'partial','water_needs'=>'low','days_to_maturity'=>40,'hardiness_zone'=>'5',
        'varieties'=>['Selvática','Perennial'],
        'description'=>'Pittigere smaak dan gewone rucola; meerjarig.'],

    // ── KRUIDEN ────────────────────────────────────────────────────────────────
    ['name'=>'Basilicum','category'=>'Herb','icon'=>'🌿','sunlight'=>'full sun','water_needs'=>'medium','days_to_maturity'=>30,'hardiness_zone'=>'10',
        'varieties'=>['Genovese','Thai','Purple Ruffles','Lemon','Cinnamon','Lettuce Leaf','Napoletano','Holy Basil (Tulsi)','Greek','Red Rubin'],
        'description'=>'Warmteminnend eenjarig kruid; ideaal bij tomaten.'],
    ['name'=>'Peterselie','category'=>'Herb','icon'=>'🌿','sunlight'=>'partial','water_needs'=>'medium','days_to_maturity'=>75,'hardiness_zone'=>'5',
        'varieties'=>['Moss Curled','Italian Flat-leaf','Hamburg (wortel)','Champion Moss Curled'],
        'description'=>'Tweejarig kruid; vlak blad heeft meer smaak dan gekruld.'],
    ['name'=>'Koriander','category'=>'Herb','icon'=>'🌿','sunlight'=>'full sun','water_needs'=>'medium','days_to_maturity'=>45,'hardiness_zone'=>'7',
        'varieties'=>['Cilantro','Calypso','Leisure','Santo','Jantar'],
        'description'=>'Schieten bevorderd door hitte; succesief zaaien.'],
    ['name'=>'Dille','category'=>'Herb','icon'=>'🌿','sunlight'=>'full sun','water_needs'=>'medium','days_to_maturity'=>40,'hardiness_zone'=>'7',
        'varieties'=>['Dukat','Bouquet','Fernleaf','Elephant','Long Island Mammoth'],
        'description'=>'Snel doorschietend; zaai elke 3 weken voor continue oogst.'],
    ['name'=>'Tijm','category'=>'Herb','icon'=>'🌿','sunlight'=>'full sun','water_needs'=>'low','days_to_maturity'=>85,'hardiness_zone'=>'4',
        'varieties'=>['Common','Lemon','Silver','Creeping','Orange Balsam','Doone Valley','French'],
        'description'=>'Vaste plant; vorsthard en droogtebestendig.'],
    ['name'=>'Rozemarijn','category'=>'Herb','icon'=>'🌿','sunlight'=>'full sun','water_needs'=>'low','days_to_maturity'=>365,'hardiness_zone'=>'7',
        'varieties'=>['Miss Jessopp','Arp','Tuscan Blue','Prostrate','Majorca Pink','Blue Lagoon'],
        'description'=>'Halfstruik; vrij winterhard in beschutte Belgische tuinen.'],
    ['name'=>'Salie','category'=>'Herb','icon'=>'🌿','sunlight'=>'full sun','water_needs'=>'low','days_to_maturity'=>75,'hardiness_zone'=>'5',
        'varieties'=>['Common','Purple','Tricolor','Golden','Berggarten','Pineapple'],
        'description'=>'Halfstruik; decoratief en culinair.'],
    ['name'=>'Munt','category'=>'Herb','icon'=>'🌿','sunlight'=>'partial','water_needs'=>'high','days_to_maturity'=>60,'hardiness_zone'=>'4',
        'varieties'=>['Spearmint','Peppermint','Apple Mint','Chocolate Mint','Mojito Mint','Pennyroyal','Moroccan Mint','Ginger Mint'],
        'description'=>'Invasief; best in pot. Houdt van vochtige grond.'],
    ['name'=>'Oregano','category'=>'Herb','icon'=>'🌿','sunlight'=>'full sun','water_needs'=>'low','days_to_maturity'=>90,'hardiness_zone'=>'5',
        'varieties'=>['Greek','Italian','Hot & Spicy','Golden','Compactum'],
        'description'=>'Vaste plant; gedroogd intenser van smaak.'],
    ['name'=>'Majoraan','category'=>'Herb','icon'=>'🌿','sunlight'=>'full sun','water_needs'=>'low','days_to_maturity'=>75,'hardiness_zone'=>'8',
        'varieties'=>['Sweet Marjoram','Pot Marjoram'],
        'description'=>'Zachter dan oregano; in België als eenjarig te telen.'],
    ['name'=>'Dragon','category'=>'Herb','icon'=>'🌿','sunlight'=>'full sun','water_needs'=>'low','days_to_maturity'=>60,'hardiness_zone'=>'4',
        'varieties'=>['French Tarragon','Russian Tarragon'],
        'description'=>'Franse dragon is culinair superieur maar minder winterhard.'],
    ['name'=>'Lavendel','category'=>'Herb','icon'=>'💜','sunlight'=>'full sun','water_needs'=>'low','days_to_maturity'=>365,'hardiness_zone'=>'5',
        'varieties'=>['Hidcote','Munstead','Vera','Grosso','Provence','Edelweiß','Blue Scent'],
        'description'=>'Decoratief en aromatisch; bijen- en vlinderplant.'],
    ['name'=>'Citroenwier (Melissa)','category'=>'Herb','icon'=>'🌿','sunlight'=>'partial','water_needs'=>'medium','days_to_maturity'=>60,'hardiness_zone'=>'4',
        'varieties'=>['All Gold','Quedlinburger Niederliegende','Citronella'],
        'description'=>'Meerjarig kruid met citroengeur; kalmerende werking.'],
    ['name'=>'Stevia','category'=>'Herb','icon'=>'🌿','sunlight'=>'full sun','water_needs'=>'medium','days_to_maturity'=>60,'hardiness_zone'=>'9',
        'varieties'=>['Standard','Candy','Rebaudiana'],
        'description'=>'Zoete bladeren als suikervervanger; overwinteren binnen.'],
    ['name'=>'Kervel','category'=>'Herb','icon'=>'🌿','sunlight'=>'shade','water_needs'=>'medium','days_to_maturity'=>50,'hardiness_zone'=>'6',
        'varieties'=>['Plain-leaved','Curled','Brussels Winter'],
        'description'=>'Fijn anijsaroma; groeit best in de schaduw.'],
    ['name'=>'Selderij (blad)','category'=>'Herb','icon'=>'🌿','sunlight'=>'partial','water_needs'=>'high','days_to_maturity'=>80,'hardiness_zone'=>'6',
        'varieties'=>['Zwolsche Krul','Tendercrisp','Amsterdam'],
        'description'=>'Sterk aromatisch; kleine plantjes voor soep.'],
    ['name'=>'Bonekruid','category'=>'Herb','icon'=>'🌿','sunlight'=>'full sun','water_needs'=>'low','days_to_maturity'=>60,'hardiness_zone'=>'5',
        'varieties'=>['Summer Savory','Winter Savory'],
        'description'=>'Peperdige smaak; klassiek bij bonen.'],
    ['name'=>'Welriekende bes (zwarte bes-kruid)','category'=>'Herb','icon'=>'🌿','sunlight'=>'partial','water_needs'=>'medium','days_to_maturity'=>60,'hardiness_zone'=>'4',
        'varieties'=>['Standard'],
        'description'=>'Aromatisch blad; ook sierlijk.'],

    // ── FRUIT ──────────────────────────────────────────────────────────────────
    ['name'=>'Aardbei','category'=>'Fruit','icon'=>'🍓','sunlight'=>'full sun','water_needs'=>'medium','days_to_maturity'=>60,'hardiness_zone'=>'4',
        'varieties'=>['Elsanta','Korona','Honeoye','Florence','Mara des Bois','Sonata','Gariguette','Senga Sengana','Albion','Ostara'],
        'description'=>'Populairste tuinfruit; vroeg ras al in mei.'],
    ['name'=>'Framboos','category'=>'Fruit','icon'=>'🫐','sunlight'=>'full sun','water_needs'=>'medium','days_to_maturity'=>365,'hardiness_zone'=>'4',
        'varieties'=>['Glen Ample','Autumn Bliss','Polka','Heritage','Tulameen','Joan J','Malling Promise','Ruby Beauty'],
        'description'=>'Doordragers oogsten tot november.'],
    ['name'=>'Braam','category'=>'Fruit','icon'=>'🫐','sunlight'=>'full sun','water_needs'=>'low','days_to_maturity'=>365,'hardiness_zone'=>'5',
        'varieties'=>['Loch Ness','Thornfree','Chester','Columbia Star','Adrienne','Reuben'],
        'description'=>'Robuust struikfruit; groeit ook op minder rijke grond.'],
    ['name'=>'Kruisbes','category'=>'Fruit','icon'=>'🍈','sunlight'=>'partial','water_needs'=>'medium','days_to_maturity'=>365,'hardiness_zone'=>'4',
        'varieties'=>['Invicta','Pax','Hinnonmäki Red','Captivator','Martlet'],
        'description'=>'Doornig struikje; vroegste bessen in juni.'],
    ['name'=>'Rode bes','category'=>'Fruit','icon'=>'🍒','sunlight'=>'partial','water_needs'=>'medium','days_to_maturity'=>365,'hardiness_zone'=>'4',
        'varieties'=>['Jonkheer van Tets','Red Lake','Rovada','Stanza','Tatran'],
        'description'=>'Tros bessen; zuur maar ideaal voor gelei.'],
    ['name'=>'Witte bes','category'=>'Fruit','icon'=>'🍇','sunlight'=>'partial','water_needs'=>'medium','days_to_maturity'=>365,'hardiness_zone'=>'4',
        'varieties'=>['White Versailles','Blanka','White Dutch','Primus'],
        'description'=>'Zoeter dan rode bes; mooi als garnering.'],
    ['name'=>'Zwarte bes','category'=>'Fruit','icon'=>'🫐','sunlight'=>'full sun','water_needs'=>'medium','days_to_maturity'=>365,'hardiness_zone'=>'4',
        'varieties'=>['Ben Sarek','Ben Connan','Ben Hope','Ebony','Titania'],
        'description'=>'Vitamine C bom; ideaal voor sap en jam.'],
    ['name'=>'Blauwe bes','category'=>'Fruit','icon'=>'🫐','sunlight'=>'full sun','water_needs'=>'medium','days_to_maturity'=>365,'hardiness_zone'=>'4',
        'varieties'=>['Bluecrop','Chandler','Duke','Spartan','Tophat','Sunshine Blue','Patriot'],
        'description'=>'Heeft zure grond nodig (pH 4.5-5.5); zelf bestuivend.'],
    ['name'=>'Druif','category'=>'Fruit','icon'=>'🍇','sunlight'=>'full sun','water_needs'=>'medium','days_to_maturity'=>365,'hardiness_zone'=>'6',
        'varieties'=>['Muscat de Hambourg','Boskoop Glory','Regent','Lakemont','Phönix','Cabernet Cortis','Solaris'],
        'description'=>'Klimmer voor warme muur of serre; tafeldrui of wijn.'],
    ['name'=>'Vijg','category'=>'Fruit','icon'=>'🍈','sunlight'=>'full sun','water_needs'=>'low','days_to_maturity'=>365,'hardiness_zone'=>'8',
        'varieties'=>['Brown Turkey','Rouge de Bordeaux','White Marseilles','Petite Grise'],
        'description'=>'In pot of beschutte plek; vruchten rijpen in augustus.'],
    ['name'=>'Appel','category'=>'Fruit','icon'=>'🍎','sunlight'=>'full sun','water_needs'=>'medium','days_to_maturity'=>365,'hardiness_zone'=>'4',
        'varieties'=>['Jonagold','Cox','Elstar','Gala','Braeburn','Bramley','Discovery','Fiesta','Santana','Topaz'],
        'description'=>'Belgisch familiefruit; honderden variëteiten beschikbaar.'],
    ['name'=>'Peer','category'=>'Fruit','icon'=>'🍐','sunlight'=>'full sun','water_needs'=>'medium','days_to_maturity'=>365,'hardiness_zone'=>'5',
        'varieties'=>['Conference','Doyenné du Comice','Beurré Hardy','Williams','Concorde'],
        'description'=>'Leifruit of vrijstaand; rijpt na het plukken.'],
    ['name'=>'Kers','category'=>'Fruit','icon'=>'🍒','sunlight'=>'full sun','water_needs'=>'medium','days_to_maturity'=>365,'hardiness_zone'=>'5',
        'varieties'=>['Stella','Sunburst','Lapins','Kordia','Regina','Merchant','Early Rivers','Morello (zuur)'],
        'description'=>'Zelffertiele variëteiten bestaan; Morello verdraagt schaduw.'],
    ['name'=>'Pruim','category'=>'Fruit','icon'=>'🟣','sunlight'=>'full sun','water_needs'=>'medium','days_to_maturity'=>365,'hardiness_zone'=>'5',
        'varieties'=>['Victoria','Opal','Czar','Marjories Seedling','Mirabelle de Nancy','Reine Claude'],
        'description'=>'Victoria is de meest populaire in Belgische tuinen.'],
    ['name'=>'Kiwi','category'=>'Fruit','icon'=>'🥝','sunlight'=>'full sun','water_needs'=>'medium','days_to_maturity'=>365,'hardiness_zone'=>'7',
        'varieties'=>['Jenny (zelffertiel)','Hayward','Bruno','Ananasnaja (hardy)','Issai (hardy)'],
        'description'=>'Krachtige klimmer; hardy kiwi is winterhard tot -25°C.'],

    // ── BLOEMEN (eetbaar/companion) ─────────────────────────────────────────────
    ['name'=>'Goudsbloem','category'=>'Flower','icon'=>'🌼','sunlight'=>'full sun','water_needs'=>'low','days_to_maturity'=>50,'hardiness_zone'=>'6',
        'varieties'=>['Neon','Indian Prince','Fiesta Gitana','Touch of Red','Bon Bon','Art Shades'],
        'description'=>'Eetbare bloem; verdrijft aaltjes in de grond.'],
    ['name'=>'Nasturtium (Oost-Indische kers)','category'=>'Flower','icon'=>'🌺','sunlight'=>'full sun','water_needs'=>'low','days_to_maturity'=>45,'hardiness_zone'=>'9',
        'varieties'=>['Alaska','Empress of India','Jewel Mix','Tom Thumb','Black Velvet','Canary Creeper'],
        'description'=>'Blad, bloem en zaad eetbaar; lokt bladluisrovers.'],
    ['name'=>'Borage','category'=>'Herb','icon'=>'💙','sunlight'=>'full sun','water_needs'=>'low','days_to_maturity'=>50,'hardiness_zone'=>'7',
        'varieties'=>['Common Blue','Alba (wit)'],
        'description'=>'Eetbare blauwe bloemen; aantrekkelijk voor bijen.'],
    ['name'=>'Korianderbloem','category'=>'Flower','icon'=>'🌸','sunlight'=>'full sun','water_needs'=>'low','days_to_maturity'=>60,'hardiness_zone'=>'7',
        'varieties'=>['Standard'],
        'description'=>'Fijn ombelbloemig; aantrekkelijk voor sluipwespen.'],
    ['name'=>'Zonnebloem','category'=>'Flower','icon'=>'🌻','sunlight'=>'full sun','water_needs'=>'low','days_to_maturity'=>75,'hardiness_zone'=>'9',
        'varieties'=>['Giganteus','Dwarf Sunspot','Velvet Queen','Lemon Queen','Italian White','Teddy Bear'],
        'description'=>'Groot en opvallend; zaad eetbaar voor mens en vogel.'],
    ['name'=>'Groot klaproos','category'=>'Flower','icon'=>'🌺','sunlight'=>'full sun','water_needs'=>'low','days_to_maturity'=>60,'hardiness_zone'=>'5',
        'varieties'=>['Lauren\'s Grape','Black Swan','Flemish Antique'],
        'description'=>'Zaait zichzelf uit; sierlijk in de groentetuin.'],

    // ── OVERIG / EXOTISCH ──────────────────────────────────────────────────────
    ['name'=>'Maïs (zoet)','category'=>'Vegetable','icon'=>'🌽','sunlight'=>'full sun','water_needs'=>'medium','days_to_maturity'=>80,'hardiness_zone'=>'9',
        'varieties'=>['Sweet Nugget','Incredible','Earlibird','Mirai','Double Red','Strawberry Popcorn'],
        'description'=>'Windbestuiver; plant in blok van 4×4 voor goede bestuiving.'],
    ['name'=>'Artisjok','category'=>'Vegetable','icon'=>'🌿','sunlight'=>'full sun','water_needs'=>'medium','days_to_maturity'=>365,'hardiness_zone'=>'7',
        'varieties'=>['Green Globe','Violetto di Chioggia','Gros Camus de Bretagne'],
        'description'=>'Grote sierlijke plant; in zachte winters meerjarig.'],
    ['name'=>'Asperge','category'=>'Vegetable','icon'=>'🌿','sunlight'=>'full sun','water_needs'=>'medium','days_to_maturity'=>730,'hardiness_zone'=>'4',
        'varieties'=>['Gijnlim','Backlim','Millennium','Pacific 2000','Connover\'s Colossal'],
        'description'=>'Meerjarig; eerste oogst pas na 3 jaar maar daarna 20 jaar productief.'],
    ['name'=>'Rabarber','category'=>'Vegetable','icon'=>'🌿','sunlight'=>'partial','water_needs'=>'medium','days_to_maturity'=>365,'hardiness_zone'=>'3',
        'varieties'=>['Victoria','Timperley Early','Champagne','Glaskins Perpetual','Fulton\'s Strawberry Surprise'],
        'description'=>'Vaste plant; stelen eetbaar maar blad giftig.'],
    ['name'=>'Aardpeer','category'=>'Root','icon'=>'🟤','sunlight'=>'full sun','water_needs'=>'low','days_to_maturity'=>180,'hardiness_zone'=>'4',
        'varieties'=>['Fuseau','Red Fuseau','Dwarf Sunray'],
        'description'=>'Invasief wortelgroente; knollen oogsten na eerste vorst.'],
    ['name'=>'Okra','category'=>'Vegetable','icon'=>'🌿','sunlight'=>'full sun','water_needs'=>'medium','days_to_maturity'=>55,'hardiness_zone'=>'10',
        'varieties'=>['Clemson Spineless','Star of David','Red Burgundy','Jing Orange'],
        'description'=>'Tropen­gewas; verrassend goed in warme Belgische zomers.'],
    ['name'=>'Watermeloen','category'=>'Fruit','icon'=>'🍉','sunlight'=>'full sun','water_needs'=>'high','days_to_maturity'=>85,'hardiness_zone'=>'10',
        'varieties'=>['Sugar Baby','Crimson Sweet','Yellow Doll','Mini Love'],
        'description'=>'Minitype in tunneltje of kas; rijpt in augustus.'],
    ['name'=>'Meloen','category'=>'Fruit','icon'=>'🍈','sunlight'=>'full sun','water_needs'=>'medium','days_to_maturity'=>80,'hardiness_zone'=>'10',
        'varieties'=>['Sweetheart','Hale\'s Best','Ananas','Cantaloup Charentais','Collective Farm Woman'],
        'description'=>'Beste resultaten in verwarmde kas of tunneltje.'],
];

$db = db();

// Fetch existing
$existing = [];
$res = $db->query('SELECT id, name, category, varieties FROM plants_library');
while ($row = $res->fetch_assoc()) {
    $key = mb_strtolower(trim($row['name'])) . '|' . mb_strtolower(trim($row['category']));
    $row['varieties'] = json_decode($row['varieties'] ?? '[]', true) ?: [];
    $existing[$key] = $row;
}

$saved = $updated = 0;

foreach ($PLANTS as $p) {
    $name      = $p['name'];
    $category  = $p['category'];
    $key       = mb_strtolower($name) . '|' . mb_strtolower($category);
    $varieties = json_encode($p['varieties'], JSON_UNESCAPED_UNICODE);
    $desc      = $p['description'];
    $sun       = $p['sunlight'];
    $water     = $p['water_needs'];
    $days      = (int)$p['days_to_maturity'];
    $zone      = $p['hardiness_zone'] ?? '';
    $icon      = $p['icon'];

    if (isset($existing[$key])) {
        // Merge varieties
        $merged = json_encode(array_values(array_unique(array_merge($existing[$key]['varieties'], $p['varieties']))), JSON_UNESCAPED_UNICODE);
        $stmt = $db->prepare('UPDATE plants_library SET varieties=?, description=?, sunlight=?, water_needs=?, days_to_maturity=?, hardiness_zone=?, icon=?, updated_at=NOW() WHERE id=?');
        $id = (int)$existing[$key]['id'];
        $stmt->bind_param('ssssissi', $merged, $desc, $sun, $water, $days, $zone, $icon, $id);
        $stmt->execute();
        $updated++;
    } else {
        $stmt = $db->prepare('INSERT INTO plants_library (name, category, varieties, description, sunlight, water_needs, days_to_maturity, hardiness_zone, icon) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
        $stmt->bind_param('ssssssiss', $name, $category, $varieties, $desc, $sun, $water, $days, $zone, $icon);
        $stmt->execute();
        $saved++;
    }
}

respond(['status'=>'success', 'inserted'=>$saved, 'updated'=>$updated, 'total'=>count($PLANTS)]);
