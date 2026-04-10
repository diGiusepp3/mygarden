# MyGarden masterplan

Dit is de grote audit en todo-lijst voor MyGarden.

We gebruiken dit bestand als werkboek.

Geen fases.

Gewoon alles nakijken, noteren, en afvinken.

Als iets nieuw opduikt, zetten we het hier ook bij.

Als iets niet vandaag kan, blijft het gewoon op de lijst staan.

We houden het simpel, duidelijk en netjes.

Wat nu al duidelijk is:

- De UI moet moderner.
- De fonts moeten beter.
- De cards en blokken moeten rustiger.
- De code moet kleiner en schoner.
- De dev panel moet beter werken.
- Planten toevoegen moet veel makkelijker.
- Objecten en serres moeten beter koppelbaar zijn.
- De keuze om een plant aan een serre te hangen moet werken.
- Alles moet makkelijker te vinden zijn.
- Alles moet eenvoudiger te begrijpen zijn.
- [x] Voeg een automatische check toe die kapotte encoding meteen blokkeert.

## 1. Basisregels

- [ ] Kijk eerst naar wat al bestaat.
- [ ] Schrijf alles wat we zien in dit plan.
- [ ] Werk altijd van klein naar groot.
- [ ] Laat geen rare losse stukken code achter.
- [ ] Maak geen nieuwe chaos terwijl we opruimen.
- [ ] Geef elke nieuwe functie een duidelijke plek.
- [ ] Geef elk scherm een duidelijke taak.
- [ ] Hou UI code en data code uit elkaar.
- [ ] Hou helpers klein en simpel.
- [ ] Hou formulierelementen herbruikbaar.
- [ ] Zet UI tekst op een centrale plek.
- [ ] Zet kleuren en maten op een centrale plek.
- [ ] Gebruik geen losse magic numbers waar dat niet moet.
- [ ] Gebruik geen dubbele logica op meerdere plekken.
- [ ] Maak dingen liever herbruikbaar dan uniek.
- [ ] Laat oude code niet stilletjes blijven hangen.
- [ ] Noteer elk bugje dat we zien.
- [ ] Noteer elk deel dat onduidelijk voelt.
- [ ] Noteer elk deel dat te groot is.
- [ ] Noteer elk deel dat lelijk of rommelig voelt.
- [ ] Noteer elk deel dat moeilijk te testen is.

## 2. Bestandsstructuur

- [ ] Kijk welke bestanden nu al gesplitst zijn.
- [ ] Kijk welke bestanden nog te groot zijn.
- [ ] Maak een nette map voor schermen.
- [ ] Maak een nette map voor UI onderdelen.
- [ ] Maak een nette map voor helpers.
- [ ] Maak een nette map voor state.
- [ ] Maak een nette map voor dev tools.
- [ ] Maak een nette map voor editor onderdelen.
- [ ] Maak een nette map voor formulieren.
- [ ] Maak een nette map voor data-achtige dingen.
- [ ] Houd `GardenGrid.jsx` zo klein mogelijk.
- [ ] Laat `main.jsx` alleen opstarten.
- [ ] Laat schermbestanden hun eigen werk doen.
- [ ] Laat helperbestanden geen UI renderen.
- [ ] Laat UI onderdelen geen data logica doen.
- [ ] Laat state bestanden alleen state regelen.
- [ ] Laat theme bestanden alleen visuele tokens bewaren.
- [ ] Laat i18n bestanden alleen teksten bewaren.
- [ ] Geef bestanden korte, duidelijke namen.
- [ ] Zet verwante dingen bij elkaar.
- [ ] Verplaats stukken pas als de nieuwe plek logisch voelt.
- [x] Haal de sidebar uit `GardenGrid.jsx` en zet hem in losse layoutbestanden.

## 3. Thema en fonts

- [ ] Kies een moderne font combinatie.
- [ ] Test de fonts op grote en kleine schermen.
- [ ] Gebruik een duidelijke koptekst font.
- [ ] Gebruik een rustige leesfont voor gewone tekst.
- [ ] Maak koppen iets sterker en duidelijker.
- [ ] Maak body tekst iets rustiger.
- [ ] Gebruik niet te veel fontgewichten.
- [ ] Hou letterspatiëring netjes.
- [ ] Hou regels niet te breed.
- [ ] Maak de titel van de app meer opvallend.
- [ ] Maak subkoppen zachter.
- [ ] Laat knoppen een vaste tekststijl hebben.
- [ ] Laat badges overal dezelfde stijl hebben.
- [ ] Laat labels overal dezelfde stijl hebben.
- [ ] Laat kleine hulptekst overal dezelfde stijl hebben.
- [ ] Gebruik dezelfde fontregels in dev panel en normaal scherm.
- [ ] Gebruik dezelfde fontregels in modals en forms.
- [ ] Verwijder oude fontkeuzes die niet meer passen.
- [ ] Check of de fonts snel laden.
- [ ] Check of fallback fonts netjes zijn.
- [ ] Zet de fontkeuze op een centrale plek.

## 4. Shell en navigatie

- [ ] Maak de app shell rustiger.
- [ ] Maak de sidebar duidelijker.
- [ ] Maak de header duidelijker.
- [ ] Maak de actieve pagina duidelijk zichtbaar.
- [ ] Maak de navigatie minder druk.
- [ ] Maak de route wissel simpel en voorspelbaar.
- [ ] Hou de hash routing zolang die werkt.
- [ ] Kijk of de route code kleiner kan.
- [ ] Maak het navigeren op mobiel beter.
- [ ] Maak het navigeren op desktop strakker.
- [ ] Maak de terugknop logischer.
- [ ] Maak de tab volgorde logisch.
- [ ] Zet globale actieknoppen op vaste plekken.
- [ ] Zet secundaire acties minder hard in beeld.
- [ ] Zet gevaarlijke acties ver weg van primaire acties.
- [ ] Check of de sidebar inklapbaar blijft werken.
- [ ] Check of de actieve route altijd klopt.
- [ ] Check of schermwissel geen rare flits geeft.
- [ ] Check of menu labels duidelijk zijn.
- [ ] Check of de shell op kleine schermen niet breekt.

## 5. Dashboard

- [ ] Maak het dashboard sneller te scannen.
- [ ] Maak de belangrijkste cijfers groter.
- [ ] Zet de belangrijkste kaartjes bovenaan.
- [ ] Zet minder belangrijke info lager.
- [ ] Maak de takenlijst op het dashboard duidelijker.
- [ ] Maak de oogst info duidelijker.
- [ ] Maak de planning info duidelijker.
- [ ] Maak de status badges minder druk.
- [ ] Maak de lege staat mooier.
- [ ] Geef het dashboard meer ruimte.
- [ ] Maak actieknoppen op het dashboard logischer.
- [ ] Laat het dashboard minder op een dump lijst lijken.
- [ ] Voeg betere samenvattingen toe.
- [ ] Zorg dat de gebruiker snel weet wat er speelt.
- [ ] Laat de meest urgente dingen bovenaan komen.
- [ ] Laat het dashboard niet te vol worden.
- [ ] Laat de dashboard kaarten dezelfde stijl volgen.
- [ ] Laat de dashboard secties een vaste ritme hebben.
- [ ] Maak hover en focus subtiel.
- [ ] Hou de dashboard tekst kort en helder.

## 6. Tuinen overzicht

- [ ] Maak de tuin kaarten mooier.
- [ ] Maak de tuin kaarten duidelijker.
- [ ] Maak de tuin acties eenvoudiger.
- [ ] Zet aanmaken en bewerken dichter bij elkaar.
- [ ] Laat gebruiker sneller een tuin kiezen.
- [ ] Laat actieve tuin duidelijk zien.
- [ ] Laat tuin info niet in kleine drukke blokjes verdwijnen.
- [ ] Maak tuin type labels duidelijker.
- [ ] Maak tuin notes beter leesbaar.
- [ ] Maak tuin stats visueel sterker.
- [ ] Maak lege tuinen niet saai.
- [ ] Maak verwijderen heel duidelijk maar niet schreeuwerig.
- [ ] Maak sorteren en filteren beter.
- [ ] Kijk of tuin kaarten herbruikbaar zijn.
- [ ] Kijk of tuin data beter in een helper kan.
- [ ] Kijk of tuin vorm logica kleiner kan.
- [ ] Kijk of de lijst beter in cards kan.
- [ ] Kijk of de details sneller te openen zijn.
- [ ] Kijk of tuin keuzes ook op mobiel fijn zijn.
- [ ] Kijk of tuin toegevoegde acties minder klikjes vragen.

## 7. Editor algemene structuur

- [ ] Hak de editor op in kleinere stukken.
- [ ] Geef de editor een vaste hoofdindeling.
- [ ] Zet canvas, lijst en details apart.
- [ ] Zet gereedschap en inhoud apart.
- [ ] Zet vormen en formulierelementen apart.
- [ ] Zet inspectie en bewerking apart.
- [ ] Zet selectie en bewerking apart.
- [ ] Zet editor acties bovenaan of aan de zijkant.
- [ ] Maak editor scherm niet te lang.
- [ ] Maak editor scherm minder dicht opeengepakt.
- [ ] Maak editor scherm logischer voor een niet-technische gebruiker.
- [ ] Zorg dat object kiezen directer kan.
- [ ] Zorg dat plant kiezen directer kan.
- [ ] Zorg dat bed kiezen directer kan.
- [ ] Zorg dat de editor niet alles tegelijk probeert te tonen.
- [ ] Zorg dat lege editor states duidelijk zijn.
- [ ] Zorg dat bewerken en bekijken uit elkaar liggen.
- [ ] Zorg dat drag en select helder zijn.
- [ ] Zorg dat resize en plaatsing duidelijk zijn.
- [ ] Zorg dat de editor niet te veel inline code bevat.
- [ ] Zorg dat de editor in losse onderdelen testbaar wordt.

## 8. Canvas en kaart

- [ ] Maak de canvas leesbaarder.
- [ ] Maak de grid rustiger.
- [ ] Maak de achtergrond mooier.
- [ ] Maak object randen duidelijker.
- [ ] Maak object labels beter zichtbaar.
- [ ] Maak selectie visueel sterker.
- [ ] Maak hover visueel subtiel maar duidelijk.
- [ ] Maak drag feedback beter.
- [ ] Maak resize feedback beter.
- [ ] Maak de schaal duidelijker.
- [ ] Maak de legenda duidelijker.
- [ ] Maak de canvas tools makkelijker te begrijpen.
- [ ] Maak snapping logisch.
- [ ] Maak overlap waarschuwingen duidelijk.
- [ ] Maak object controlepunten duidelijk.
- [ ] Maak de kaart niet te druk.
- [ ] Maak de kaart niet te licht of te zwaar.
- [ ] Test de canvas op kleine en grote tuinen.
- [ ] Test de canvas op veel objecten.
- [ ] Test de canvas op veel labels.

## 9. Bedden en velden

- [ ] Maak bed toevoegen eenvoudiger.
- [ ] Maak bed bewerken eenvoudiger.
- [ ] Maak bed selecteren eenvoudiger.
- [ ] Maak bed labels duidelijker.
- [ ] Maak bed types duidelijker.
- [ ] Maak bed notes leesbaar.
- [ ] Maak bed grootte makkelijk aanpasbaar.
- [ ] Maak bed positie makkelijk aanpasbaar.
- [ ] Maak bed kleuren rustig.
- [ ] Laat bedden beter in lijsten terugkomen.
- [ ] Laat bedden beter in de editor terugkomen.
- [ ] Laat bedden beter in planten forms terugkomen.
- [ ] Laat bedden ook op type filteren.
- [ ] Laat bedden ook op tuin filteren.
- [ ] Laat bedden ook op vrije ruimte zoeken.
- [ ] Check of beden en fields overal dezelfde naam krijgen.
- [ ] Check of bed validatie simpel genoeg is.
- [ ] Check of beden geen rare defaults krijgen.
- [ ] Check of beden op kleine schermen goed werken.
- [ ] Check of beden op grote schermen goed werken.

## 10. Serres en objecten

- [ ] Maak serres zichtbaar als eerste klas objecten.
- [ ] Maak tunnelkassen ook duidelijk zichtbaar.
- [ ] Maak object toevoegen eenvoudiger.
- [ ] Maak object bewerken eenvoudiger.
- [ ] Maak object selecteren eenvoudiger.
- [ ] Maak object type kiezen duidelijker.
- [ ] Maak object details rustiger.
- [ ] Maak object info korter en duidelijker.
- [ ] Maak object icons consistent.
- [ ] Maak object kleuren consistent.
- [ ] Maak object label tekst consistent.
- [ ] Laat objecten ook in lijstvorm goed werken.
- [ ] Laat objecten ook in kaartvorm goed werken.
- [ ] Laat objecten ook in forms selecteerbaar zijn.
- [ ] Laat objecten ook als linked target werken.
- [x] Laat serres in plant toevoegen voorkomen.
- [x] Laat serres in task linken voorkomen.
- [ ] Laat serres in dev panel voorkomen.
- [ ] Laat serres in dashboard samenvatting voorkomen.
- [ ] Laat objecten niet verdwijnen tussen de schermen.
- [ ] Laat objecten en bedden dezelfde taal volgen.

## 11. Planten toevoegen

- [ ] Maak plant toevoegen een korte flow.
- [ ] Maak plant toevoegen minder klikjes.
- [ ] Maak plant toevoegen minder velden tegelijk.
- [ ] Maak plant toevoegen rustiger.
- [ ] Maak plant zoeken sneller.
- [ ] Maak plant selectie duidelijker.
- [ ] Maak soort selectie duidelijker.
- [ ] Maak hoeveelheid invoer duidelijker.
- [ ] Maak status keuze duidelijker.
- [ ] Maak datum invoer duidelijker.
- [ ] Maak locatie keuze duidelijker.
- [ ] Maak de plant bibliotheek direct bruikbaar.
- [ ] Maak de plant bibliotheek sneller te filteren.
- [ ] Maak de plant bibliotheek makkelijker te scannen.
- [ ] Maak de plant bibliotheek niet te lang in beeld.
- [ ] Maak toevoegen vanuit library meteen logisch.
- [ ] Maak handmatig toevoegen ook logisch.
- [ ] Maak standaard waarden slim maar zichtbaar.
- [ ] Maak fouten in invoer vriendelijk.
- [ ] Maak plant aanmaak op mobiel goed bruikbaar.
- [x] Zorg dat serres selecteerbaar zijn bij plant toevoegen.

## 12. Planten koppelen

- [ ] Laat een plant aan een bed koppelen.
- [x] Laat een plant aan een serre koppelen.
- [ ] Laat een plant aan een tunnel koppelen.
- [ ] Laat een plant aan een los object koppelen.
- [ ] Laat een plant ook los staan als dat moet.
- [ ] Laat de keuze voor locatie duidelijk zijn.
- [ ] Laat de keuze voor locatie zoeken ondersteunen.
- [ ] Laat de keuze voor locatie filteren ondersteunen.
- [ ] Laat de keuze voor locatie een mooie lijst tonen.
- [ ] Laat de keuze voor locatie de juiste iconen tonen.
- [ ] Laat de keuze voor locatie de juiste labels tonen.
- [ ] Laat de keuze voor locatie per tuin werken.
- [ ] Laat de keuze voor locatie per gebruiker werken.
- [ ] Laat de keuze voor locatie ook bij bestaande planten werken.
- [ ] Laat bewerken van locatie eenvoudig zijn.
- [ ] Laat verplaatsen van plant eenvoudig zijn.
- [ ] Laat ontkoppelen van plant eenvoudig zijn.
- [ ] Laat gekoppelde objecten altijd zichtbaar blijven.
- [ ] Laat gekoppelde objecten niet dubbel lijken.
- [ ] Laat koppelen ook in dev/test data werken.

## 13. Taken

- [ ] Maak taken overzichtelijker.
- [ ] Maak taken minder rommelig.
- [ ] Maak taken filteren eenvoudiger.
- [ ] Maak taken sorteren eenvoudiger.
- [ ] Maak taak status duidelijker.
- [ ] Maak taak type duidelijker.
- [ ] Maak taak link duidelijker.
- [ ] Maak taak notities duidelijker.
- [ ] Maak taak aanmaken eenvoudiger.
- [ ] Maak taak bewerken eenvoudiger.
- [ ] Maak taak afvinken eenvoudiger.
- [ ] Maak taak verwijderen duidelijk.
- [ ] Maak taak deadlines beter zichtbaar.
- [ ] Maak over tijd taken beter zichtbaar.
- [ ] Maak automatische taken duidelijk.
- [ ] Maak handmatige taken duidelijk.
- [ ] Laat taken ook aan objecten hangen.
- [ ] Laat taken ook aan serres hangen.
- [ ] Laat taken ook aan bedden hangen.
- [ ] Laat taken ook aan planten hangen.
- [ ] Laat taken op dashboard kort samenvatten.

## 14. Dev panel

- [ ] Maak de dev panel rustig en bruikbaar.
- [ ] Maak de dev panel geen rommelhoek.
- [ ] Maak tabs of kaarten duidelijker.
- [ ] Maak elke dev tool kort en helder.
- [ ] Maak foutmeldingen in dev panel mooier.
- [ ] Maak laadstatus in dev panel duidelijk.
- [ ] Maak AI acties beter leesbaar.
- [ ] Maak plant generator makkelijker te gebruiken.
- [ ] Maak tuin advisor makkelijker te gebruiken.
- [ ] Maak companion hints makkelijker te gebruiken.
- [ ] Maak zaai kalender makkelijker te gebruiken.
- [ ] Maak chat makkelijker te gebruiken.
- [ ] Maak dev panel beter op mobiel.
- [ ] Maak dev panel beter op desktop.
- [ ] Maak dev panel beter voor debuggen.
- [ ] Maak dev panel beter voor snelle tests.
- [ ] Maak dev panel beter voor data inspectie.
- [ ] Maak dev panel beter voor copy paste.
- [ ] Maak dev panel beter voor een niet-tech gebruiker die even wil zien wat er gebeurt.
- [ ] Maak dev panel minder schreeuwerig.
- [ ] Maak dev panel aparte componenten.

## 15. Data en opslag

- [ ] Kijk welke data echt server-side moet staan.
- [ ] Kijk welke data client-side kan blijven.
- [ ] Kijk welke data dubbel bewaard wordt.
- [ ] Kijk welke data ouder is dan nodig.
- [ ] Kijk welke data in seed blijft staan.
- [ ] Kijk welke data migratie nodig heeft.
- [ ] Kijk welke data validatie nodig heeft.
- [ ] Kijk welke data normalisatie nodig heeft.
- [ ] Kijk welke data een vaste vorm moet krijgen.
- [ ] Kijk welke data nu te breed is.
- [ ] Kijk welke data nu te leeg is.
- [ ] Kijk welke data nu te veel vrije tekst heeft.
- [ ] Kijk welke data nu te weinig structuur heeft.
- [ ] Kijk of state klein genoeg blijft.
- [ ] Kijk of save en load helder zijn.
- [ ] Kijk of reset veilig blijft.
- [ ] Kijk of session gedrag helder is.
- [ ] Kijk of legacy opslag nog nodig is.
- [ ] Kijk of API endpoints korter kunnen.
- [ ] Kijk of database velden logisch zijn.

## 16. State en reducer

- [ ] Maak de reducer kleiner.
- [ ] Splits de reducer in logische stukken.
- [ ] Maak acties makkelijk te lezen.
- [ ] Maak acties makkelijk te testen.
- [ ] Maak state updates voorspelbaar.
- [ ] Maak hydrate gedrag duidelijk.
- [ ] Maak add/update/delete gedrag strak.
- [ ] Maak sync gedrag apart en simpel.
- [ ] Maak harvest sync apart.
- [ ] Maak structure sync apart.
- [ ] Maak user sync apart.
- [ ] Maak active garden logica apart.
- [ ] Maak active user logica apart.
- [ ] Maak reducer geen dump plek.
- [ ] Maak reducer code korter.
- [ ] Maak reducer naming uniform.
- [ ] Maak reducer helper functies herbruikbaar.
- [ ] Maak state selectors apart.
- [ ] Maak derived data apart.
- [ ] Maak side effects niet in de reducer zelf.
- [ ] Maak reducer makkelijk te volgen.

## 17. Forms en partials

- [ ] Maak forms herbruikbaar.
- [ ] Maak inputs overal hetzelfde.
- [ ] Maak selects overal hetzelfde.
- [ ] Maak textareas overal hetzelfde.
- [ ] Maak labels overal hetzelfde.
- [ ] Maak hulptekst overal hetzelfde.
- [ ] Maak fouttekst overal hetzelfde.
- [ ] Maak modals overal hetzelfde.
- [ ] Maak cards overal hetzelfde.
- [ ] Maak list rows overal hetzelfde.
- [ ] Maak kleine detail blokken herbruikbaar.
- [ ] Maak formulieren minder lang.
- [ ] Maak formulieren minder druk.
- [ ] Maak formulieren makkelijker te scannen.
- [ ] Maak formulier acties standaard.
- [ ] Maak form layout vast en rustig.
- [ ] Maak form secties duidelijk.
- [ ] Maak form validatie vriendelijk.
- [ ] Maak form default waarden slim.
- [ ] Maak form state makkelijk te resetten.
- [ ] Maak partials klein genoeg voor begrip.

## 18. I18N en teksten

- [ ] Houd alle teksten op een centrale plek.
- [ ] Houd alle labels op een centrale plek.
- [ ] Houd alle foutmeldingen op een centrale plek.
- [ ] Houd alle knopteksten op een centrale plek.
- [ ] Houd alle status teksten op een centrale plek.
- [ ] Maak teksten kort en duidelijk.
- [ ] Maak teksten in het Nederlands extra goed.
- [ ] Maak Engels, Frans en Duits ook netjes.
- [ ] Maak geen losse tekst hardcoded in componenten.
- [ ] Maak geen halve vertalingen.
- [ ] Maak geen rare mengelmoes van talen.
- [ ] Maak nieuwe tekst eerst in i18n.
- [ ] Maak oude tekst later schoon.
- [ ] Maak admin/dev tekst ook vertaald als dat kan.
- [ ] Maak lege states ook vertaald.
- [ ] Maak helper labels ook vertaald.
- [ ] Maak status labels ook vertaald.
- [ ] Maak tab labels ook vertaald.
- [ ] Maak tooltips ook vertaald.
- [ ] Check of de taalwissel overal werkt.
- [ ] Check of de taalwissel geen stukken mist.

## 19. Toegankelijkheid

- [ ] Check kleurcontrast.
- [ ] Check knop groottes.
- [ ] Check focus staten.
- [ ] Check keyboard navigatie.
- [ ] Check modal focus trap.
- [ ] Check tab volgorde.
- [ ] Check aria labels.
- [ ] Check lege states voor screen readers.
- [ ] Check icon only knoppen.
- [ ] Check form fouten duidelijk.
- [ ] Check tekst niet te klein.
- [ ] Check hover niet de enige hint.
- [ ] Check drag functies ook begrijpelijk zijn.
- [ ] Check selecties ook met toetsenbord kunnen.
- [ ] Check mobiele bediening met grote vingers.
- [ ] Check dat kleuren niet de enige info zijn.
- [ ] Check dat status ook tekst heeft.
- [ ] Check dat warnings echt zichtbaar zijn.
- [ ] Check dat delete acties niet onduidelijk zijn.
- [ ] Check dat helper tekst niet verstopt zit.
- [ ] Check dat de app bruikbaar blijft zonder muis.

## 20. Mobiel en responsive

- [ ] Maak de sidebar mobiel vriendelijk.
- [ ] Maak kaarten mobiel vriendelijk.
- [ ] Maak forms mobiel vriendelijk.
- [ ] Maak de editor mobiel vriendelijk.
- [ ] Maak de dev panel mobiel vriendelijk.
- [ ] Maak de dashboard mobiel vriendelijk.
- [ ] Maak lijsten op kleine schermen rustiger.
- [ ] Maak tekst op kleine schermen niet te klein.
- [ ] Maak knoppen op kleine schermen niet te klein.
- [ ] Maak modals op kleine schermen netjes.
- [ ] Maak het scrollen logisch.
- [ ] Maak het keyboard op mobiel niet in de weg zitten.
- [ ] Maak horizontale overflow zo klein mogelijk.
- [ ] Maak brede tabellen of lijsten op mobiel alternatief.
- [ ] Maak schermen stap voor stap leesbaar.
- [ ] Maak grote acties onderaan goed bereikbaar.
- [ ] Maak sticky acties niet te dominant.
- [ ] Test portrait en landscape.
- [ ] Test smalle telefoonformaten.
- [ ] Test brede desktopformaten.

## 21. Fouten en laadschermen

- [ ] Maak loading states duidelijker.
- [ ] Maak error states vriendelijker.
- [ ] Maak retry gedrag duidelijker.
- [ ] Maak lege states mooier.
- [ ] Maak netwerk fouten begrijpelijk.
- [ ] Maak server fouten begrijpelijk.
- [ ] Maak validatie fouten begrijpelijk.
- [ ] Maak dev fouten niet te technisch.
- [ ] Maak boundary fouten netjes.
- [ ] Maak fallback schermen beter.
- [ ] Maak onverwachte data minder breekbaar.
- [ ] Maak undefined data minder breekbaar.
- [ ] Maak null data minder breekbaar.
- [ ] Maak component fouten beter zichtbaar.
- [ ] Maak data load mislukkingen duidelijk.
- [ ] Maak save mislukkingen duidelijk.
- [ ] Maak delete fouten duidelijk.
- [ ] Maak select fouten duidelijk.
- [ ] Maak link fouten duidelijk.
- [ ] Maak herstelpad altijd zichtbaar.

## 22. Prestatie

- [ ] Kijk welke renders te vaak gebeuren.
- [ ] Kijk welke lijsten te groot worden.
- [ ] Kijk welke data te vaak opnieuw berekend wordt.
- [ ] Kijk welke helpers puur kunnen blijven.
- [ ] Kijk welke berekeningen memo-achtig mogen worden.
- [ ] Kijk welke componenten te zwaar zijn.
- [ ] Kijk welke screens opnieuw laden zonder reden.
- [ ] Kijk welke modals onnodig veel doen.
- [ ] Kijk welke forms onnodig veel doen.
- [ ] Kijk welke editor acties zwaar zijn.
- [ ] Kijk welke kaarten virtueel zouden kunnen.
- [ ] Kijk of state updates kleiner kunnen.
- [ ] Kijk of derived data apart kan.
- [ ] Kijk of string building korter kan.
- [ ] Kijk of image of icon assets kleiner kunnen.
- [ ] Kijk of fonts niet te zwaar zijn.
- [ ] Kijk of dev panel niet alles tegelijk rendert.
- [ ] Kijk of grote lijsten gefilterd kunnen worden.
- [ ] Kijk of tabs lazy kunnen laden.
- [ ] Kijk of routes niet alles in een keer hoeven te bouwen.
- [ ] Kijk of het geheel soepel blijft.

## 23. Beveiliging en privacy

- [ ] Kijk welke data gevoelig is.
- [ ] Kijk welke data niet in plain text hoort.
- [ ] Kijk welke dev endpoints beschermd moeten zijn.
- [ ] Kijk welke debug functies publiek zijn.
- [ ] Kijk welke logs te veel tonen.
- [ ] Kijk welke config waarden geheim moeten blijven.
- [ ] Kijk welke tokens nooit in code moeten staan.
- [ ] Kijk welke credentials uit de repo moeten blijven.
- [ ] Kijk welke fallback waarden gevaarlijk zijn.
- [ ] Kijk welke sessie acties veilig zijn.
- [ ] Kijk welke reset acties extra bevestiging nodig hebben.
- [ ] Kijk welke delete acties extra bevestiging nodig hebben.
- [ ] Kijk welke API inputs gevalideerd moeten worden.
- [ ] Kijk welke outputs geschoond moeten worden.
- [ ] Kijk welke scripts alleen intern mogen draaien.
- [ ] Kijk welke dev tools achter een dev flag moeten.
- [ ] Kijk welke data export helder moet zijn.
- [ ] Kijk welke privacy teksten nodig zijn.
- [ ] Kijk of logging niet te veel persoonlijke data toont.
- [ ] Kijk of database toegang strak genoeg is.
- [ ] Kijk of uploads of prompts veilig blijven.

## 24. Tests en controle

- [ ] Maak een simpele test lijst voor de app.
- [ ] Test inloggen.
- [ ] Test uitloggen.
- [ ] Test scherm wissel.
- [ ] Test tuin aanmaken.
- [ ] Test tuin bewerken.
- [ ] Test tuin verwijderen.
- [ ] Test bed aanmaken.
- [ ] Test object aanmaken.
- [ ] Test plant aanmaken.
- [ ] Test plant bewerken.
- [ ] Test plant verwijderen.
- [ ] Test plant koppelen aan bed.
- [ ] Test plant koppelen aan serre.
- [ ] Test plant koppelen aan object.
- [ ] Test taak aanmaken.
- [ ] Test taak afvinken.
- [ ] Test dev panel tabs.
- [ ] Test mobile layout.
- [ ] Test save en reload.
- [ ] Test reset.
- [ ] Test data migratie.
- [ ] Test fout states.
- [ ] Test lege states.
- [ ] Test language switch.
- [ ] Test accessibility basics.

## 25. Opruimen en docs

- [ ] Verwijder dode code.
- [ ] Verwijder dubbele helpers.
- [ ] Verwijder oude commentaar dat niet meer klopt.
- [ ] Verwijder losse experimenten die niet meer nodig zijn.
- [ ] Verplaats logica naar goede bestanden.
- [ ] Verplaats UI naar goede componenten.
- [ ] Verplaats dev tools naar goede componenten.
- [ ] Verplaats form partjes naar goede componenten.
- [ ] Maak een korte README voor de structuur.
- [ ] Maak een korte README voor de dev panel.
- [ ] Maak een korte README voor de editor.
- [ ] Maak een korte README voor planten toevoegen.
- [ ] Maak een korte README voor koppelen aan objecten.
- [ ] Maak een korte README voor state en opslag.
- [ ] Maak een korte README voor routes.
- [ ] Houd dit planbestand up to date.
- [ ] Zet nieuwe bugs meteen in dit plan.
- [ ] Zet nieuwe UI wensen meteen in dit plan.
- [ ] Zet nieuwe cleanup taken meteen in dit plan.
- [ ] Zet nieuwe ideeën pas in een apart deel als het echt helpt.

## 26. Extra vaste aandachtspunten

- [ ] De serre in de moestuin moet selecteerbaar zijn bij planten.
- [ ] Objecten moeten makkelijker te kiezen zijn.
- [ ] Toewijzen moet minder stappen hebben.
- [ ] De dev panel moet vriendelijker zijn.
- [ ] De UI moet meer rust hebben.
- [ ] De UI moet meer lucht hebben.
- [ ] De UI moet moderne fonts krijgen.
- [ ] De UI moet mooiere cards krijgen.
- [ ] De UI moet nette blokken krijgen.
- [ ] De code moet netjes opgesplitst blijven.
- [ ] De code moet makkelijk leesbaar blijven.
- [ ] De code moet simpel te onderhouden blijven.
- [ ] De app moet sneller te begrijpen zijn.
- [ ] De app moet prettiger aanvoelen.
- [ ] De app moet minder druk ogen.
- [ ] De app moet minder foutgevoelig worden.
- [ ] De app moet beter testbaar worden.
- [ ] De app moet beter schaalbaar worden.
- [ ] De app moet minder monolithisch worden.
- [ ] De app moet klaar zijn voor verder werk in de komende maanden.

## 27. Concrete backlog voor de komende tijd

- [ ] Haal alle grote stukken uit `GardenGrid.jsx`.
- [ ] Maak `GardenGrid.jsx` een dunne startfile.
- [ ] Split de editor in aparte delen.
- [ ] Split de dev panel in aparte delen.
- [ ] Split forms in aparte delen.
- [ ] Split UI onderdelen in aparte delen.
- [ ] Split helpers in aparte delen.
- [ ] Maak theme bestand nog duidelijker.
- [ ] Maak constants bestand nog duidelijker.
- [ ] Maak seed data apart en schoon.
- [ ] Maak state logica apart en schoon.
- [ ] Maak routing apart en schoon.
- [ ] Maak planten toevoegen echt simpel.
- [ ] Maak object toewijzing echt simpel.
- [ ] Maak serre selectie echt zichtbaar.
- [ ] Maak cards mooier en rustiger.
- [ ] Maak headers duidelijker en mooier.
- [ ] Maak de sidebar strakker.
- [ ] Maak de dev panel echt bruikbaar.
- [ ] Maak de code basis klaar voor langere groei.

## 28. Wat we blijven volgen

- [ ] Of de UI rustiger wordt.
- [ ] Of de fonts moderner worden.
- [ ] Of cards en blokken beter aanvoelen.
- [ ] Of planten toevoegen sneller gaat.
- [ ] Of objecten koppelen makkelijker gaat.
- [ ] Of serres selecteerbaar zijn.
- [ ] Of de dev panel echt helpt.
- [ ] Of de code per stuk kleiner wordt.
- [ ] Of oude logica weg kan.
- [ ] Of de app duidelijker wordt voor niet-tech gebruikers.
- [ ] Of de app minder klikjes vraagt.
- [ ] Of de app minder zoeken vraagt.
- [ ] Of de app minder uitleg nodig heeft.
- [ ] Of de app beter werkt op mobiel.
- [ ] Of de app beter werkt op desktop.
- [ ] Of fouten sneller zichtbaar zijn.
- [ ] Of data minder rommelig wordt.
- [ ] Of de hele app rustiger en netter voelt.
- [ ] Of dit plan steeds bijgewerkt blijft.
- [ ] Of we nog iets missen tijdens het werken.
