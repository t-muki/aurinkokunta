# Toteutusmuistiinpanot

Nämä ovat mallin sisäisiä ratkaisuja ja niiden perusteluja. Käyttäjälle
tarkoitettu kuvaus on [README.md](README.md):ssä.

## Mittakaavatilojen vaihto

Kaikki pallot rakennetaan yksikkösäteisinä ja koko tulee skaalauksesta, joten
mittakaavatilan vaihto ei rakenna geometriaa uudelleen: päivitetään vain
skaalaukset, nimilappujen sijainnit ja ratapisteet. Saturnuksen rengas
skaalataan samalla kertoimella kuin planeetta.

Nimilappujen väli kappaleen pinnasta ilmaistaan Maan säteen monikertana, jotta
lappu asettuu samalle suhteelliselle etäisyydelle kaikissa tiloissa.

## Kiertoratojen piirtotarkkuus

Radat piirretään murtoviivana, jonka jänne oikaisee kaarta noin `R·π²/(2N²)`.
Täydessä mittakaavassa radan ja kappaleen kokojen suhde on jopa
180 000-kertainen, joten kiinteä 360 jakoa jättäisi viivan Maan radalla
0,9 Maan sädettä sisäpuolelle — eli planeetan reunaan. Jakojen määrä lasketaan
planeettakohtaisesti isoakselin puolikkaan ja kappaleen säteen suhteesta
(1 658–6 719 jakoa) niin, että oikaisu jää kahteen prosenttiin säteestä.
Mitattu poikkeama on 0,004–0,021 sädettä.

Kuun rataviiva lasketaan samasta kuuteoriasta kuin Kuun sijainti. Rata on
5,15° kallellaan ekliptikaan, joten tasoon piirretty ympyrä jätti Kuun jopa
20 Kuun sädettä sivuun. Viiva päivitetään, kun aika on siirtynyt yli
10 vuorokautta, koska nouseva solmu kiertää 18,6 vuodessa.

## Syvyyspuskuri ja leikkaustasot

Logaritminen syvyyspuskuri (`logarithmicDepthBuffer`) on pakollinen: täysi
mittakaava tarvitsee yhtä aikaa lähitason 0,005 ja kaukotason 2,5 · 10⁶
yksikköä.

Lähitaso lasketaan katse-etäisyydestä joka kehyksessä
(`katse-etäisyys · 10⁻³`, vähintään 0,005). Kiinteä lähitaso ei voi palvella
yhtä aikaa Kuun pintaa ja Neptunuksen rataa.

Taivaspallo seuraa kameraa eikä osallistu syvyyspuskuriin (`depthTest: false`,
`renderOrder = -1`). Kameran mukana liikkuminen poistaa tähtien virheellisen
parallaksin — tähdet ovat käytännössä äärettömän kaukana. Syvyyspuskurin
ulkopuolelle jättäminen on välttämätöntä, koska kaukotasolla syvyysarvot
saturoituvat ja osa pallon kolmioista jäisi piirtymättä.

## Piirto vain kun kuva muuttuu

Reaaliajassa näkymä on käytännössä liikkumaton: mitattuna nopeimman kappaleen
siirtymä on 0,001 pikseliä kymmenessä sekunnissa, eli yhteen pikseliin kuluisi
noin kolme tuntia. Saman kuvan piirtäminen sata kertaa sekunnissa on siis
pelkkää lämpöä.

Piirto tapahtuu, jos jokin pätee: kamera on liikkunut yli 0,3 pikseliä
ruudulla, kamera-animaatio tai ajan kelaus on kesken, aika on nopeutettu, jokin
tapahtuma on nostanut lipun (koon muutos, mittakaavan vaihto, tekstuurin
valmistuminen, taivaskartan vaihto), tai edellisestä piirrosta on yli 250 ms.
Viimeinen ehto on turvaverkko: vaikka jokin herätesignaali jäisi huomaamatta,
kuva korjautuu neljännessekunnissa.

Kameran liikkeen kynnys mitataan ruutupikseleinä eikä maailman yksiköinä, koska
mittakaavatilojen yksiköt eroavat kuusi kertaluokkaa. Samasta syystä
`OrbitControls.update()`-metodin paluuarvoa ei voi käyttää: sen kynnys on
absoluuttinen, ja kohteen seurannassa se palauttaa tosi joka kehyksellä.

Mitattu vaikutus (100 Hz näyttö, 4,2 Mpx kehyksessä):

| | Ennen | Jälkeen |
| --- | --- | --- |
| Piirtoja sekunnissa joutilaana | 100 | **4** |
| GPU-kuorma joutilaana | 59 % | **3,4 %** |
| Kameraa liikutettaessa | 100 | 100 (muuttumaton) |
| Nopeutetussa ajassa | 100 | 100 (muuttumaton) |

Silmukka pyörii edelleen joka ruudunpäivityksellä. Sen laskentaosuus —
kaikkien kahdeksan planeetan ja Kuun sijainnit — on mitattuna 1,9
mikrosekuntia eli 0,019 % kehysbudjetista, joten sen ohittamisesta ei olisi
mitattavaa hyötyä. Kuormasta lähes kaikki on täyttörajoitteista piirtoa
(1,28 ms/Mpx + 0,5 ms kiinteä).

## Tunnettu rajoite

Täydessä mittakaavassa Neptunus on 700 000 yksikön päässä, ja koska three.js
välittää matriisit `Float32Array`ina, sen sijainti kvantittuu 0,0625 yksikön
(398 km, 1,6 % planeetan säteestä) askeliin. Tämä voi näkyä nykimisenä, jos
Neptunusta katsoo läheltä suurella aikanopeudella. Korjaus olisi liukuva origo.
